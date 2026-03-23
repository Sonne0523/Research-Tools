from PIL import Image
from reportlab.pdfgen import canvas
import io

def images_to_pdf(image_list: list[bytes]):
    output_stream = io.BytesIO()
    c = canvas.Canvas(output_stream)
    
    for img_bytes in image_list:
        img = Image.open(io.BytesIO(img_bytes))
        width, height = img.size
        
        # Adjust canvas size to image size
        c.setPageSize((width, height))
        
        # In-memory image for reportlab
        # Reportlab doesn't directly take PIL images easily without temp files or ImageReader
        from reportlab.lib.utils import ImageReader
        reader = ImageReader(img)
        
        c.drawImage(reader, 0, 0, width, height)
        c.showPage()
        
    c.save()
    return output_stream.getvalue()
