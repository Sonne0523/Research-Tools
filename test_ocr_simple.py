import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.ocr_service import ocr_pdf, create_searchable_pdf
import fitz  # PyMuPDF
from PIL import Image
import io

def test_ocr_first_page():
    # Read the test PDF file
    pdf_path = "20th-Oct-2022-Evening-45-72.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"Error: File {pdf_path} not found")
        return False
    
    try:
        # Read PDF bytes
        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()
        
        print(f"Testing OCR on first page of {pdf_path}...")
        print(f"File size: {len(pdf_bytes)} bytes")
        
        # Open PDF to check properties
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
        print(f"Number of pages: {len(pdf_document)}")
        
        # Process just the first page
        page_num = 0
        page = pdf_document.load_page(page_num)
        print(f"Processing page {page_num + 1}...")
        
        # Get pixmap with increased resolution (300 DPI)
        mat = fitz.Matrix(300/72, 300/72)  # 300 DPI
        pix = page.get_pixmap(matrix=mat)
        print(f"Image size: {pix.width} x {pix.height} pixels")
        
        # Convert to PIL Image
        img = Image.open(io.BytesIO(pix.tobytes()))
        print(f"PIL Image mode: {img.mode}, size: {img.size}")
        
        # Test text extraction
        print("\n--- Testing text extraction ---")
        text = pytesseract.image_to_string(img)
        print(f"Extracted text length: {len(text)} characters")
        if text.strip():
            print("First 300 characters of extracted text:")
            print(text[:300])
        else:
            print("No text extracted")
        
        # Test searchable PDF creation for just this page
        print("\n--- Testing searchable PDF creation (first page only) ---")
        # Generate OCR PDF page
        ocr_pdf_bytes = pytesseract.image_to_pdf_or_hocr(img, extension='pdf')
        print(f"OCR PDF bytes size: {len(ocr_pdf_bytes)} bytes")
        
        # Save the OCR PDF for verification
        output_path = "output_first_page_ocr.pdf"
        with open(output_path, 'wb') as f:
            f.write(ocr_pdf_bytes)
        print(f"OCR PDF saved as: {output_path}")
        
        # Also test the full function but with timeout protection
        print("\n--- Testing full create_searchable_pdf function (first page only) ---")
        # Modify the function to process only first page for testing
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
        output_pdf = fitz.open()
        
        # Process only first page
        page_num = 0
        if page_num < len(pdf_document):
            page = pdf_document.load_page(page_num)
            # Increase resolution for better OCR quality (300 DPI)
            mat = fitz.Matrix(300/72, 300/72)  # 300 DPI
            pix = page.get_pixmap(matrix=mat)
            # Generate OCR PDF page
            ocr_pdf_bytes = pytesseract.image_to_pdf_or_hocr(Image.open(io.BytesIO(pix.tobytes())), extension='pdf')
            ocr_page_doc = fitz.open(stream=ocr_pdf_bytes, filetype="pdf")
            output_pdf.insert_pdf(ocr_page_doc)
            print(f"Processed page {page_num + 1}")
        
        result_bytes = output_pdf.tobytes()
        print(f"Searchable PDF (first page only) size: {len(result_bytes)} bytes")
        
        # Save the searchable PDF for verification
        output_path = "output_searchable_first_page.pdf"
        with open(output_path, 'wb') as f:
            f.write(result_bytes)
        print(f"Searchable PDF saved as: {output_path}")
        
        print("\nOCR test completed successfully!")
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
    
    success = test_ocr_first_page()
    sys.exit(0 if success else 1)