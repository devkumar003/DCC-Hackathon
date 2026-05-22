import os
import json
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def generate_final_scorecard(job_role: str, chat_history: list) -> dict:
    """Evaluates the entire interview and generates a final scorecard."""
    # Check if there are any user messages
    user_messages = [m for m in chat_history if m.get("role") == "user"]
    if not chat_history or not user_messages:
        return {
            "overall_score": 0,
            "technical_score": 0,
            "communication_score": 0,
            "feedback_summary": "The candidate did not provide any answers during this mock interview.",
            "strengths": ["None observed"],
            "improvements": ["Please complete the interview to receive feedback."]
        }
        
    prompt = f"""
    You are an expert hiring manager. Review the following transcript of an AI mock interview for the role of {job_role}.
    Generate a final comprehensive scorecard for the candidate.
    
    Transcript:
    {json.dumps(chat_history, indent=2)}
    
    Return a valid JSON object with EXACTLY these keys:
    - "overall_score": integer (1-100)
    - "technical_score": integer (1-100)
    - "communication_score": integer (1-100)
    - "feedback_summary": string (A paragraph summarizing their performance)
    - "strengths": list of strings (Top 3 strong points)
    - "improvements": list of strings (Top 3 areas to work on)
    """

    import re
    try:
        model = genai.GenerativeModel('gemini-2.5-flash', system_instruction="You are a senior technical interviewer. Output ONLY valid JSON. DO NOT use markdown formatting.", generation_config={"response_mime_type": "application/json"})
        response = await model.generate_content_async(prompt)
        content = response.text
        
        # Robustly extract JSON block
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            content = match.group(0)
            
        return json.loads(content)
    except Exception as e:
        print(f"Error generating scorecard: {e}")
        # Log the raw response if it failed parsing
        if 'response' in locals():
            print(f"Raw Response: {response.text}")
        return {
            "overall_score": 50,
            "technical_score": 50,
            "communication_score": 50,
            "feedback_summary": "Error generating scorecard.",
            "strengths": [],
            "improvements": []
        }
