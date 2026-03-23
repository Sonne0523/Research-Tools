from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from app.services import ai_service, ocr_service
from app.websocket_manager import manager
from app.api.auth import get_current_user

router = APIRouter()

@router.post("/analyze-paper/{client_id}")
async def analyze_paper_endpoint(client_id: str, file: UploadFile = File(...), user=Depends(get_current_user)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF paper.")
    
    contents = await file.read()
    
    # Progress callback for OCR
    async def progress_callback(page: int, total: int, progress: int):
        # Scale OCR progress to 0-50%
        scaled_progress = int(progress * 0.5)
        await manager.send_progress(
            client_id, page, total, scaled_progress, f"Reading document: Page {page} of {total}..."
        )
        
    await manager.send_progress(client_id, 0, 100, 0, "Starting document analysis...")
    
    # First OCR the PDF to get text
    text = ocr_service.ocr_pdf(contents, progress_callback)
    
    await manager.send_progress(client_id, 0, 100, 50, "Document read successfully. Analyzing with AI...")
    
    # Then analyze with AI
    analysis = await ai_service.analyze_journal_paper(text)
    
    await manager.send_progress(client_id, 100, 100, 100, "Analysis complete!")
    return {"analysis": analysis}

@router.post("/summarize/{client_id}")
async def summarize_endpoint(client_id: str, file: UploadFile = File(...), user=Depends(get_current_user)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF.")
    
    contents = await file.read()
    
    async def progress_callback(page: int, total: int, progress: int):
        scaled_progress = int(progress * 0.5)
        await manager.send_progress(
            client_id, page, total, scaled_progress, f"Reading document: Page {page} of {total}..."
        )
        
    await manager.send_progress(client_id, 0, 100, 0, "Starting summarization...")
    text = ocr_service.ocr_pdf(contents, progress_callback)
    
    await manager.send_progress(client_id, 0, 100, 50, "Document read successfully. Generating summary...")
    summary = await ai_service.summarize_text(text)
    
    await manager.send_progress(client_id, 100, 100, 100, "Summary complete!")
    return {"summary": summary}

@router.post("/proposal-guide/{client_id}")
async def proposal_guide_endpoint(client_id: str, topic: str, user=Depends(get_current_user)):
    await manager.send_progress(client_id, 0, 100, 10, "Initializing AI agent...")
    await manager.send_progress(client_id, 0, 100, 30, "Researching topic and structuring guide...")
    
    guide = await ai_service.research_proposal_guide(topic)
    
    await manager.send_progress(client_id, 100, 100, 100, "Guide generation complete!")
    return {"guide": guide}
