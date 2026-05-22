"use client";

import { useState, useEffect, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, User, Bot, AlertCircle, Volume2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEvent = any;

export default function InterviewRoom({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const interviewId = resolvedParams.id;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [feedback, setFeedback] = useState<any | null>(null);
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Webcam state
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Speech APIs
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: AnyEvent) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setInputValue((prev) => prev + transcript + " ");
            }
          }
        };
        
        recognitionRef.current.onerror = (event: AnyEvent) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
      }
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '') || "localhost:8000";
    const wsUrl = `${protocol}//${host}/api/interview/ws/${interviewId}`;

    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setIsConnected(true);
      console.log("Connected to Interview Engine");
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "question") {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
        speakText(data.content);
      } else if (data.type === "feedback") {
        setFeedback(data.content);
      }
    };

    websocket.onclose = () => {
      setIsConnected(false);
      console.log("Disconnected from Interview Engine");
    };

    setWs(websocket);

    return () => {
      websocket.close();
      if (synthRef.current) synthRef.current.cancel();
      // Added isListening safely check inside
      if (recognitionRef.current) recognitionRef.current.stop();
      const currentVideo = videoRef.current;
      if (currentVideo && currentVideo.srcObject) {
        const stream = currentVideo.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [interviewId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, feedback]);

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel(); // Stop any current speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a good English voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.lang === "en-US");
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return alert("Speech recognition not supported in this browser.");
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Stop AI speaking if user starts talking
      if (synthRef.current) synthRef.current.cancel();
      setInputValue("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
      } catch (err) {
        console.error("Error accessing camera", err);
        alert("Could not access camera.");
      }
    }
  };

  const sendMessage = () => {
    if (!inputValue.trim() || !ws) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    setFeedback(null);
    const message = { type: "answer", content: inputValue };
    ws.send(JSON.stringify(message));
    
    setMessages((prev) => [...prev, { role: "user", content: inputValue }]);
    setInputValue("");
  };

  const endInterview = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/interview/${interviewId}/end`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        // Pass scorecard data via localStorage for MVP, normally fetch from        // Get the real job role
        const interviewContext = JSON.parse(localStorage.getItem(`interview_${interviewId}`) || "{}");
        const realJobRole = interviewContext.jobRole || "Software Engineer";

        const scorecardData = { ...data.scorecard, timestamp: Date.now(), job_role: realJobRole };
        localStorage.setItem(`scorecard_${interviewId}`, JSON.stringify(scorecardData));
        window.location.href = `/dashboard/interview/${interviewId}/scorecard`;
      }
    } catch (err) {
      console.error(err);
      alert("Error ending interview.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-bold">Live Interview</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
            {isConnected ? "Connected to AI Engine" : "Connecting..."}
            {isSpeaking && <span className="flex items-center gap-1 text-primary text-xs ml-2"><Volume2 className="w-3 h-3 animate-pulse" /> AI is speaking</span>}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleCamera}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${isCameraOn ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}
          >
            {isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
          </button>
          <button onClick={endInterview} className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 font-medium text-sm transition-colors">
            End Interview
          </button>
        </div>
      </header>

      {/* Main Layout: Chat (left) and Feedback (right) */}
      <div className="flex-1 flex gap-6 pt-6 overflow-hidden">
        
        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm relative">
          
          {/* Webcam Overlay */}
          <motion.div 
            className={`absolute top-4 right-4 w-48 h-36 bg-black rounded-xl overflow-hidden border-2 border-border/50 shadow-2xl z-10 transition-opacity ${isCameraOn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isCameraOn ? 1 : 0, scale: isCameraOn ? 1 : 0.9 }}
          >
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"></video>
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-[10px] text-green-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Live
            </div>
          </motion.div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}>
                    {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[80%] ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-sm shadow-[0_4px_20px_rgba(var(--primary),0.2)]" 
                      : "bg-secondary text-secondary-foreground rounded-tl-sm border border-border/50"
                  }`}>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 bg-background border-t border-border/50">
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-all ${
                  isListening 
                    ? "bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                title={isListening ? "Stop listening" : "Start speaking"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={isListening ? "Listening..." : "Type your answer..."}
                className="flex-1 bg-card border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                disabled={!isConnected}
              />
              <button 
                onClick={sendMessage}
                disabled={!isConnected || !inputValue.trim()}
                className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:hover:bg-primary"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Instant Feedback Section */}
        <div className="w-96 hidden lg:flex flex-col gap-4">
          <div className="p-6 bg-card border border-border/50 rounded-2xl flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold">Instant Feedback</h2>
            </div>
            
            {feedback ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                  <span className="font-medium text-sm">Answer Score</span>
                  <span className={`text-2xl font-bold ${feedback.score >= 8 ? 'text-green-500' : feedback.score >= 5 ? 'text-yellow-500' : 'text-destructive'}`}>
                    {feedback.score}/10
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-green-500 mb-2 uppercase tracking-wider">Strengths</h3>
                  <ul className="space-y-2">
                    {feedback.strengths.map((s: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-destructive mb-2 uppercase tracking-wider">Areas to Improve</h3>
                  <ul className="space-y-2">
                    {feedback.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-destructive mt-0.5">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 border border-border/50 rounded-xl bg-background/50">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Suggested Answer</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed italic">&quot;{feedback.improved_answer}&quot;</p>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                <Bot className="w-12 h-12 text-muted-foreground" />
                <p className="text-sm max-w-[200px]">Feedback will appear here after you submit an answer.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
