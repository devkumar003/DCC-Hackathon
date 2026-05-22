"use client";

import { Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Define a proper interface
interface HistoryItem {
  id: string;
  score: number;
  role: string;
  summary: string;
  date: string;
  timestamp: number;
}

function formatDate(timestamp: number) {
  if (!timestamp) return "Unknown Date";
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("scorecard_"));
    const items: HistoryItem[] = [];
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        if (data.overall_score !== undefined) {
          items.push({
            id: key.replace("scorecard_", ""),
            score: data.overall_score,
            role: data.job_role || "Software Engineer",
            summary: data.feedback_summary || "Completed interview.",
            date: formatDate(data.timestamp),
            timestamp: data.timestamp || 0
          });
        }
      } catch (err) {
        console.error(err);
      }
    });
    items.sort((a: any, b: any) => b.timestamp - a.timestamp);
    setHistory(items);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interview History</h1>
        <p className="text-muted-foreground mt-2">Review your past mock interviews and track your progress over time.</p>
      </div>

      <div className="grid gap-4">
        {history.length === 0 ? (
          <div className="p-12 text-center bg-card rounded-2xl border border-border/50 text-muted-foreground">
            You haven&apos;t completed any interviews yet. Complete an interview to see your history!
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={idx} className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm flex items-center justify-between hover:bg-secondary/20 transition-colors">
              <div>
                <h3 className="font-bold text-lg">{item.role} Mock Interview</h3>
                <p className="text-sm text-muted-foreground line-clamp-1 max-w-xl">{item.summary}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {item.date}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-black text-primary">{item.score}%</p>
                </div>
                <Link 
                  href={`/dashboard/interview/${item.id}/scorecard`}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg flex items-center gap-2 hover:bg-secondary/80 transition-colors text-sm font-medium"
                >
                  View Scorecard <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
