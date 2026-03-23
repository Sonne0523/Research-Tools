from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

from app.api import tools, ai, auth
from app.websocket_manager import manager
from app.database import engine, Base
import app.models # Ensure models are loaded for Base.metadata

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Researcher Toolset API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Researcher Toolset API"}

# Include routers
from app.api import tools, ai, auth
app.include_router(tools.router, prefix="/api/tools", tags=["Tools"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

@app.websocket("/ws/progress/{client_id}")
async def websocket_progress(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            # Keep connection alive, wait for close
            data = await websocket.receive_text()
            # Echo back for ping/pong
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)

@app.post("/ws/close-all")
async def close_all_websocket_connections():
    """Close all active WebSocket connections"""
    closed_count = await manager.close_all_connections()
    return {"message": f"Closed {closed_count} connection(s)", "active_count": 0}

@app.get("/ws/status")
async def get_websocket_status():
    """Get current WebSocket connection status"""
    return {
        "active_connections": manager.get_active_count(),
        "clients": len(manager.active_connections)
    }

@app.get("/ws/connections")
async def get_all_connections():
    """Get detailed info about all active WebSocket connections"""
    return manager.get_all_connections_info()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
