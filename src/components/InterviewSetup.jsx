import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, AlertCircle, Compass, ShieldAlert, Cpu } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { groqService } from '../services/groqService';

const ROLES = [
  "AI Engineer",
  "ML Engineer",
  "Data Scientist",
  "Data Analyst",
  "Python Developer",
  "Full Stack Developer",
  "Backend Developer",
  "Frontend Developer",
  "Cloud Engineer",
  "Custom Role"
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const COUNTS = [10, 15, 20];

export default function InterviewSetup() {
  const { 
    uploadedResume, interviewConfig, setInterviewConfig, 
    startInterview, isGeneratingQuestions, setGeneratingQuestions, 
    setActiveView 
  } = useAppStore();

  const handleRoleChange = (e) => {
    setInterviewConfig({ role: e.target.value });
  };

  const handleCustomRoleChange = (e) => {
    setInterviewConfig({ customRole: e.target.value });
  };

  const handleDifficultyChange = (level) => {
    setInterviewConfig({ difficulty: level });
  };

  const handleCountChange = (count) => {
    setInterviewConfig({ questionCount: count });
  };

  const handleStart = async () => {
    if (!uploadedResume) {
      setActiveView('upload');
      return;
    }

    setGeneratingQuestions(true);

    try {
      const selectedRole = interviewConfig.role === 'Custom Role' 
        ? interviewConfig.customRole || 'AI Engineer' 
        : interviewConfig.role;

      // Call API Service
      const questions = await groqService.generateQuestions(
        uploadedResume,
        selectedRole,
        interviewConfig.difficulty,
        interviewConfig.questionCount
      );

      // Save questions and start session
      startInterview(questions);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to generate interview questions. Please verify your Groq API key.");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  if (!uploadedResume) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-muted-foreground max-w-md mx-auto">
        <ShieldAlert className="w-12 h-12 mb-3 text-amber-500/80 animate-pulse" />
        <h3 className="font-extrabold text-base text-foreground mb-1">Resume Required</h3>
        <p className="mb-6">You need to upload and parse a resume before configuring your personalized AI interview experience.</p>
        <button 
          onClick={() => setActiveView('upload')}
          className="w-full h-11 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
        >
          <span>Upload Resume First</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 pb-16">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Configure Interview</h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Tailor the AI agent's assessment scope. Select your target stack, skill difficulty level, and diagnostic question size.
        </p>
      </div>

      {isGeneratingQuestions ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass border border-border rounded-3xl p-10 flex flex-col items-center text-center space-y-6"
        >
          <div className="relative flex items-center justify-center">
            {/* Double radar ring loaders */}
            <div className="w-20 h-20 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
            <div className="w-12 h-12 rounded-full border-4 border-purple-500/10 border-t-purple-500 animate-spin absolute" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <Cpu className="w-6 h-6 text-indigo-500 absolute animate-pulse" />
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="font-bold text-lg">Synthesizing Questions</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Analyzing candidate resume nodes... compiling RAG context indexes... querying llama-3.3-70b-versatile models...
            </p>
          </div>

          <div className="w-full max-w-xs space-y-2.5">
            {/* Loading skeletons */}
            <div className="h-4 bg-muted animate-pulse rounded-md w-full" />
            <div className="h-4 bg-muted animate-pulse rounded-md w-[80%] mx-auto" />
            <div className="h-4 bg-muted animate-pulse rounded-md w-[60%] mx-auto" />
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 border border-border space-y-6 shadow-xl"
        >
          {/* Target Role Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Job Position</label>
            <select 
              value={interviewConfig.role}
              onChange={handleRoleChange}
              className="w-full h-11 px-4 bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-xl text-sm font-semibold focus:ring-1 focus:ring-indigo-500 outline-none transition-colors cursor-pointer"
            >
              {ROLES.map((r, i) => (
                <option key={i} value={r} className="bg-card text-foreground">{r}</option>
              ))}
            </select>
          </div>

          {/* Custom Role Input */}
          {interviewConfig.role === 'Custom Role' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-2 overflow-hidden"
            >
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Describe Custom Role / Stack</label>
              <input 
                type="text"
                value={interviewConfig.customRole}
                onChange={handleCustomRoleChange}
                placeholder="e.g. Lead React Engineer with GraphQL & Node.js"
                className="w-full h-11 px-4 bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
              />
            </motion.div>
          )}

          {/* Difficulty Cards */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Interview Difficulty Tier</label>
            <div className="grid grid-cols-3 gap-4">
              {DIFFICULTIES.map((level) => {
                const isSelected = interviewConfig.difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleDifficultyChange(level)}
                    className={`h-12 text-xs font-bold rounded-xl border flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/15 scale-[1.02]' 
                        : 'border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Count Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Diagnostic Question Limit</label>
            <div className="grid grid-cols-3 gap-4">
              {COUNTS.map((cnt) => {
                const isSelected = interviewConfig.questionCount === cnt;
                return (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleCountChange(cnt)}
                    className={`h-12 text-xs font-bold rounded-xl border flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/15 scale-[1.02]' 
                        : 'border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirm Button */}
          <button 
            onClick={handleStart}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-indigo-500/15 flex items-center justify-center space-x-2 mt-4 cursor-pointer"
          >
            <Play className="w-4.5 h-4.5 fill-current" />
            <span>Generate and Launch Interview</span>
          </button>

          <div className="flex items-center space-x-2 text-[10px] text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/80">
            <Cpu className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              Questions are synthesized utilizing context-aware vector document indexing and retrieval models.
            </span>
          </div>

        </motion.div>
      )}
    </div>
  );
}
