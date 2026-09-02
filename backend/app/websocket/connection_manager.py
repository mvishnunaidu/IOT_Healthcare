"""
WebSocket Connection Hub
========================
Handles real-time WebSocket client connections from dashboard browsers,
providing broadcast and topic-based message distribution for live telemetry and alert notifications.
"""

from typing import List, Dict, Any, Set
from fastapi import WebSocket
import json
import logging
from datetime import datetime, timezone

logger = logging.getLogger("healthcare_iot.websocket")

class ConnectionManager:
    def __init__(self):
        # All active connected web clients
        self.active_connections: List[WebSocket] = []
        # Optional: Per-patient subscribed sockets
        self.patient_subscriptions: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        # Remove from any patient subscriptions
        for p_id in list(self.patient_subscriptions.keys()):
            self.patient_subscriptions[p_id].discard(websocket)
        logger.info(f"WebSocket client disconnected. Total active connections: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, data: Any):
        """
        Broadcasts an event message to all connected clients.
        """
        if not self.active_connections:
            return

        message = {
            "event": event_type,
            "data": data,
            "broadcast_time": datetime.now(timezone.utc).isoformat()
        }
        
        json_str = json.dumps(message, default=str)
        dead_connections = []

        for connection in self.active_connections:
            try:
                await connection.send_text(json_str)
            except Exception as e:
                logger.warning(f"Failed to send to WebSocket client: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)

    async def broadcast_reading(self, reading_dict: Dict[str, Any], detection_details: Dict[str, Any]):
        await self.broadcast("NEW_READING", {
            "reading": reading_dict,
            "detection": detection_details
        })

    async def broadcast_alert(self, alert_dict: Dict[str, Any]):
        await self.broadcast("NEW_ALERT", alert_dict)

    async def broadcast_simulator_status(self, status_dict: Dict[str, Any]):
        await self.broadcast("SIMULATOR_STATUS", status_dict)

manager = ConnectionManager()
