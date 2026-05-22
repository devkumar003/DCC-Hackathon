"use client";

import { BarChart3, TrendingUp, Award, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useEffect, useState } from "react";

interface ChartItem {
  name: string;
  score: number;
  technical: number;
  communication: number;
}

interface ParsedItem {
  id: string;
  score: number;
  technical: number;
  communication: number;
  timestamp: number;
}

export default function AnalyticsPage() {
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [stats, setStats] = useState({
    growth: 0,
    topSkill: "N/A",
    totalInterviews: 0
  });

  useEffect(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("scorecard_"));
    if (keys.length === 0) return;

    const items: ParsedItem[] = [];
    const skillCounts: Record<string, number> = {};

    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        if (data.overall_score !== undefined) {
          items.push({
            id: key,
            score: data.overall_score,
            technical: data.technical_score || data.overall_score,
            communication: data.communication_score || data.overall_score,
            timestamp: data.timestamp || 0
          });

          // Count strengths to find top skill
          if (data.strengths && Array.isArray(data.strengths)) {
            data.strengths.forEach((s: string) => {
              const skill = s.split(" ")[0]; // just grab the first word to keep it simple
              skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    items.sort((a, b) => a.timestamp - b.timestamp);

    const formattedData = items.map((item, index) => ({
      name: `Int ${index + 1}`,
      score: item.score,
      technical: item.technical,
      communication: item.communication
    }));

    setChartData(formattedData);

    // Calculate Growth (first vs last score)
    let growth = 0;
    if (items.length > 1) {
      const firstScore = items[0].score;
      const lastScore = items[items.length - 1].score;
      growth = lastScore - firstScore;
    }

    // Find top skill
    let topSkill = "Communication";
    let maxCount = 0;
    for (const [skill, count] of Object.entries(skillCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topSkill = skill;
      }
    }

    setStats({
      growth,
      topSkill: maxCount > 0 ? topSkill : "Communication",
      totalInterviews: items.length
    });

  }, []);

  if (chartData.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
          <p className="text-muted-foreground mt-2">Deep dive into your performance metrics.</p>
        </div>
        <div className="p-12 text-center bg-card rounded-2xl border border-border/50 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <BarChart3 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Data Required</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You haven&apos;t completed any interviews yet. Complete your first mock interview to unlock analytics!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
        <p className="text-muted-foreground mt-2">Deep dive into your performance metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Growth</p>
              <h3 className="text-2xl font-bold">{stats.growth > 0 ? '+' : ''}{stats.growth}%</h3>
            </div>
          </div>
        </div>
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Top Skill Area</p>
              <h3 className="text-2xl font-bold truncate max-w-[150px]" title={stats.topSkill}>{stats.topSkill}</h3>
            </div>
          </div>
        </div>
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Interviews Completed</p>
              <h3 className="text-2xl font-bold">{stats.totalInterviews}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm flex flex-col">
          <h2 className="text-lg font-bold mb-6">Overall Progress</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm flex flex-col">
          <h2 className="text-lg font-bold mb-6">Skill Breakdown</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  cursor={{ fill: 'hsl(var(--secondary))' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="technical" name="Technical" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="communication" name="Communication" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
