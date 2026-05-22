"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, MessageSquare, ArrowLeft, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Scorecard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const interviewId = resolvedParams.id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scorecard, setScorecard] = useState<any>(null);

  useEffect(() => {
    // In Phase 6 MVP, fetch from localStorage which was set during redirect
    const saved = localStorage.getItem(`scorecard_${interviewId}`);
    if (saved) {
      setScorecard(JSON.parse(saved));
    }
  }, [interviewId]);

  if (!scorecard) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Generating comprehensive analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Interview Scorecard</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Overall Score */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-primary/20 to-card border border-border/50 col-span-1 md:col-span-3 lg:col-span-1 flex flex-col items-center justify-center text-center"
        >
          <Trophy className="w-10 h-10 text-primary mb-4" />
          <h2 className="text-xl font-medium mb-2">Overall Score</h2>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            {scorecard.overall_score}%
          </div>
        </motion.div>

        {/* Detailed Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl bg-card border border-border/50 col-span-1 md:col-span-2 flex flex-col justify-center space-y-6"
        >
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium flex items-center gap-2"><Target className="w-4 h-4 text-blue-400" /> Technical Accuracy</span>
              <span className="font-bold">{scorecard.technical_score}%</span>
            </div>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${scorecard.technical_score}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium flex items-center gap-2"><MessageSquare className="w-4 h-4 text-purple-400" /> Communication Skills</span>
              <span className="font-bold">{scorecard.communication_score}%</span>
            </div>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${scorecard.communication_score}%` }}
                transition={{ duration: 1, delay: 0.6 }}
                className="h-full bg-purple-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-3xl bg-card border border-border/50 md:col-span-2"
        >
          <h2 className="text-xl font-bold mb-4">Executive Summary</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            {scorecard.feedback_summary}
          </p>
        </motion.div>

        {/* Strengths */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-3xl bg-green-500/5 border border-green-500/20"
        >
          <h2 className="text-xl font-bold mb-6 text-green-500 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Key Strengths
          </h2>
          <ul className="space-y-4">
            {scorecard.strengths.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0 text-sm font-bold">{i + 1}</span>
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Improvements */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-8 rounded-3xl bg-destructive/5 border border-destructive/20"
        >
          <h2 className="text-xl font-bold mb-6 text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Areas to Improve
          </h2>
          <ul className="space-y-4">
            {scorecard.improvements.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-destructive/20 text-destructive flex items-center justify-center shrink-0 text-sm font-bold">{i + 1}</span>
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
