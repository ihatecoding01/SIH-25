# main.py

import hashlib
import time
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

# --- Configuration & Setup ---

# Database Setup (SQLite for speed)
DATABASE_URL = "sqlite:///./tourist.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# FastAPI App Instance
app = FastAPI(title="Tourist Safety Backend")

# Setup for Jinja2 Templates (for the dashboard)
templates = Jinja2Templates(directory="templates")

# --- Database Models (SQLAlchemy) ---


class TouristDB(Base):
    __tablename__ = "tourists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    passport_no = Column(String, unique=True)
    blockchain_hash = Column(String)


class ItineraryDB(Base):
    __tablename__ = "itineraries"
    id = Column(Integer, primary_key=True, index=True)
    tourist_id = Column(Integer, index=True)
    location_name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    scheduled_time = Column(DateTime)


class AlertDB(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    tourist_id = Column(Integer, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)


# Create the database tables
Base.metadata.create_all(bind=engine)

# Dependency to get a DB session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Pydantic Models (For API Request/Response) ---


class TouristCreate(BaseModel):
    name: str
    email: str
    passport_no: str


class Tourist(TouristCreate):
    id: int
    blockchain_hash: str


class ItineraryLocation(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    scheduled_time: datetime


class ItineraryCreate(BaseModel):
    tourist_id: int
    locations: List[ItineraryLocation]


class AlertCreate(BaseModel):
    tourist_id: int
    latitude: float
    longitude: float


class AnomalyCheck(BaseModel):
    tourist_id: int
    current_latitude: float
    current_longitude: float

# --- Mock Blockchain Function ---


# --- Mock Blockchain Function ---

def create_mock_blockchain_hash(data: str) -> str:
    """Generates a SHA256 hash to simulate a blockchain transaction."""
    timestamp = str(time.time()).encode('utf-8')
    data_encoded = data.encode('utf-8')
    # <-- This is the fix
    return hashlib.sha256(timestamp + data_encoded).hexdigest()

# --- API Endpoints ---

# 1. Tourist Onboarding


@app.post("/tourists", response_model=Tourist, tags=["Tourists"])
def create_tourist(tourist: TouristCreate, db: Session = Depends(get_db)):
    """Onboard a new tourist, create a digital ID, and generate a mock blockchain hash."""
    db_tourist_email = db.query(TouristDB).filter(
        TouristDB.email == tourist.email).first()
    if db_tourist_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    id_data = f"{tourist.email}:{tourist.passport_no}"
    blockchain_hash = create_mock_blockchain_hash(id_data)

    db_tourist = TouristDB(**tourist.dict(), blockchain_hash=blockchain_hash)
    db.add(db_tourist)
    db.commit()
    db.refresh(db_tourist)
    return db_tourist


@app.get("/tourists", response_model=List[Tourist], tags=["Tourists"])
def list_tourists(db: Session = Depends(get_db)):
    """Get a list of all registered tourists."""
    return db.query(TouristDB).all()

# 2. Itinerary Management


@app.post("/itinerary", tags=["Itinerary"])
def add_itinerary(itinerary: ItineraryCreate, db: Session = Depends(get_db)):
    """Add a new itinerary for a tourist."""
    for loc in itinerary.locations:
        db_itinerary = ItineraryDB(
            tourist_id=itinerary.tourist_id,
            **loc.dict()
        )
        db.add(db_itinerary)
    db.commit()
    return {"message": "Itinerary added successfully"}


@app.get("/itinerary/{tourist_id}", response_model=List[ItineraryLocation], tags=["Itinerary"])
def get_itinerary(tourist_id: int, db: Session = Depends(get_db)):
    """Fetch the itinerary for a specific tourist."""
    return db.query(ItineraryDB).filter(ItineraryDB.tourist_id == tourist_id).all()

# 3. Alert Logging


@app.post("/alerts", tags=["Alerts"])
def log_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    """Log a panic button press from a tourist."""
    db_alert = AlertDB(**alert.dict(), timestamp=datetime.utcnow())
    db.add(db_alert)
    db.commit()
    return {"message": "Alert logged successfully"}


@app.get("/alerts", tags=["Alerts"])
def get_alerts(db: Session = Depends(get_db)):
    """View all logged alerts."""
    return db.query(AlertDB).all()

# 4. Anomaly Detection


@app.post("/anomaly/check", tags=["Anomaly Detection"])
def check_anomaly(check: AnomalyCheck, db: Session = Depends(get_db)):
    """
    Simple rule-based anomaly detection.
    Rule: Flag as an anomaly if the user is more than 0.5 km away 
          from any of their scheduled itinerary points for the day.
    (This is a very basic implementation for the demo).
    """
    itinerary = db.query(ItineraryDB).filter(
        ItineraryDB.tourist_id == check.tourist_id).all()
    if not itinerary:
        return {"anomaly": False, "reason": "No itinerary found"}

    # A simple distance check (not true Haversine, but good enough for a demo)
    # 1 degree of lat/lon is roughly 111 km. 0.0045 degrees is ~500m.
    TOLERANCE = 0.0045

    is_near_point = False
    for point in itinerary:
        lat_diff = abs(point.latitude - check.current_latitude)
        lon_diff = abs(point.longitude - check.current_longitude)
        if lat_diff < TOLERANCE and lon_diff < TOLERANCE:
            is_near_point = True
            break

    if not is_near_point:
        return {"anomaly": True, "reason": "User has deviated significantly from the planned itinerary."}

    return {"anomaly": False, "reason": "User is on track."}

# --- Authority Dashboard Web Pages ---


@app.get("/", response_class=HTMLResponse, tags=["Dashboard"])
async def read_dashboard(request: Request, db: Session = Depends(get_db)):
    """Main dashboard page showing tourists."""
    tourists = db.query(TouristDB).all()
    return templates.TemplateResponse("dashboard.html", {"request": request, "tourists": tourists})


@app.get("/dashboard/alerts", response_class=HTMLResponse, tags=["Dashboard"])
async def read_alerts_page(request: Request, db: Session = Depends(get_db)):
    """Dashboard page showing all alerts."""
    alerts = db.query(AlertDB).order_by(AlertDB.timestamp.desc()).all()
    return templates.TemplateResponse("alerts.html", {"request": request, "alerts": alerts})


@app.get("/dashboard/heatmap", response_class=HTMLResponse, tags=["Dashboard"])
async def read_heatmap_page(request: Request):
    """Dashboard page showing a heatmap of alerts."""
    # The data will be fetched by JS from the /alerts API
    return templates.TemplateResponse("heatmap.html", {"request": request})
