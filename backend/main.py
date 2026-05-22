from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

from routers import resume
from routers import interview
app = FastAPI(title="InterviewGenie AI Backend")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"], # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])

@app.get("/")
def read_root():
    return {"message": "Welcome to InterviewGenie AI API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Note: More modular routes (interviews, users, resumes) will be added in Phase 3 & 4
