from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from services.interview_engine import generate_next_question, evaluate_answer

router = APIRouter()

# In-memory store for active interviews (for MVP). In prod, use Redis/DB.
active_interviews = {}

@router.websocket("/ws/{interview_id}")
async def interview_websocket(websocket: WebSocket, interview_id: str):
    await websocket.accept()
    
    # Initialize session state if not exists
    if interview_id not in active_interviews:
        # Mocking initial data since we aren't pulling from DB yet
        active_interviews[interview_id] = {
            "job_role": "Software Engineer",
            "resume_data": {"skills": ["Python", "React"]},
            "history": []
        }
        
    session = active_interviews[interview_id]
    
    try:
        # Generate and send the first question immediately upon connection
        if not session["history"]:
            first_q = await generate_next_question(session["job_role"], session["resume_data"], session["history"])
            session["history"].append({"role": "assistant", "content": first_q})
            await websocket.send_json({"type": "question", "content": first_q})
            
        while True:
            # Wait for candidate's answer
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            if payload.get("type") == "answer":
                user_answer = payload.get("content")
                last_question = session["history"][-1]["content"] if session["history"] else ""
                
                # Append user answer to history
                session["history"].append({"role": "user", "content": user_answer})
                
                # 1. Provide instant feedback on the answer
                feedback = await evaluate_answer(last_question, user_answer)
                await websocket.send_json({"type": "feedback", "content": feedback})
                
                # 2. Generate the next question
                next_q = await generate_next_question(session["job_role"], session["resume_data"], session["history"])
                session["history"].append({"role": "assistant", "content": next_q})
                
                # Send next question
                await websocket.send_json({"type": "question", "content": next_q})
                
    except WebSocketDisconnect:
        print(f"Client disconnected from interview {interview_id}")
        # Could save final state to DB here

from services.scorecard_engine import generate_final_scorecard

@router.post("/{interview_id}/end")
async def end_interview(interview_id: str):
    """Ends the interview and generates the final scorecard."""
    if interview_id not in active_interviews:
        # If not in memory, we should fetch from DB in a real scenario
        # We will mock it here to allow testing without DB sync
        session = {"job_role": "Software Engineer", "history": []}
    else:
        session = active_interviews[interview_id]
        
    scorecard = await generate_final_scorecard(session.get("job_role", "Unknown"), session.get("history", []))
    
    # In a real app, save scorecard to Supabase DB here
    
    return {"status": "success", "scorecard": scorecard}

