import os
import json
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def generate_next_question(job_role: str, resume_data: dict, chat_history: list) -> str:
    """Generates the next interview question based on context."""
    
    system_prompt = f"""
    You are an expert technical interviewer at a top-tier tech company. 
    You are interviewing a candidate for the role of: {job_role}.
    
    Candidate's Resume Highlights:
    {json.dumps(resume_data, indent=2)}
    
    Your goal is to ask the next relevant question. 
    - Ask ONLY ONE question at a time.
    - Start with a brief HR/Introduction question, then move to Technical, then Behavioral.
    - Adapt your question based on their previous answers in the chat history.
    - If they struggled with a concept, ask a follow-up or simplify. If they did well, probe deeper.
    - DO NOT provide feedback to their answer in the question prompt (feedback is handled by a separate engine). Just ask the question naturally.
    """

    # For Gemini, system instructions are set on the model
    try:
        model = genai.GenerativeModel('gemini-2.5-flash', system_instruction=system_prompt)
        
        # Convert chat history to Gemini format
        # Gemini uses "user" and "model" instead of "user" and "assistant"
        formatted_history = []
        for msg in chat_history:
            role = "model" if msg["role"] == "assistant" else "user"
            formatted_history.append({"role": role, "parts": [{"text": msg["content"]}]})
            
        # We use generate_content_async instead of start_chat to avoid role sequence errors
        # If history is empty, we need an initial trigger
        if not formatted_history:
            formatted_history.append({"role": "user", "parts": [{"text": "Please ask the first question."}]})
        elif formatted_history[-1]["role"] == "model":
            # If the last message was from the model, we need a user trigger to prompt the next question
            formatted_history.append({"role": "user", "parts": [{"text": "Please ask the next question."}]})
            
        response = await model.generate_content_async(formatted_history)
        
        return response.text
    except Exception as e:
        print(f"Error generating question: {e}")
        return "Can you tell me more about your recent project experience?"

async def evaluate_answer(question: str, answer: str) -> dict:
    """Evaluates the user's answer and provides instant feedback."""
    prompt = f"""
    Evaluate the candidate's answer to the following interview question.
    Question: {question}
    Answer: {answer}
    
    Provide a JSON response with the following keys:
    - "strengths": List of strings (what they did well).
    - "weaknesses": List of strings (what they missed or got wrong).
    - "improved_answer": A string (how a top-tier candidate would answer).
    - "score": Integer 1-10 rating the answer.
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash', system_instruction="You are a strict but fair interview evaluator. Output ONLY valid JSON. DO NOT use markdown formatting.", generation_config={"response_mime_type": "application/json"})
        response = await model.generate_content_async(prompt)
        content = response.text.strip()
        if content.startswith("```json"): content = content[7:]
        if content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        return json.loads(content.strip())
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        return {"strengths": [], "weaknesses": ["Error processing evaluation"], "improved_answer": "", "score": 5}
