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

        logger.info(f"Attempting to send email from {smtp_user} to {admin_email} via {smtp_server}:{smtp_port}")
        if smtp_user and smtp_pass:
            msg = MIMEMultipart()
            msg['From'] = smtp_user
            msg['To'] = admin_email
            msg['Subject'] = "New Feedback - Researcher AI"
            
            body = f"User: {request.user_email or 'Anonymous'}\n\nMessage:\n{request.message}"
            msg.attach(MIMEText(body, 'plain'))
            
            logger.info(f"Connecting to SMTP server at {smtp_server}:{smtp_port} with timeout=15...")
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=15)
            server.set_debuglevel(1) # Enable SMTP debug output
            logger.info("Starting TLS...")
            server.starttls()
            logger.info(f"Logging in as {smtp_user}...")
            server.login(smtp_user, smtp_pass)
            logger.info("Sending message...")
            server.send_message(msg)
            server.quit()
            logger.info("Feedback email notification sent successfully.")
        else:
            logger.error("SMTP credentials missing in .env - email notification skipped.")
            return {"status": "partial_success", "message": "Feedback logged, but email credentials missing."}
            
    except Exception as e:
        logger.exception(f"Failed to send feedback email: {e}")
        return {"status": "error", "message": f"Feedback received but notification failed: {str(e)}"}
        
    return {"status": "success", "message": "Thank you for your feedback!"}
