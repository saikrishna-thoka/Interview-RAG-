import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Mic, MicOff, Copy, Check, ChevronRight, 
  User, Cpu, ShieldAlert, CheckCircle, Play, Sparkles, Terminal, Award
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { groqService } from '../services/groqService';

export default function InterviewChat() {
  const { 
    uploadedResume, interviewConfig, activeInterview, 
    isSubmittingAnswer, setSubmittingAnswer, submitAnswer, 
    completeInterview, setActiveView 
  } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [isFinalizing, setIsFinalizing] = useState(false);
  
  const chatEndRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Auto scroll to bottom when transcript changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeInterview?.chatTranscript, isSubmittingAnswer]);

  // Handle timer countdown
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingTimerRef.current);
      setRecordingTimer(0);
    }
    return () => clearInterval(recordingTimerRef.current);
  }, [isRecording]);

  if (!activeInterview) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-muted-foreground max-w-md mx-auto h-96">
        <ShieldAlert className="w-12 h-12 mb-3 text-amber-500/80 animate-pulse" />
        <h3 className="font-extrabold text-base text-foreground mb-1">No Active Session</h3>
        <p className="mb-6">Please configure your interview settings to begin.</p>
        <button 
          onClick={() => setActiveView('setup')}
          className="w-full h-11 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Setup Interview
        </button>
      </div>
    );
  }

  const { questions, currentQuestionIndex, chatTranscript, duration } = activeInterview;
  const totalQuestions = questions.length;
  
  // Format timer duration (MM:SS)
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSend = async () => {
    if (!inputText.trim() || isSubmittingAnswer) return;

    const answer = inputText;
    setInputText('');
    setSubmittingAnswer(true);

    try {
      const currentQuestion = questions[currentQuestionIndex];
      const selectedRole = interviewConfig.role === 'Custom Role' ? interviewConfig.customRole : interviewConfig.role;

      // 1. Evaluate user's answer
      const evalResult = await groqService.evaluateAnswer(
        uploadedResume,
        selectedRole,
        interviewConfig.difficulty,
        currentQuestion,
        answer,
        chatTranscript
      );

      // 2. Determine if there are more questions
      const hasMore = currentQuestionIndex + 1 < totalQuestions;

      // 3. Save transcript update
      submitAnswer(answer, evalResult.evaluation, evalResult.score);

      // 4. If finished, trigger automatic compilation
      if (!hasMore) {
        handleFinishInterview();
      }
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to submit answer.");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleFinishInterview = async () => {
    setIsFinalizing(true);
    try {
      const selectedRole = interviewConfig.role === 'Custom Role' ? interviewConfig.customRole : interviewConfig.role;
      // Generate final scores
      const evaluation = await groqService.generateFinalEvaluation(
        uploadedResume,
        selectedRole,
        interviewConfig.difficulty,
        chatTranscript
      );
      
      // Save report & navigate to score tab
      completeInterview(evaluation);
    } catch (e) {
      console.error(e);
      alert("Failed to compile interview results.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      // Mock typing response on stop
      setIsRecording(false);
      setInputText("Based on my experience, I implement a vector indexing approach utilizing Hierarchical Navigable Small World (HNSW) graphs. This allows for log-time search complexity and handles high-dimensional embedding spaces cleanly, reducing our query latency down to 24 milliseconds.");
    } else {
      setIsRecording(true);
    }
  };

  if (isFinalizing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-muted-foreground h-[70vh]">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
          <Award className="w-8 h-8 text-indigo-500 absolute top-6 left-6 animate-pulse" />
        </div>
        <h3 className="font-extrabold text-base text-foreground mb-2">Analyzing Performance Transcript</h3>
        <p className="max-w-xs text-xs">
          Hiring committee engine is grading your responses across technical competence, communication structure, and confidence scores...
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh] overflow-hidden -m-6 p-6">
      
      {/* Left Sidebar - Progress tracker & Resume info */}
      <div className="lg:col-span-1 hidden lg:flex flex-col glass-card border border-border rounded-2xl p-5 overflow-y-auto space-y-6">
        
        {/* Session Metadata */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">Current Session</span>
          <h4 className="font-extrabold text-sm truncate">
            {interviewConfig.role === 'Custom Role' ? interviewConfig.customRole : interviewConfig.role}
          </h4>
          <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground font-mono">
            <span>Level: {interviewConfig.difficulty}</span>
            <span>Time: {formatTime(duration)}</span>
          </div>
        </div>

        {/* Question checklist progress bar */}
        <div className="space-y-2 pt-2 border-t border-border/80">
          <div className="flex justify-between items-center text-xs font-bold">
            <span>Interview Progress</span>
            <span className="font-mono">{Math.min(currentQuestionIndex + 1, totalQuestions)}/{totalQuestions}</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Checked list of questions */}
        <div className="flex-1 space-y-2 pt-4 border-t border-border/80 overflow-y-auto">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono block">Question List</span>
          <div className="space-y-2 pr-1">
            {questions.map((q, idx) => {
              const isPassed = idx < currentQuestionIndex;
              const isActive = idx === currentQuestionIndex;

              return (
                <div 
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs flex items-start space-x-2.5 transition-colors ${
                    isActive 
                      ? 'border-indigo-500/50 bg-indigo-500/5 font-semibold text-foreground' 
                      : isPassed 
                        ? 'border-border/60 bg-muted/20 text-muted-foreground' 
                        : 'border-border/40 text-muted-foreground/50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 text-[8px] font-bold mt-0.5 ${
                    isPassed ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' : 'border-border/80'
                  }`}>
                    {idx + 1}
                  </span>
                  <p className="line-clamp-2 leading-tight">{q.question_text || q}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resume quick details */}
        <div className="p-3 bg-muted/20 border border-border/60 rounded-xl space-y-1.5 text-[10px]">
          <h5 className="font-bold flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>RAG Context Node</span>
          </h5>
          <p className="text-muted-foreground line-clamp-2">Candidate: {uploadedResume.candidate_name}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {uploadedResume.skills?.slice(0, 4).map((skill, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">{skill}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main ChatGPT Chat Workspace Area */}
      <div className="lg:col-span-3 flex flex-col glass-card border border-border rounded-2xl overflow-hidden h-full">
        
        {/* Chat Header */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between bg-muted/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-bold text-xs">Interview Agent (llama-3.3-70b-versatile)</span>
          </div>

          <button
            onClick={handleFinishInterview}
            className="px-3.5 py-1.5 text-[10px] font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors"
          >
            End Interview
          </button>
        </div>

        {/* Chat message logs stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatTranscript.map((msg, idx) => {
            const isAI = msg.sender === 'ai';
            const isEval = msg.isEvaluation;

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex space-x-3.5 ${
                  isAI ? 'justify-start' : 'justify-end'
                }`}
              >
                {/* Avatar */}
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                    <Cpu className="w-4.5 h-4.5" />
                  </div>
                )}

                {/* Bubble */}
                <div className={`group relative max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isEval
                    ? 'bg-indigo-500/5 text-indigo-400 border border-indigo-500/15 font-medium'
                    : isAI 
                      ? 'bg-muted/40 text-foreground border border-border/60'
                      : 'bg-indigo-600 text-white shadow-md'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  
                  {/* Floating Action Button (Copy text) */}
                  <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 ${
                    isAI ? 'text-muted-foreground' : 'text-white/80'
                  }`}>
                    <button 
                      onClick={() => handleCopy(msg.text, idx)}
                      className="p-1 rounded hover:bg-muted/30 transition-colors"
                      title="Copy Message"
                    >
                      {copiedId === idx ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 border border-indigo-500/10 font-bold">
                    {uploadedResume.candidate_name[0].toUpperCase()}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Typing Indicator / Thinking loader */}
          {isSubmittingAnswer && (
            <div className="flex space-x-3.5 justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                <Cpu className="w-4.5 h-4.5" />
              </div>
              <div className="bg-muted/40 border border-border/60 rounded-2xl px-5 py-4 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full typing-dot" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full typing-dot" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full typing-dot" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input form & tools panel */}
        <div className="p-4 border-t border-border bg-muted/10 space-y-2">
          
          {/* Voice recording overlay */}
          <AnimatePresence>
            {isRecording && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-semibold text-red-500 animate-pulse">Recording Answer ({formatTime(recordingTimer)})</span>
                </div>
                <button 
                  onClick={toggleVoiceRecording}
                  className="px-3 py-1 font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Stop Recording
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center space-x-2"
          >
            {/* Audio Recording Toggle */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-2.5 rounded-xl border transition-colors flex-shrink-0 ${
                isRecording 
                  ? 'bg-red-500 text-white border-red-500' 
                  : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
              title="Speak Answer"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Input Text Box */}
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSubmittingAnswer || isRecording}
              placeholder={
                isRecording 
                  ? "Speak your answer or click stop..." 
                  : "Type your detailed explanation..."
              }
              className="flex-1 h-11 px-4 bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors disabled:opacity-50"
            />

            {/* Submit Arrow */}
            <button
              type="submit"
              disabled={!inputText.trim() || isSubmittingAnswer || isRecording}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
