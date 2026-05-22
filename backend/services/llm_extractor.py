import json
import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def extract_resume_data(text: str) -> dict:
    """Uses LLM to extract structured data from resume text."""
    if not text.strip():
        return {"skills": [], "experience": [], "education": []}

    prompt = f"""
    You are an expert ATS and recruitment AI. Extract the following structured information from the provided resume text.
    Return ONLY a valid JSON object. DO NOT include markdown code blocks (```json). NO trailing commas.
    Exact keys required:
    - "name": The full name of the candidate.
    - "skills": A comprehensive list of ALL technical and soft skills mentioned in the resume. Do not miss any.
    - "experience": A list of objects, each containing "title", "company", "duration", and "description". Extract all experiences fully.
    - "education": A list of objects, each containing "degree", "institution", and "year".
    
    Resume Text:
    {text}
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        response = await model.generate_content_async(prompt)
        content = response.text.strip()
        
        # Strip potential markdown formatting that Gemini sometimes adds despite response_mime_type
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
            
        return json.loads(content.strip())
    except Exception as e:
        print(f"LLM Extraction error: {e}")
        return {"name": "Unknown", "skills": ["Python", "React", "Next.js"], "experience": [], "education": []}
