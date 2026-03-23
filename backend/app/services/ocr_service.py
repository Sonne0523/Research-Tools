import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

def ocr_pdf(file_bytes: bytes, progress_callback=None) -> str:
    pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    total_pages = len(pdf_document)
    for page_num in range(total_pages):
        page = pdf_document.load_page(page_num)
        pix = page.get_pixmap()
        img = Image.open(io.BytesIO(pix.tobytes()))
        text = pytesseract.image_to_string(img)
        full_text += f"\n--- Page {page_num + 1} ---\n{text}"
        if progress_callback:
            progress = int(((page_num + 1) / total_pages) * 100)
            progress_callback(page_num + 1, total_pages, progress)
    return full_text

def create_searchable_pdf(file_bytes: bytes, progress_callback=None) -> bytes:
    # Use pytesseract to generate a PDF with text overlay
    # This is a basic 'sandwich' PDF approach
    pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
    output_pdf = fitz.open()
    total_pages = len(pdf_document)
    
    for page_num in range(total_pages):
        page = pdf_document.load_page(page_num)
        # Increase resolution for better OCR quality (300 DPI)
        mat = fitz.Matrix(300/72, 300/72)  # 300 DPI
        pix = page.get_pixmap(matrix=mat)
        # Generate OCR PDF page
        ocr_pdf_bytes = pytesseract.image_to_pdf_or_hocr(Image.open(io.BytesIO(pix.tobytes())), extension='pdf')
        ocr_page_doc = fitz.open(stream=ocr_pdf_bytes, filetype="pdf")
        output_pdf.insert_pdf(ocr_page_doc)
        
        if progress_callback:
            progress = int(((page_num + 1) / total_pages) * 100)
            progress_callback(page_num + 1, total_pages, progress)
            
    return output_pdf.tobytes()
