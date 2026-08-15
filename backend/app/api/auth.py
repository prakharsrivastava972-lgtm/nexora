import os
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests

from backend.app.database.session import get_db
from backend.app.models.tables import User
from backend.app.schemas.user import UserCreate, UserLogin, UserOut, Token, GoogleAuthInput
from backend.app.services.auth import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        auth_provider="email",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not user.hashed_password or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/google", response_model=Token)
def google_auth(payload: GoogleAuthInput, db: Session = Depends(get_db)):
    try:
        id_info = id_token.verify_oauth2_token(
            payload.id_token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10,
        )
    except Exception as e:
        print(f"GOOGLE TOKEN VERIFY FAILED: {e}")
        raise HTTPException(status_code=400, detail="Invalid Google token")

    google_sub = id_info.get("sub")
    email = id_info.get("email")
    name = id_info.get("name", email.split("@")[0])

    if not email:
        raise HTTPException(status_code=400, detail="Google token missing email")

    # 1. Check if user exists by google_id
    user = db.query(User).filter(User.google_id == google_sub).first()

    # 2. Link existing account if email matches
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_sub
            if not user.auth_provider:
                user.auth_provider = "google"
        else:
            # 3. Create a new user account
            user = User(
                name=name,
                email=email,
                google_id=google_sub,
                auth_provider="google",
                hashed_password=None,
            )
            db.add(user)

        db.commit()
        db.refresh(user)

    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user