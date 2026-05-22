"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Mic, FileText, BarChart3 } from "lucide-react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background flex flex-col">
      {/* Navbar */}
      <nav className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto backdrop-blur-md bg-background/50 sticky top-0 z-50 border-b border-border/50 rounded-b-2xl">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">InterviewGenie AI</span>
        </div>
        <div className="flex items-center gap-4">
          {isLoaded && !isSignedIn && (
            <>
              <SignInButton mode="modal">
                <button className="text-sm font-medium hover:text-primary transition-colors">Sign In</button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  Get Started
                </button>
              </SignInButton>
            </>
          )}
          {isLoaded && isSignedIn && (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors mr-4">
                Dashboard
              </Link>
              <UserButton />
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] -z-10" />

        <motion.div 
          className="max-w-4xl space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border backdrop-blur-sm text-sm font-medium text-secondary-foreground mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Next-Gen AI Mock Interviews
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Nail your next interview with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">AI precision.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your resume, select your target role, and experience a hyper-realistic, dynamic mock interview that adapts to your answers in real-time.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            {isLoaded && isSignedIn ? (
              <Link href="/dashboard">
                <button className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] group">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] group">
                  Start Practicing Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignInButton>
            )}
            
            <button className="px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-semibold text-lg hover:bg-secondary/80 transition-all hover:scale-105 active:scale-95 border border-border/50 backdrop-blur-sm">
              Watch Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-32 z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {[
            {
              icon: <FileText className="w-6 h-6 text-blue-400" />,
              title: "Smart Resume Parsing",
              desc: "We analyze your experience and skills to generate highly relevant technical and behavioral questions."
            },
            {
              icon: <Mic className="w-6 h-6 text-green-400" />,
              title: "Real-time Voice Mode",
              desc: "Speak naturally. Our AI listens, evaluates your confidence, and responds with human-like voice synthesis."
            },
            {
              icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
              title: "Actionable Scorecards",
              desc: "Get instant feedback on your communication, technical depth, and a detailed improvement roadmap."
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-3xl bg-card/30 backdrop-blur-xl border border-border/50 shadow-2xl hover:bg-card/50 transition-colors flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-secondary/50 rounded-2xl shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
