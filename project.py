import joblib
from pathlib import Path
from typing import Literal

import pandas as pd
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException

BASE_DIR = Path(__file__).resolve().parent

model = joblib.load(BASE_DIR / "Mental_Health_Model.pkl")
app = FastAPI(title="Mental Health Score Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve CSS/JS from /static and the page from /
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


class StudentData(BaseModel):
    age: int = Field(..., ge=0, le=100)
    gender: Literal['Male', 'Female']
    country: str
    academic_level: Literal['Undergraduate', 'Postgraduate', 'Graduate']
    most_used_platform: Literal['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'Snapchat', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp', 'WeChat']
    purpose_of_use: Literal['Networking', 'Education', 'Entertainment', 'News']
    avg_daily_usage_hours: float = Field(..., ge=0, le=24)
    daily_unlocks: int = Field(..., ge=0)
    study_hours: float = Field(..., ge=0, le=24)
    physical_activity_hours: float = Field(..., ge=0, le=24)
    sleep_hours_per_night: float = Field(..., ge=0, le=24)
    stress_level: Literal['Medium', 'High', 'Very High', 'Low']


class PredictResponse(BaseModel):
    predicted_mental_health_score: float


@app.get("/", include_in_schema=False)
def home():
    return FileResponse(BASE_DIR / "templates" / "index.html")


@app.exception_handler(StarletteHTTPException)
async def not_found(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 404 and "text/html" in request.headers.get("accept", ""):
        return RedirectResponse("/?e=404")
    return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)


top_countries = ['Other', 'India', 'USA', 'Canada', 'Australia', 'UK', 'Germany', 'Mexico', 'Turkey', 'France']


@app.post('/predict', response_model=PredictResponse)
def predict(data: StudentData):
    country_group = data.country if data.country in top_countries else 'Other'

    input_row = pd.DataFrame([{
        'Age': data.age,
        'Gender': data.gender,
        'Country': data.country,
        'Academic_Level': data.academic_level,
        'Most_Used_Platform': data.most_used_platform,
        'Purpose_Of_Use': data.purpose_of_use,
        'Avg_Daily_Usage_Hours': data.avg_daily_usage_hours,
        'Daily_Unlocks': data.daily_unlocks,
        'Study_Hours': data.study_hours,
        'Physical_Activity_Hours': data.physical_activity_hours,
        'Sleep_Hours_Per_Night': data.sleep_hours_per_night,
        'Stress_Level': data.stress_level,
        'Group_country': country_group,
    }])

    prediction = model.predict(input_row)[0]
    return PredictResponse(predicted_mental_health_score=round(float(prediction), 2))