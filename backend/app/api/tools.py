from fastapi import APIRouter, UploadFile, File, Form, HTTPException, WebSocket, Depends
from fastapi.responses import Response
from app.services import ocr_service, pdf_service, image_service, ai_service
from app.websocket_manager import manager
from typing import List
import asyncio
import anyio

from app.api.auth import get_current_user

from pydantic import BaseModel

router = APIRouter()

class ExportPDF(BaseModel):
    text: str

@router.post("/extract-text-progress/{client_id}")
async def extract_text_with_progress(
    client_id: str,
    file: UploadFile = File(...), 
    user=Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    contents = await file.read()
    
    loop = asyncio.get_running_loop()
    def progress_callback(page: int, total: int, progress: int):
        asyncio.run_coroutine_threadsafe(
            manager.send_progress(client_id, page, total, progress, f"Reading page {page} of {total}"),
            loop
        )
    
    await manager.send_progress(client_id, 0, 100, 0, "Starting text extraction...")
    text = await anyio.to_thread.run_sync(ocr_service.ocr_pdf, contents, progress_callback)
    await manager.send_progress(client_id, 100, 100, 100, "Complete!")
    
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
    
    loop = asyncio.get_running_loop()
    for i, file in enumerate(files):
        contents = await file.read()
        
        # Capture current file info for the closure
        curr_i = i
        total_f = len(files)
        
        def sync_cb(p, t, prog):
            # Scale progress: each file gets equal share of 50%
            file_share = 50 / total_f
            base_progress = curr_i * file_share
            scaled_progress = int(base_progress + (prog * (file_share / 100)))
            
            asyncio.run_coroutine_threadsafe(
                manager.send_progress(
                    client_id, p, t, scaled_progress, 
                    f"Reading document {curr_i + 1} of {total_f}: Page {p} of {t}..."
                ),
                loop
            )
            
        text = await anyio.to_thread.run_sync(ocr_service.ocr_pdf, contents, sync_cb)
        papers.append({"name": file.filename, "text": text})
    
    await manager.send_progress(client_id, 0, 100, 50, "All documents read successfully. Synthesizing...")
    synthesis = await ai_service.synthesize_papers(papers)
    
    await manager.send_progress(client_id, 100, 100, 100, "Synthesis complete!")
    return {"synthesis": synthesis}

@router.post("/ai/chat")
async def chat_endpoint(query: str = Form(...), paper_content: str = Form(...), user=Depends(get_current_user)):
    response = await ai_service.research_chat(query, paper_content)
    return {"response": response}


@router.post("/image-to-pdf")
async def image_to_pdf_endpoint(files: List[UploadFile] = File(...), user=Depends(get_current_user)):
    image_contents = []
    for file in files:
        image_contents.append(await file.read())
        
    pdf_data = await anyio.to_thread.run_sync(image_service.images_to_pdf, image_contents)
    return Response(
        content=pdf_data,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=converted.pdf"}
    )

@router.post("/export-pdf")
async def export_pdf_endpoint(data: ExportPDF, user=Depends(get_current_user)):
    if not data.text:
        raise HTTPException(status_code=400, detail="Text content is required.")
    
    pdf_bytes = await anyio.to_thread.run_sync(pdf_service.create_journal_pdf, data.text)
    
    return Response(
        content=bytes(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=journal_article.pdf"}
    )
