from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserLogin, TokenResponse, UserResponse, UserCreate
from app.core.security import verify_password, create_access_token, get_password_hash

router = APIRouter(prefix="/auth", tags=["Authentication"])

DEFAULT_PASSWORD = "iot@123"

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # If user doesn't exist yet, auto-provision user account with provided password (or default iot@123)
    if not user:
        is_nurse = "nurse" in login_data.email.lower()
        is_pavan = "pavan" in login_data.email.lower()
        user_name = "Nurse Ananya Deshmukh" if is_nurse else ("Dr. Pavan, MD" if is_pavan else f"Dr. {login_data.email.split('@')[0].capitalize()}")
        user = User(
            name=user_name,
            email=login_data.email,
            password_hash=get_password_hash(login_data.password or DEFAULT_PASSWORD),
            role="nurse" if is_nurse else "doctor"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Allow custom password match OR default iot@123
    password_matches = verify_password(login_data.password, user.password_hash) or (login_data.password == DEFAULT_PASSWORD)
    if not password_matches:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid email or password. Default password is {DEFAULT_PASSWORD}"
        )
    
    access_token = create_access_token(subject=user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    password_to_hash = user_in.password if user_in.password else DEFAULT_PASSWORD
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=get_password_hash(password_to_hash),
        role=user_in.role or "doctor"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/me", response_model=UserResponse)
def get_current_user(email: str = "dr.pavan@hospital.org", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = db.query(User).filter(User.email == "doctor@hospital.org").first()
    if not user:
        user = db.query(User).first()
    return user
