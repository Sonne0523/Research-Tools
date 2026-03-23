import asyncio
import os
import sys
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

async def list_models():
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL", "https://agentrouter.org/v1")
    
    print(f"Checking models at {base_url}...")
    
    client = AsyncOpenAI(
        base_url=base_url,
        api_key=api_key
    )
    
    try:
        models = await client.models.list()
        print("\nAvailable Models:")
        for m in models.data:
            print(f"- {m.id}")
    except Exception as e:
        print(f"\nError listing models: {str(e)}")

if __name__ == "__main__":
    asyncio.run(list_models())
