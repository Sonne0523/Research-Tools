"""
Quick test for NVIDIA NIM abacusai/dracarys-llama-3.1-70b-instruct integration.
Run from: f:\Rseacher tools\backend\
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv(override=True)

API_KEY = os.getenv("OPENAI_API_KEY", "")
BASE_URL = os.getenv("OPENAI_BASE_URL", "https://integrate.api.nvidia.com/v1")
MODEL    = os.getenv("AGENT_MODEL", "abacusai/dracarys-llama-3.1-70b-instruct")

print("=" * 55)
print("  NVIDIA NIM - AI Integration Test")
print("=" * 55)
print(f"  Base URL : {BASE_URL}")
print(f"  Model    : {MODEL}")
print(f"  API Key  : {API_KEY[:12]}...{API_KEY[-4:]}" if len(API_KEY) > 16 else f"  API Key  : {'SET' if API_KEY else 'MISSING!'}")
print("=" * 55)

if not API_KEY:
    print("\n[ERROR] OPENAI_API_KEY is not set in .env - aborting.")
    sys.exit(1)

try:
    from openai import OpenAI
except ImportError:
    print("\n[ERROR] openai package not installed. Run: pip install openai")
    sys.exit(1)

client = OpenAI(base_url=BASE_URL, api_key=API_KEY)

print("\n[*] Sending test message: 'Reply with exactly: AI is working!'")
print("-" * 55)

try:
    completion = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": "Reply with exactly: AI is working!"}],
        temperature=0.5,
        top_p=1,
        max_tokens=64,
        stream=True,
    )

    content_buf = []
    for chunk in completion:
        if chunk.choices[0].delta.content is not None:
            content_buf.append(chunk.choices[0].delta.content)

    content_text = "".join(content_buf).strip()
    print(f"[Response]\n{content_text}")
    print("-" * 55)
    print("\n[SUCCESS] NVIDIA NIM AI integration is WORKING!")

except Exception as e:
    print(f"\n[FAILED] Error: {e}")
    sys.exit(1)
