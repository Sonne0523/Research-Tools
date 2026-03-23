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
        smtp_port = int(os.getenv("SMTP_PORT", "465")) # Switch to SMTPS (Port 465)
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")

        logger.info(f"Connecting to SMTP server at {smtp_server}:{smtp_port} via SSL...")
        if smtp_user and smtp_pass:
            msg = MIMEMultipart()
            msg['From'] = smtp_user
            msg['To'] = admin_email
            msg['Subject'] = "New Feedback - Researcher AI"
            
            body = f"User: {request.user_email or 'Anonymous'}\n\nMessage:\n{request.message}"
            msg.attach(MIMEText(body, 'plain'))
            
            # Use SMTP_SSL for Port 465
            server = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=15)
            server.set_debuglevel(1)
            logger.info(f"Logging in as {smtp_user}...")
            server.login(smtp_user, smtp_pass)
            logger.info("Sending message...")
            server.send_message(msg)
            server.quit()
            logger.info("Feedback email notification sent successfully.")
        else:
            logger.error("SMTP credentials missing in .env - email notification skipped.")
            raise HTTPException(status_code=500, detail="SMTP credentials missing in .env")
            
    except Exception as e:
        logger.exception(f"Failed to send feedback email: {e}")
        raise HTTPException(status_code=500, detail=f"Feedback notification failed: {str(e)}")
        
    return {"status": "success", "message": "Thank you for your feedback!"}
