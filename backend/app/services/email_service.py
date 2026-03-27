import httpx
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Use absolute path to ensure .env is loaded correctly in all environments
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger(__name__)

# EmailJS Config
SERVICE_ID = os.getenv("VITE_EMAILJS_SERVICE_ID")
TEMPLATE_ID = os.getenv("VITE_EMAILJS_TEMPLATE_ID")
PUBLIC_KEY = os.getenv("VITE_EMAILJS_PUBLIC_KEY")

WELCOME_HTML_TEMPLATE = """
<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
    <!-- Header -->
    <div style="background-color: #ffffff; padding: 30px; border-bottom: 1px solid #f3f4f6; text-align: center;">
      <h1 style="color: #7B61FF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">Researcher.AI</h1>
    </div>
    
    <!-- Hero Section -->
    <div style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%);">
      <h2 style="color: #111827; margin: 0 0 16px; font-size: 24px; font-weight: 700;">Welcome to the Future of Research, {name}!</h2>
      <p style="color: #4b5563; margin: 0; font-size: 16px; line-height: 1.6;">We're thrilled to have you join our community of advanced academic investigators.</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <div style="background-color: #ffffff; border: 1px solid #7B61FF; border-left: 6px solid #7B61FF; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
        <h3 style="color: #7B61FF; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Getting Started</h3>
        <p style="color: #1f2937; margin: 0; font-size: 16px; font-weight: 500;">
          Your account is now active. You can start using our AI Synthesis, Journal Analysis, and AskYourPDF tools immediately.
        </p>
      </div>

      <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Researcher.AI is designed to empower senior researchers with tools that deconstruct complex papers, find PhD-level gaps, and accelerate literature reviews by up to 10x.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="https://researcher-ai-tools.vercel.app/" style="background-color: #7B61FF; color: #ffffff; padding: 16px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block;">Go to Dashboard</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #f3f4f6;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px;">&copy; 2026 Researcher.AI. All rights reserved.</p>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        You're receiving this because you've signed up for Researcher.AI.
      </p>
    </div>
  </div>
</div>
"""

async def send_welcome_email(to_email: str, name: str):
    """
    Send a welcome email using EmailJS REST API.
    """
    if not all([SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY]):
        logger.error(f"EmailJS configuration missing. Service: {SERVICE_ID}, Template: {TEMPLATE_ID}, Public: {PUBLIC_KEY}")
        return False

    url = "https://api.emailjs.com/api/v1.0/email/send"
    
    # Use simple replacement instead of .format() to avoid issues with nesting braces in HTML/CSS
    final_html = WELCOME_HTML_TEMPLATE.replace("{name}", name)

    payload = {
        "service_id": SERVICE_ID,
        "template_id": TEMPLATE_ID,
        "user_id": PUBLIC_KEY,
        "template_params": {
            "from_name": "Researcher.AI Team",
            "to_email": to_email,
            "reply_to": "support@researcher.ai",
            "subject": "Welcome to Researcher.AI!",
            "message_html": final_html
        }
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                logger.info(f"Welcome email sent successfully to {to_email}")
                return True
            else:
                logger.error(f"EmailJS API Error (Status {response.status_code}): {response.text}")
                return False
    except Exception as e:
        logger.error(f"Exception during email send: {str(e)}")
        return False
