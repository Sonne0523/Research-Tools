from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

router = APIRouter()
logger = logging.getLogger(__name__)

class FeedbackRequest(BaseModel):
    user_email: str | None = None
    message: str

@router.post("")
async def submit_feedback(request: FeedbackRequest):
    logger.info(f"Received feedback: {request.message} from {request.user_email or 'Anonymous'}")
    
    admin_email = os.getenv("ADMIN_EMAIL")
    if not admin_email:
        logger.warning("Feedback received but ADMIN_EMAIL not set in .env")
        return {"status": "success", "message": "Feedback received (logged to server)"}

    # Attempt to send email notification
    try:
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")

        if smtp_user and smtp_pass:
            msg = MIMEMultipart()
            msg['From'] = smtp_user
            msg['To'] = admin_email
            msg['Subject'] = "New Feedback - Researcher AI"
            
            body = f"User: {request.user_email or 'Anonymous'}\n\nMessage:\n{request.message}"
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            server.quit()
            logger.info("Feedback email notification sent successfully.")
        else:
            logger.warning("SMTP credentials missing in .env - email notification skipped.")
            
    except Exception as e:
        logger.error(f"Failed to send feedback email: {e}")
        # We still return success to the user as the feedback was logged
        
    return {"status": "success", "message": "Thank you for your feedback!"}
