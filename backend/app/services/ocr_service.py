import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

def ocr_pdf(file_bytes: bytes, progress_callback=None) -> str:
    with fitz.open(stream=file_bytes, filetype="pdf") as pdf_document:
        full_text = ""
        total_pages = len(pdf_document)
        for page_num in range(total_pages):
            page = pdf_document.load_page(page_num)
            
            # 1. Try native text extraction first (Fast)
            text = page.get_text().strip()
            
            # 2. If no text (less than 10 chars), fallback to OCR (Slow)
            if len(text) < 10:
                pix = page.get_pixmap()
                img_bytes = pix.tobytes()
                img = Image.open(io.BytesIO(img_bytes))
                text = pytesseract.image_to_string(img)
                
                # Cleanup
                img.close()
                del pix
                del img
                del img_bytes
            
            full_text += f"\n--- Page {page_num + 1} ---\n{text}"
            
            if progress_callback:
                progress = int(((page_num + 1) / total_pages) * 100)
                progress_callback(page_num + 1, total_pages, progress)
    return full_text

def create_searchable_pdf(file_bytes: bytes, progress_callback=None) -> bytes:
    with fitz.open(stream=file_bytes, filetype="pdf") as pdf_document:
        output_pdf = fitz.open()
        total_pages = len(pdf_document)
        
        for page_num in range(total_pages):
            page = pdf_document.load_page(page_num)
            mat = fitz.Matrix(300/72, 300/72) 
            pix = page.get_pixmap(matrix=mat)
            
            img_bytes = pix.tobytes()
            img = Image.open(io.BytesIO(img_bytes))
            ocr_pdf_bytes = pytesseract.image_to_pdf_or_hocr(img, extension='pdf')
            
            with fitz.open(stream=ocr_pdf_bytes, filetype="pdf") as ocr_page_doc:
                output_pdf.insert_pdf(ocr_page_doc)
            
            # Cleanup
            img.close()
            del pix
            del img
            del img_bytes
            
            if progress_callback:
                progress = int(((page_num + 1) / total_pages) * 100)
                progress_callback(page_num + 1, total_pages, progress)
                
        return output_pdf.tobytes()
