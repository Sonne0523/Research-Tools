import asyncio
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv(override=True)

async def test_nvidia():
    api_key = os.getenv("OPENAI_API_KEY", "")
    base_url = os.getenv("OPENAI_BASE_URL", "https://integrate.api.nvidia.com/v1")
    model = os.getenv("AGENT_MODEL", "meta/llama-3.1-70b-instruct")
    
    print(f"Testing NVIDIA NIM with model: {model}")
    print(f"Base URL: {base_url}")
    
    client = AsyncOpenAI(
        base_url=base_url,
        api_key=api_key,
    )
    
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Hello, are you online?"}],
            max_tokens=10,
        )
        print("Response received successfully!")
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_nvidia())
