from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from app.services import ai_service, ocr_service
from app.websocket_manager import manager
from app.api.auth import get_current_user
import logging
import anyio
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/analyze-paper/{client_id}")
async def analyze_paper_endpoint(client_id: str, file: UploadFile = File(...), user=Depends(get_current_user)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF paper.")
    
    logger.info(f"Received analysis request for client {client_id}, file: {file.filename}")
    contents = await file.read()
    logger.info(f"File read complete: {len(contents)} bytes")
    
    loop = asyncio.get_running_loop()
    # Thread-safe sync callback for the sync OCR function
    def progress_callback(page: int, total: int, progress: int):
        scaled_progress = int(progress * 0.5)
        asyncio.run_coroutine_threadsafe(
            manager.send_progress(client_id, page, total, scaled_progress, f"Reading document: Page {page} of {total}..."),
            loop
        )
        
    await manager.send_progress(client_id, 0, 100, 0, "Starting document analysis...")
    
    logger.info("Starting OCR process...")
    # First OCR the PDF to get text - Run in thread to not block event loop
    text = await anyio.to_thread.run_sync(ocr_service.ocr_pdf, contents, progress_callback)
    logger.info(f"OCR complete. Extracted {len(text)} characters.")
    
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
    
    loop = asyncio.get_running_loop()
    def progress_callback(page: int, total: int, progress: int):
        scaled_progress = int(progress * 0.5)
        asyncio.run_coroutine_threadsafe(
            manager.send_progress(client_id, page, total, scaled_progress, f"Reading document: Page {page} of {total}..."),
            loop
        )
        
    await manager.send_progress(client_id, 0, 100, 53, "Starting OCR process for summary...")
    # Run in thread to not block event loop
    text = await anyio.to_thread.run_sync(ocr_service.ocr_pdf, contents, progress_callback)
    logger.info(f"OCR complete. Extracted {len(text)} characters.")
    
    await manager.send_progress(client_id, 0, 100, 50, "Document read successfully. Generating summary...")
    summary = await ai_service.summarize_text(text)
    
    await manager.send_progress(client_id, 100, 100, 100, "Summary complete!")
    return {"summary": summary}

@router.post("/proposal-guide/{client_id}")
async def proposal_guide_endpoint(client_id: str, topic: str, user=Depends(get_current_user)):
    logger.info(f"Received proposal guide request for topic: {topic}")
    await manager.send_progress(client_id, 0, 100, 10, "Initializing AI agent...")
    await manager.send_progress(client_id, 0, 100, 30, "Researching topic and structuring guide...")
    
    guide = await ai_service.research_proposal_guide(topic)
    
    await manager.send_progress(client_id, 100, 100, 100, "Guide generation complete!")
    return {"guide": guide}
