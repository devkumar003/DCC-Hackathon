"use client";

import { Clock, Plus, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RecentItem {
  id: string;
  score: number;
  role: string;
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

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    bestSkill: "N/A",
    recent: [] as RecentItem[]
  });

  useEffect(() => {
    // Fetch all scorecards from localStorage
    const keys = Object.keys(localStorage).filter(k => k.startsWith("scorecard_"));
    if (keys.length === 0) return;

    let totalScore = 0;
    const allStrengths: string[] = [];
    const recentItems: RecentItem[] = [];

    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        if (data.overall_score !== undefined) {
          totalScore += data.overall_score;
          if (data.strengths && data.strengths.length > 0) {
            allStrengths.push(data.strengths[0]);
          }
          recentItems.push({
            id: key.replace("scorecard_", ""),
            score: data.overall_score,
            role: data.job_role || "Software Engineer",
            date: formatDate(data.timestamp),
            timestamp: data.timestamp || 0
          });
        }
      } catch (err) {
        console.error(err);
      }
    });

    recentItems.sort((a, b) => b.timestamp - a.timestamp);

    setStats({
      total: keys.length,
      avgScore: Math.round(totalScore / keys.length),
      bestSkill: allStrengths.length > 0 ? allStrengths[0].split(" ")[0] : "Communication",
      recent: recentItems.slice(0, 5)
    });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">Ready to crush your next interview?</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats Cards */}
        <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-4">
            <span className="text-sm font-medium">Total Interviews</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-4">
            <span className="text-sm font-medium">Avg. Score</span>
            <Trophy className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold">{stats.avgScore}%</div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-4">
            <span className="text-sm font-medium">Strongest Area</span>
            <Target className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold truncate" title={stats.bestSkill}>{stats.bestSkill}</div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-4">
            <span className="text-sm font-medium">Interviews This Week</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Start a New Mock Interview</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Upload your latest resume, select your target role, and our AI will generate a hyper-personalized interview experience.
            </p>
            <Link 
              href="/dashboard/new"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 gap-2 shadow-lg shadow-primary/25"
            >
              <Plus className="w-4 h-4" />
              Configure Interview
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold mb-6">Recent Activity</h2>
          <div className="flex-1 flex flex-col gap-4">
            {stats.recent.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <div className="w-16 h-16 rounded-full border border-dashed border-border flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 opacity-50" />
                </div>
                <p className="text-sm text-center">You haven&apos;t completed any interviews yet.</p>
              </div>
            ) : (
              stats.recent.map((item, idx) => (
                <Link key={idx} href={`/dashboard/interview/${item.id}/scorecard`} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-border/50">
                  <div>
                    <p className="font-medium text-sm">{item.role}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="font-bold text-primary">{item.score}%</div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
