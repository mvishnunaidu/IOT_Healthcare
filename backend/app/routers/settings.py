from fastapi import APIRouter, Body
from typing import Dict, Any
from app.services.abnormality_detector import abnormality_detector

router = APIRouter(prefix="/settings", tags=["System Settings & Thresholds"])

@router.get("/thresholds")
def get_current_thresholds() -> Dict[str, Any]:
    return abnormality_detector.get_thresholds()

@router.put("/thresholds")
def update_thresholds(new_thresholds: Dict[str, Any] = Body(...)):
    abnormality_detector.update_thresholds(new_thresholds)
    return {
        "message": "Threshold configuration updated successfully",
        "thresholds": abnormality_detector.get_thresholds()
    }
