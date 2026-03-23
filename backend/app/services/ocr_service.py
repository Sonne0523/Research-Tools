import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import logging
import gc
from typing import Callable, Optional

logger = logging.getLogger(__name__)

def ocr_pdf(file_bytes: bytes, progress_callback: Optional[Callable] = None) -> str:
    logger.info("Starting sequential OCR text extraction...")
    full_text = ""
    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as pdf_document:
            total_pages = len(pdf_document)
            for page_num in range(total_pages):
                logger.info(f"OCR: Processing page {page_num + 1} of {total_pages}")
                page = pdf_document.load_page(page_num)
                
                # 1. Try native text extraction first (Fast)
                text = page.get_text().strip()
                
                # 2. If no text (less than 10 chars), fallback to OCR (Slow)
                if len(text) < 10:
                    logger.info(f"OCR: Low native text on page {page_num+1}, using Tesseract")
                    pix = page.get_pixmap()
                    img_bytes = pix.tobytes()
                    img = Image.open(io.BytesIO(img_bytes))
                    text += f"\n{pytesseract.image_to_string(img)}"
                    img.close()
                    pix = None # Explicitly clear large pixmap
                
                full_text += f"\n--- Page {page_num + 1} ---\n{text}"
                
                if progress_callback:
                    progress = int(((page_num + 1) / total_pages) * 100)
                    progress_callback(page_num + 1, total_pages, progress)
                
                # Periodic GC to keep memory low on free tiers
                if page_num % 5 == 0:
                    gc.collect()
                    
        return full_text
    except Exception as e:
        logger.error(f"OCR Error: {str(e)}")
        raise e

def create_searchable_pdf(file_bytes: bytes, progress_callback: Optional[Callable] = None) -> bytes:
    logger.info("Starting sequential searchable PDF generation...")
    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as pdf_document:
            output_pdf = fitz.open()
            total_pages = len(pdf_document)
            
            for page_num in range(total_pages):
                logger.info(f"Searchable PDF: Processing page {page_num + 1} of {total_pages}")
                page = pdf_document.load_page(page_num)
                mat = fitz.Matrix(300/72, 300/72) 
                pix = page.get_pixmap(matrix=mat)
                
                img_bytes = pix.tobytes()
                img = Image.open(io.BytesIO(img_bytes))
                ocr_pdf_bytes = pytesseract.image_to_pdf_or_hocr(img, extension='pdf')
                
                with fitz.open(stream=ocr_pdf_bytes, filetype="pdf") as ocr_page_doc:
                    output_pdf.insert_pdf(ocr_page_doc)
                
                img.close()
                pix = None # Explicitly clear large pixmap
                
                if progress_callback:
                    progress = int(((page_num + 1) / total_pages) * 100)
                    progress_callback(page_num + 1, total_pages, progress)
                
                if page_num % 5 == 0:
                    gc.collect()
                    
            return output_pdf.tobytes()
    except Exception as e:
        logger.error(f"Searchable PDF Error: {str(e)}")
        raise e
