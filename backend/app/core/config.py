import os
from pydantic_settings import BaseSettings
from typing import List, Dict, Any

class Settings(BaseSettings):
    PROJECT_NAME: str = "IoT-Enabled Real-Time Healthcare Monitoring System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = "healthcare_iot_secret_key_change_in_production_2026_super_secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Database
    # Defaults to SQLite local file in backend directory, but supports PostgreSQL if DATABASE_URL is set
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'healthcare_iot.db').replace(chr(92), '/')}"
    )
    
    # Default Rule-Based Abnormality Thresholds
    DEFAULT_THRESHOLDS: Dict[str, Any] = {
        "heart_rate": {
            "normal_min": 60.0,
            "normal_max": 100.0,
            "warning_low": 50.0,
            "warning_high": 120.0,
            "critical_low": 45.0,
            "critical_high": 130.0,
            "unit": "BPM",
            "name": "Heart Rate"
        },
        "spo2": {
            "normal_min": 95.0,
            "normal_max": 100.0,
            "warning_low": 90.0,
            "warning_high": 94.9,
            "critical_low": 89.9,
            "critical_high": 100.0,
            "unit": "%",
            "name": "SpO2 (Oxygen Saturation)"
        },
        "temperature": {
            "normal_min": 36.5,
            "normal_max": 37.5,
            "warning_low": 35.5,
            "warning_high": 38.3,
            "critical_low": 35.0,
            "critical_high": 38.8,
            "unit": "°C",
            "name": "Body Temperature"
        },
        "systolic_bp": {
            "normal_min": 90.0,
            "normal_max": 120.0,
            "warning_low": 85.0,
            "warning_high": 139.0,
            "critical_low": 80.0,
            "critical_high": 140.0,
            "unit": "mmHg",
            "name": "Systolic Blood Pressure"
        },
        "diastolic_bp": {
            "normal_min": 60.0,
            "normal_max": 80.0,
            "warning_low": 55.0,
            "warning_high": 89.0,
            "critical_low": 50.0,
            "critical_high": 90.0,
            "unit": "mmHg",
            "name": "Diastolic Blood Pressure"
        },
        "respiratory_rate": {
            "normal_min": 12.0,
            "normal_max": 20.0,
            "warning_low": 10.0,
            "warning_high": 24.0,
            "critical_low": 8.0,
            "critical_high": 28.0,
            "unit": "breaths/min",
            "name": "Respiratory Rate"
        }
    }

    model_config = {"case_sensitive": True, "env_file": ".env"}

settings = Settings()
