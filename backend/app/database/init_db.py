"""
Database Initialization & Demo Seed Script
===========================================
Creates all database tables and seeds realistic demo data for presentation and viva testing.
"""

from datetime import datetime, timedelta, timezone
from app.database.session import engine, Base, SessionLocal
from app.models.user import User
from app.models.patient import Patient
from app.models.reading import HealthReading
from app.models.alert import Alert
from app.models.system_config import SystemConfig
from app.core.security import get_password_hash
import json

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Demo Users
        existing_user = db.query(User).filter(User.email == "doctor@hospital.org").first()
        if not existing_user:
            demo_doctor = User(
                name="Dr. Sameer Verma, MD",
                email="doctor@hospital.org",
                password_hash=get_password_hash("doctor123"),
                role="doctor"
            )
            demo_nurse = User(
                name="Nurse Ananya Deshmukh",
                email="nurse@hospital.org",
                password_hash=get_password_hash("nurse123"),
                role="nurse"
            )
            db.add_all([demo_doctor, demo_nurse])
            db.commit()
            print("[INFO] Seeded demo users: doctor@hospital.org / doctor123")

        # 2. Seed Demo Patients
        if db.query(Patient).count() == 0:
            demo_patients = [
                Patient(
                    patient_code="P-1001",
                    name="Rahul Kumar",
                    age=42,
                    gender="Male",
                    phone="+91 98765 43210",
                    email="rahul.kumar@example.com",
                    address="24 Indiranagar, Bangalore",
                    emergency_contact="Sunita Kumar (Wife) - +91 98765 43211",
                    medical_conditions="Post-operative Cardiac Monitoring, Stable",
                    room_number="ICU-102",
                    device_id="VIRTUAL_NODE_01"
                ),
                Patient(
                    patient_code="P-1002",
                    name="Priya Sharma",
                    age=29,
                    gender="Female",
                    phone="+91 98123 45678",
                    email="priya.sharma@example.com",
                    address="12 Green Park, New Delhi",
                    emergency_contact="Amit Sharma (Husband) - +91 98123 45679",
                    medical_conditions="Mild Bronchial Asthma, Periodic Desaturation",
                    room_number="W-204",
                    device_id="VIRTUAL_NODE_02"
                ),
                Patient(
                    patient_code="P-1003",
                    name="Arjun Reddy",
                    age=58,
                    gender="Male",
                    phone="+91 97654 32109",
                    email="arjun.reddy@example.com",
                    address="88 Jubilee Hills, Hyderabad",
                    emergency_contact="Radhika Reddy (Daughter) - +91 97654 32108",
                    medical_conditions="Hypertensive Heart Disease, Stage II",
                    room_number="CCU-05",
                    device_id="VIRTUAL_NODE_03"
                ),
                Patient(
                    patient_code="P-1004",
                    name="Sneha Rao",
                    age=34,
                    gender="Female",
                    phone="+91 99887 76655",
                    email="sneha.rao@example.com",
                    address="45 Malleswaram, Bangalore",
                    emergency_contact="Karthik Rao (Brother) - +91 99887 76654",
                    medical_conditions="Pyrexia of Unknown Origin (PUO)",
                    room_number="W-108",
                    device_id="VIRTUAL_NODE_04"
                ),
                Patient(
                    patient_code="P-1005",
                    name="Kiran Patel",
                    age=67,
                    gender="Male",
                    phone="+91 96543 21098",
                    email="kiran.patel@example.com",
                    address="15 Satellite Road, Ahmedabad",
                    emergency_contact="Meera Patel (Daughter) - +91 96543 21097",
                    medical_conditions="Chronic Obstructive Pulmonary Disease (COPD)",
                    room_number="ICU-105",
                    device_id="VIRTUAL_NODE_05"
                ),
            ]
            db.add_all(demo_patients)
            db.commit()
            print(f"[INFO] Seeded {len(demo_patients)} demo patients.")

            # 3. Seed historical readings for each patient (past 2 hours)
            now = datetime.now(timezone.utc)
            patients = db.query(Patient).all()
            for p in patients:
                # Generate 25 historical points
                for i in range(25, 0, -1):
                    t = now - timedelta(minutes=i * 5)
                    if p.name == "Rahul Kumar":
                        hr, spo2, temp = 74.0 + (i % 3), 98.0 + (i % 2) * 0.5, 36.7 + (i % 2) * 0.1
                        status = "NORMAL"
                    elif p.name == "Priya Sharma":
                        hr, spo2, temp = 82.0 + (i % 4), 94.0 - (i % 3) * 0.6, 36.8 + (i % 2) * 0.1
                        status = "WARNING" if spo2 < 95.0 else "NORMAL"
                    elif p.name == "Arjun Reddy":
                        hr, spo2, temp = 106.0 + (i % 5), 96.0 + (i % 2) * 0.4, 37.1 + (i % 2) * 0.2
                        status = "WARNING"
                    elif p.name == "Sneha Rao":
                        hr, spo2, temp = 92.0 + (i % 4), 97.0 + (i % 2) * 0.5, 38.2 + (i % 3) * 0.2
                        status = "WARNING" if temp >= 38.0 else "NORMAL"
                    else: # Kiran Patel
                        hr, spo2, temp = 88.0 + (i % 3), 92.0 + (i % 2) * 0.8, 36.6 + (i % 2) * 0.1
                        status = "WARNING"

                    db_reading = HealthReading(
                        patient_id=p.id,
                        device_id=p.device_id,
                        heart_rate=round(hr, 1),
                        spo2=round(spo2, 1),
                        temperature=round(temp, 1),
                        systolic_bp=120.0,
                        diastolic_bp=80.0,
                        respiratory_rate=16.0,
                        status=status,
                        analysis_reason="Baseline history record",
                        timestamp=t
                    )
                    db.add(db_reading)
            db.commit()
            print("[INFO] Seeded historical readings.")

            # 4. Seed a couple of initial sample alerts
            p2 = db.query(Patient).filter(Patient.name == "Priya Sharma").first()
            if p2:
                sample_alert = Alert(
                    patient_id=p2.id,
                    parameter="spo2",
                    value=93.2,
                    threshold_violated="Warning <= 94.9",
                    severity="WARNING",
                    title="WARNING SpO2 Desaturation Alert",
                    message="Low Oxygen Saturation: SpO2 93.2% is below normal target (95%)",
                    timestamp=now - timedelta(minutes=15)
                )
                db.add(sample_alert)
                db.commit()
                print("[INFO] Seeded demo alert.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database init error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
