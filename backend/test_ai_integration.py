import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services import ai_service

async def test_all_endpoints():
    print("Starting AI Integration Verification...")
    
    # 1. Test Status
    print("\n[1] Testing AI Status...")
    status = await ai_service.get_agent_status()
    print(f"Status: {status}")
    assert status["agent_router_enabled"] is True
    assert "deepseek-v3.1" in status["model"]
    
    # 2. Test Summarization
    print("\n[2] Testing Summarization...")
    text = "The quick brown fox jumps over the lazy dog. This is a research paper about foxes and dogs."
    summary = await ai_service.summarize_text(text)
    print(f"Summary length: {len(summary)}")
    print(f"Summary preview: {summary[:100]}...")
    
    # 3. Test Analysis
    print("\n[3] Testing Analysis...")
    analysis = await ai_service.analyze_journal_paper(text)
    print(f"Analysis length: {len(analysis)}")
    
    # 4. Test Chat
    print("\n[4] Testing Chat...")
    chat_response = await ai_service.research_chat("What is this text about?", text)
    print(f"Chat Response: {chat_response}")

    print("\nVerification Complete!")

if __name__ == "__main__":
    asyncio.run(test_all_endpoints())
