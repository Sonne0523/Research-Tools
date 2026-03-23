import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import google.auth.transport.requests
import google.oauth2.id_token
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models import User

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-for-research-app")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()
security = HTTPBearer()

# Pydantic models
class UserSignUp(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

class GoogleAuth(BaseModel):
    token: str

# Helpers
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", response_model=Token)
def signup(user_data: UserSignUp, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user_data.password)
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer", "username": new_user.name}

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    if not pwd_context.verify(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "username": user.name}

@router.post("/google", response_model=Token)
def google_auth(data: GoogleAuth, db: Session = Depends(get_db)):
    try:
        # Verify the Google token
        idinfo = google.oauth2.id_token.verify_oauth2_token(
            data.token, 
            google.auth.transport.requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Create new user for google login
            user = User(email=email, name=name)
            db.add(user)
            db.commit()
            db.refresh(user)
            
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer", "username": user.name}
        
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")
