from fastapi import APIRouter, UploadFile, File, Form, HTTPException, WebSocket, Depends
from fastapi.responses import Response
from app.services import ocr_service, pdf_service, image_service, ai_service
from app.websocket_manager import manager
from typing import List
import asyncio

from app.api.auth import get_current_user

router = APIRouter()

@router.post("/ocr")
async def ocr_endpoint(
    file: UploadFile = File(...), 
    advanced: bool = Form(False), 
    latex: bool = Form(False),
    searchable: bool = Form(False),
    user=Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for OCR.")
    
    contents = await file.read()
    
    if searchable:
        pdf_bytes = ocr_service.create_searchable_pdf(contents)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=searchable_{file.filename}"}
        )
    
    text = ocr_service.ocr_pdf(contents)
    
    if latex:
        text = await ai_service.extract_formulas_as_latex(text)
    elif advanced:
        text = await ai_service.correct_ocr_text(text)
        
    return {"filename": file.filename, "text": text}

@router.post("/ocr-progress/{client_id}")
async def ocr_with_progress(
    client_id: str,
    file: UploadFile = File(...), 
    advanced: bool = Form(False), 
    latex: bool = Form(False),
    searchable: bool = Form(False),
    user=Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for OCR.")
    
    contents = await file.read()
    
    async def progress_callback(page: int, total: int, progress: int):
        await manager.send_progress(
            client_id, 
            page, 
            total, 
            progress, 
            f"Processing page {page} of {total}"
        )
    
    if searchable:
        await manager.send_progress(client_id, 0, 100, 0, "Starting OCR with searchable PDF generation...")
        pdf_bytes = ocr_service.create_searchable_pdf(contents, progress_callback)
        await manager.send_progress(client_id, 100, 100, 100, "Complete!")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=searchable_{file.filename}"}
        )
    
    await manager.send_progress(client_id, 0, 100, 0, "Starting OCR text extraction...")
    text = ocr_service.ocr_pdf(contents, progress_callback)
    await manager.send_progress(client_id, 100, 100, 100, "Complete!")
    
    if latex:
        text = await ai_service.extract_formulas_as_latex(text)
    elif advanced:
        text = await ai_service.correct_ocr_text(text)
        
    return {"filename": file.filename, "text": text}

@router.post("/ai/summarize")
async def summarize(file: UploadFile = File(...), user=Depends(get_current_user)):
    text = await extract_text_from_pdf(file)
    summary = await ai_service.summarize_text(text)
    return {"summary": summary}

@router.post("/ai/synthesize/{client_id}")
async def synthesize(client_id: str, files: list[UploadFile] = File(...), user=Depends(get_current_user)):
    papers = []
    
    # Progress callback for OCR
    async def progress_callback(page: int, total: int, progress: int, current_file_index: int, total_files: int):
        # Scale progress: each file gets equal share of 50%
        file_share = 50 / total_files
        base_progress = current_file_index * file_share
        scaled_progress = int(base_progress + (progress * (file_share / 100)))
        
        await manager.send_progress(
            client_id, page, total, scaled_progress, 
            f"Reading document {current_file_index + 1} of {total_files}: Page {page} of {total}..."
        )
        
    await manager.send_progress(client_id, 0, 100, 0, f"Starting synthesis of {len(files)} papers...")
    
    for i, file in enumerate(files):
        contents = await file.read()
        # Create a closure to capture the current file index
        async def make_cb():
            curr_i = i
            async def cb(p, t, prog):
                await progress_callback(p, t, prog, curr_i, len(files))
            return cb
            
        cb = await make_cb()
        text = ocr_service.ocr_pdf(contents, cb)
        papers.append({"name": file.filename, "text": text})
    
    await manager.send_progress(client_id, 0, 100, 50, "All documents read successfully. Synthesizing...")
    synthesis = await ai_service.synthesize_papers(papers)
    
    await manager.send_progress(client_id, 100, 100, 100, "Synthesis complete!")
    return {"synthesis": synthesis}

@router.post("/ai/chat")
async def chat_endpoint(query: str = Form(...), paper_content: str = Form(...), user=Depends(get_current_user)):
    response = await ai_service.research_chat(query, paper_content)
    return {"response": response}

@router.post("/compress")
async def compress_endpoint(file: UploadFile = File(...), user=Depends(get_current_user)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    contents = await file.read()
    compressed_data = pdf_service.compress_pdf(contents)
    
    return Response(
        content=compressed_data,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=compressed_{file.filename}"}
    )

@router.post("/image-to-pdf")
async def image_to_pdf_endpoint(files: List[UploadFile] = File(...), user=Depends(get_current_user)):
    image_contents = []
    for file in files:
        image_contents.append(await file.read())
        
    pdf_data = image_service.images_to_pdf(image_contents)
    return Response(
        content=pdf_data,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=converted.pdf"}
    )

@router.post("/export-pdf")
async def export_pdf_endpoint(data: dict, user=Depends(get_current_user)):
    text = data.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Text content is required.")
    
    pdf_bytes = pdf_service.create_journal_pdf(text)
    
    return Response(
        content=bytes(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=journal_article.pdf"}
    )
