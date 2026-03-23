import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.ocr_service import ocr_pdf, create_searchable_pdf
import fitz  # PyMuPDF
from PIL import Image
import io

def test_ocr_limited_pages(max_pages=3):
    # Read the test PDF file
    pdf_path = "20th-Oct-2022-Evening-45-72.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"Error: File {pdf_path} not found")
        return False
    
    try:
        # Read PDF bytes
        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()
        
        print(f"Testing OCR on first {max_pages} pages of {pdf_path}...")
        print(f"File size: {len(pdf_bytes)} bytes")
        
        # Test the full create_searchable_pdf function but limit pages
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
        output_pdf = fitz.open()
        
        total_pages = len(pdf_document)
        pages_to_process = min(max_pages, total_pages)
        print(f"Document has {total_pages} pages, processing first {pages_to_process}")
        
        for page_num in range(pages_to_process):
            page = pdf_document.load_page(page_num)
            # Increase resolution for better OCR quality (300 DPI)
            mat = fitz.Matrix(300/72, 300/72)  # 300 DPI
            pix = page.get_pixmap(matrix=mat)
            print(f"Processing page {page_num + 1}: {pix.width} x {pix.height} pixels")
            
            # Generate OCR PDF page
            ocr_pdf_bytes = pytesseract.image_to_pdf_or_hocr(Image.open(io.BytesIO(pix.tobytes())), extension='pdf')
            ocr_page_doc = fitz.open(stream=ocr_pdf_bytes, filetype="pdf")
            output_pdf.insert_pdf(ocr_page_doc)
            
        result_bytes = output_pdf.tobytes()
        print(f"Searchable PDF ({pages_to_process} pages) size: {len(result_bytes)} bytes")
        
        # Save the searchable PDF for verification
        output_path = f"output_searchable_{pages_to_process}_pages.pdf"
        with open(output_path, 'wb') as f:
            f.write(result_bytes)
        print(f"Searchable PDF saved as: {output_path}")
        
        # Also test text extraction on first page
        print("\n--- Testing text extraction on first page ---")
        first_page = pdf_document.load_page(0)
        mat = fitz.Matrix(300/72, 300/72)
        pix = first_page.get_pixmap(matrix=mat)
        img = Image.open(io.BytesIO(pix.tobytes()))
        text = pytesseract.image_to_string(img)
        print(f"First page extracted text length: {len(text)} characters")
        if len(text.strip()) > 0:
            print("SUCCESS: Text extraction is working")
        else:
            print("WARNING: No text extracted from first page")
        
        print("\nLimited OCR test completed successfully!")
        return True
        
    except Exception as e:
        print(f"Error during OCR processing: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Import pytesseract here to avoid issues if not available
    try:
        import pytesseract
        print(f"Tesseract version: {pytesseract.get_tesseract_version()}")
    except ImportError:
        print("Error: pytesseract not available")
        sys.exit(1)
    
    success = test_ocr_limited_pages(max_pages=2)  # Test just 2 pages to be quick
    sys.exit(0 if success else 1)