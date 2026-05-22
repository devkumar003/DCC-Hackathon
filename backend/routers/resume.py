from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.pdf_parser import extract_text_from_pdf
from services.llm_extractor import extract_resume_data
import uuid

router = APIRouter()

# In a real app, we'd use Supabase python client here to store to DB
# For this phase, we'll return the parsed data to the frontend so it can progress.

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    job_role: str = Form(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported currently.")
        
    file_bytes = await file.read()
    
    # 1. Extract raw text
    text = extract_text_from_pdf(file_bytes)
    
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")
        
    # 2. Extract structured data using LLM
    structured_data = await extract_resume_data(text)
    
    # 3. Create a mock interview session ID to return
    interview_id = str(uuid.uuid4())
    
    return {
        "message": "Resume processed successfully.",
        "interview_id": interview_id,
        "job_role": job_role,
        "extracted_data": structured_data
    }
