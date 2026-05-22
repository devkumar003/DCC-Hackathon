"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, ArrowRight, Loader2, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewInterview() {
  const router = useRouter();
  const [jobRole, setJobRole] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setResumeFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole || !resumeFile) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("job_role", jobRole);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/resume/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process resume");
      }

      const data = await response.json();
      alert(`Success! Extracted ${data.extracted_data.skills.length} skills. Redirecting to interview...`);
      router.push(`/dashboard/interview/${data.interview_id}`);
    } catch (error) {
      console.error(error);
      alert("Error processing resume. Please ensure the backend is running and you have uploaded a PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Configure Your Interview</h1>
        <p className="text-muted-foreground mt-2">
          Tell us about the role you are applying for and provide your resume. Our AI will tailor the questions specifically to your background.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Job Role Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold">Target Job Role</h2>
          </div>
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium text-muted-foreground">
              What position are you interviewing for?
            </label>
            <input 
              id="role"
              type="text" 
              placeholder="e.g. Senior Frontend Engineer, Product Manager" 
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {["Software Engineer", "Frontend Developer", "Backend Developer", "Data Scientist", "Product Manager"].map((role) => (
              <button 
                key={role}
                type="button"
                onClick={() => setJobRole(role)}
                className="px-3 py-1 text-xs rounded-full border border-border/50 bg-secondary/50 hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-colors"
              >
                {role}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Resume Upload */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold">Upload Resume</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload your resume in PDF or DOCX format. The AI will analyze your skills and experience to generate personalized questions.
          </p>

          <div 
            className={`mt-4 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
              resumeFile ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-primary/50 hover:bg-secondary/50"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {resumeFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="font-medium text-lg">{resumeFile.name}</p>
                <p className="text-sm text-muted-foreground">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  type="button" 
                  onClick={() => setResumeFile(null)}
                  className="text-sm text-destructive hover:underline mt-2"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-4 bg-secondary rounded-full">
                  <UploadCloud className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Drag and drop your resume here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse from your computer</p>
                </div>
                <label className="cursor-pointer px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                  Select File
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end pt-4"
        >
          <button 
            type="submit"
            disabled={!jobRole || !resumeFile || isUploading}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Resume...
              </>
            ) : (
              <>
                Generate Interview
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
