import io
import fitz
from fpdf import FPDF
import markdown2
from bs4 import BeautifulSoup
import re

def compress_pdf(pdf_bytes: bytes):
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    output_stream = io.BytesIO()
    doc.save(output_stream, garbage=4, deflate=True)
    compressed_data = output_stream.getvalue()
    doc.close()
    return compressed_data

class JournalPDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, 'Researcher Toolset - Academic Summary', 0, 0, 'C')
        self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def create_journal_pdf(text: str):
    # Sanitize Unicode characters that aren't in the standard Times Latin-1 range
    # Specifically em-dashes, smart quotes, etc.
    replacements = {
        '\u2013': '-', # en-dash
        '\u2014': '-', # em-dash
        '\u2018': "'", # left single quote
        '\u2019': "'", # right single quote
        '\u201c': '"', # left double quote
        '\u201d': '"', # right double quote
        '\u2022': '-', # bullet point
        '\u2026': '...', # ellipsis
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)

    pdf = JournalPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()
    
    # Process Markdown to HTML
    html = markdown2.markdown(text, extras=['tables', 'fenced-code-blocks'])
    soup = BeautifulSoup(html, 'html.parser')
    
    for element in soup.children:
        if element.name == 'h1':
            pdf.set_font('times', 'B', 18)
            pdf.multi_cell(0, 10, element.text.strip())
            pdf.ln(5)
            # Add a divider line for the title
            pdf.line(pdf.get_x(), pdf.get_y(), pdf.get_x() + 190, pdf.get_y())
            pdf.ln(10)
        elif element.name in ['h2', 'h3']:
            pdf.ln(5)
            pdf.set_font('times', 'B', 14)
            pdf.multi_cell(0, 10, element.text.strip().upper())
            pdf.ln(3)
        elif element.name == 'p':
            pdf.set_font('times', '', 11)
            # Check if it's metadata (Author/Year)
            if 'Author:' in element.text or 'Year:' in element.text:
                pdf.set_font('times', 'I', 11)
            pdf.multi_cell(0, 6, element.text.strip())
            pdf.ln(4)
        elif element.name in ['ul', 'ol']:
            pdf.set_font('times', '', 11)
            for li in element.find_all('li'):
                pdf.cell(10) # Indent
                pdf.multi_cell(0, 6, f"- {li.text.strip()}")
                pdf.ln(2)
            pdf.ln(4)
        elif element.name == 'table':
            pdf.set_font('times', 'B', 10)
            # Basic table implementation
            rows = element.find_all('tr')
            if not rows: continue
            
            # Determine column widths (basic)
            col_width = 190 / len(rows[0].find_all(['th', 'td']))
            
            for row in rows:
                cols = row.find_all(['th', 'td'])
                if not cols: continue
                # Calculate required height for the row
                max_h = 6
                for col in cols:
                    # Rough estimate of line count
                    lines = pdf.get_string_width(col.text.strip()) / col_width
                    max_h = max(max_h, (int(lines) + 1) * 6)
                
                # Check for page break
                if pdf.get_y() + max_h > 270:
                    pdf.add_page()
                
                # Draw row
                x_start = pdf.get_x()
                for col in cols:
                    is_header = col.name == 'th'
                    if is_header: pdf.set_font('times', 'B', 10)
                    else: pdf.set_font('times', '', 10)
                    
                    curr_y = pdf.get_y()
                    pdf.multi_cell(col_width, 6, col.text.strip(), border=1)
                    pdf.set_xy(pdf.get_x() + col_width, curr_y)
                pdf.ln(max_h)

    return pdf.output()
