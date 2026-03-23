import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import concurrent.futures
from typing import Callable, Optional

def _process_page_text(page_data: tuple) -> str:
    page_num, page_bytes = page_data
    with fitz.open(stream=page_bytes, filetype="pdf") as doc:
        page = doc.load_page(0)
        # 1. Try native text extraction first (Fast)
        text = page.get_text().strip()
        
        # 2. If no text (less than 10 chars), fallback to OCR (Slow)
        if len(text) < 10:
            pix = page.get_pixmap()
            img_bytes = pix.tobytes()
            img = Image.open(io.BytesIO(img_bytes))
            text = pytesseract.image_to_string(img)
            img.close()
            
        return f"\n--- Page {page_num + 1} ---\n{text}"

def ocr_pdf(file_bytes: bytes, progress_callback: Optional[Callable] = None) -> str:
    with fitz.open(stream=file_bytes, filetype="pdf") as pdf_document:
        total_pages = len(pdf_document)
        # Prepare page data for parallel processing
        pages_to_process = []
        for i in range(total_pages):
            # Create a 1-page PDF for each page to process in isolated threads
            # This is safer than sharing a single fitz.Document across threads
            page_pdf = fitz.open()
            page_pdf.insert_pdf(pdf_document, from_page=i, to_page=i)
            pages_to_process.append((i, page_pdf.tobytes()))
            page_pdf.close()

    results = [None] * total_pages
    completed = 0

    # Optimal worker count (min of pages and 4 for standard server environments)
    max_workers = min(total_pages, 4)
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_page = {executor.submit(_process_page_text, data): data[0] for data in pages_to_process}
        for future in concurrent.futures.as_completed(future_to_page):
            page_num = future_to_page[future]
            try:
                results[page_num] = future.result()
            except Exception as e:
                results[page_num] = f"\n--- Page {page_num + 1} Error ---\n{str(e)}"
            
            completed += 1
            if progress_callback:
                progress = int((completed / total_pages) * 100)
                progress_callback(completed, total_pages, progress)

    return "".join(results)

def _process_page_searchable(page_data: tuple) -> bytes:
    page_num, page_bytes = page_data
    with fitz.open(stream=page_bytes, filetype="pdf") as doc:
        page = doc.load_page(0)
        mat = fitz.Matrix(300/72, 300/72) 
        pix = page.get_pixmap(matrix=mat)
        
        img_bytes = pix.tobytes()
        img = Image.open(io.BytesIO(img_bytes))
        ocr_pdf_bytes = pytesseract.image_to_pdf_or_hocr(img, extension='pdf')
        img.close()
        return ocr_pdf_bytes

def create_searchable_pdf(file_bytes: bytes, progress_callback: Optional[Callable] = None) -> bytes:
    with fitz.open(stream=file_bytes, filetype="pdf") as pdf_document:
        total_pages = len(pdf_document)
        pages_to_process = []
        for i in range(total_pages):
            page_pdf = fitz.open()
            page_pdf.insert_pdf(pdf_document, from_page=i, to_page=i)
            pages_to_process.append((i, page_pdf.tobytes()))
            page_pdf.close()

    page_pdfs = [None] * total_pages
    completed = 0
    max_workers = min(total_pages, 4)

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_page = {executor.submit(_process_page_searchable, data): data[0] for data in pages_to_process}
        for future in concurrent.futures.as_completed(future_to_page):
            page_num = future_to_page[future]
            page_pdfs[page_num] = future.result()
            
            completed += 1
            if progress_callback:
                progress = int((completed / total_pages) * 100)
                progress_callback(completed, total_pages, progress)

    output_pdf = fitz.open()
    for ocr_page_bytes in page_pdfs:
        with fitz.open(stream=ocr_page_bytes, filetype="pdf") as ocr_page_doc:
            output_pdf.insert_pdf(ocr_page_doc)
            
    return output_pdf.tobytes()
