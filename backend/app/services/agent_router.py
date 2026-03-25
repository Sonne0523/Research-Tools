"""
Agent Router Service for NVIDIA NIM AI integration.
Uses abacusai/dracarys-llama-3.1-70b-instruct via the NVIDIA NIM API with streaming.
"""
import os
import logging
from typing import Dict, Any
from dotenv import load_dotenv
from openai import AsyncOpenAI

# Force reload of .env
load_dotenv(override=True)

# Configure logging
logging.basicConfig(level=os.getenv("AGENT_LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)


class AgentRouter:
    """Router for AI tasks using NVIDIA NIM API (abacusai/dracarys-llama-3.1-70b-instruct)."""

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.base_url = os.getenv("OPENAI_BASE_URL", "https://integrate.api.nvidia.com/v1")
        self.model = os.getenv("AGENT_MODEL", "abacusai/dracarys-llama-3.1-70b-instruct")
        self.timeout = int(os.getenv("AGENT_TIMEOUT", "300"))

        if not self.api_key:
            logger.warning("OPENAI_API_KEY not found in environment variables")

    def get_client(self) -> AsyncOpenAI:
        """Get the NVIDIA NIM OpenAI-compatible async client."""
        return AsyncOpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            timeout=self.timeout,
        )

    async def route_task(self, task_type: str, prompt: str, context: str = "") -> str:
        """
        Send a task to NVIDIA NIM and collect the streamed response.

        Args:
            task_type: Type of task (for logging)
            prompt: The instruction / system prompt
            context: Optional context appended after the prompt

        Returns:
            Full AI response as a string
        """
        logger.info(f"Processing task '{task_type}' using model {self.model}")

        client = self.get_client()
        full_content = f"{prompt}\n\n{context}" if context else prompt

        try:
            stream = await client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": full_content}],
                temperature=0.5,
                top_p=1,
                max_tokens=8192,
                stream=True,
            )

            result_parts: list[str] = []

            async for chunk in stream:
                if not getattr(chunk, "choices", None):
                    continue
                delta = chunk.choices[0].delta
                if delta.content is not None:
                    result_parts.append(delta.content)

            return "".join(result_parts)

        except Exception as e:
            error_msg = f"Error in NVIDIA NIM ({task_type}): {str(e)}"
            logger.error(error_msg)
            return error_msg

    def list_agents(self) -> Dict[str, Any]:
        """Return the current model configuration (compatibility shim)."""
        return {
            "nvidia_nim_agent": {
                "provider": "nvidia-nim",
                "model": self.model,
                "base_url": self.base_url,
                "status": "ready",
            }
        }


# ---------------------------------------------------------------------------
# Global singleton
# ---------------------------------------------------------------------------
_agent_router_instance: AgentRouter | None = None


def get_agent_router() -> AgentRouter:
    """Get or create the global AgentRouter instance."""
    global _agent_router_instance
    if _agent_router_instance is None:
        _agent_router_instance = AgentRouter()
    return _agent_router_instance