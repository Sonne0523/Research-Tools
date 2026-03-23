from fastapi import WebSocket
from typing import Dict, List
import asyncio
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = []
        self.active_connections[client_id].append(websocket)

    def disconnect(self, websocket: WebSocket, client_id: str):
        if client_id in self.active_connections:
            if websocket in self.active_connections[client_id]:
                self.active_connections[client_id].remove(websocket)
            if not self.active_connections[client_id]:
                del self.active_connections[client_id]

    async def close_all_connections(self):
        closed_count = 0
        for client_id in list(self.active_connections.keys()):
            for websocket in self.active_connections[client_id]:
                try:
                    await websocket.close()
                    closed_count += 1
                except Exception:
                    pass
        self.active_connections.clear()
        return closed_count

    def get_active_count(self) -> int:
        return sum(len(connections) for connections in self.active_connections.values())

    def get_all_connections_info(self) -> dict:
        return {
            "total_connections": self.get_active_count(),
            "clients": {
                client_id: {
                    "connection_count": len(connections),
                    "connections": ["websocket" for _ in connections]
                }
                for client_id, connections in self.active_connections.items()
            }
        }

    async def send_progress(self, client_id: str, page: int, total: int, progress: int, message: str = ""):
        if client_id in self.active_connections:
            data = json.dumps({
                "type": "progress",
                "page": page,
                "total": total,
                "progress": progress,
                "message": message
            })
            for connection in self.active_connections[client_id]:
                try:
                    await connection.send_text(data)
                except Exception:
                    pass

manager = ConnectionManager()
