from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging_config import logger
from app.database.init_db import init_db
from app.websocket.connection_manager import manager
from app.routers import auth, patients, readings, alerts, simulation, architecture, settings as sys_settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing IoT Healthcare Database and Demo Records...")
    init_db()
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down IoT Healthcare Backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="IoT-Enabled Real-Time Healthcare Monitoring and Abnormality Detection System Backend API",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)
app.include_router(readings.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)
app.include_router(architecture.router, prefix=settings.API_V1_STR)
app.include_router(sys_settings.router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["System Health"])
def health_check():
    return {
        "status": "healthy",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "architecture": "Software-Simulated IoT Pipeline"
    }

# WebSocket Real-Time Endpoint
@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive client messages / keep-alive pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket connection error: {e}")
        manager.disconnect(websocket)
