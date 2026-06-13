import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Award, Star, History, PlayCircle, 
  ArrowRight, ShieldAlert, Cpu, Sparkles, TrendingUp
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function DashboardHome() {
  const { setActiveView, uploadedResume, reports, groqKey, setSelectedReportId } = useAppStore();

  // Calculate statistics
  const totalInterviews = reports.length;
  const avgScore = totalInterviews > 0 
    ? Math.round(reports.reduce((acc, r) => acc + r.score, 0) / totalInterviews) 
    : 0;

  const handleViewReport = (id) => {
    setSelectedReportId(id);
    setActiveView('reports');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Dynamic Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl bg-gradient-to-tr from-indigo-900/40 via-indigo-950/20 to-purple-950/20 border border-indigo-500/20 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Preparedness Engine</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {!uploadedResume 
              ? "Analyze Your Resume to Start" 
              : "Ready for Your Next Practice?"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            {!uploadedResume 
              ? "Upload your resume in PDF/DOCX format. We will create custom questions matching your qualifications."
              : "Your resume is active. Kickstart a simulated interview session with our LLM examiner."}
          </p>
        </div>

        <button 
          onClick={() => setActiveView(!uploadedResume ? 'upload' : 'setup')}
          className="relative z-10 px-6 h-12 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 flex-shrink-0 group"
        >
          <span>{!uploadedResume ? "Upload Resume" : "Setup Interview"}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Grid of Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="p-6 rounded-2xl glass-card border border-border">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Runs</span>
              <h3 className="text-3xl font-extrabold font-mono">{totalInterviews}</h3>
            </div>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1.5 text-xs text-green-500 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Simulations completed</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-2xl glass-card border border-border">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Average Score</span>
              <h3 className="text-3xl font-extrabold font-mono">
                {totalInterviews > 0 ? `${avgScore}%` : 'N/A'}
              </h3>
            </div>
            <div className="p-2.5 bg-yellow-500/10 text-yellow-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1.5 text-xs text-muted-foreground font-semibold">
            <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
            <span>Target baseline: 85%</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-2xl glass-card border border-border">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Resume Profile</span>
              <h3 className="text-base font-bold truncate max-w-[150px] mt-1.5">
                {uploadedResume ? uploadedResume.candidate_name : 'No file active'}
              </h3>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-[10px] truncate max-w-full text-muted-foreground font-semibold">
            {uploadedResume ? `Match Score: ${uploadedResume.match_score}%` : 'Upload resume to analyze'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-2xl glass-card border border-border">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Inference Model</span>
              <h3 className="text-sm font-bold mt-2">
                llama-3.3-70b-versatile
              </h3>
            </div>
            <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-[10px] text-muted-foreground font-semibold">
            RAG context retrieval enabled
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recent Activity Logs (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-extrabold text-lg flex items-center space-x-2">
              <History className="w-4 h-4 text-indigo-500" />
              <span>Recent Interview Sessions</span>
            </h3>
            <button 
              onClick={() => setActiveView('reports')}
              className="text-xs text-indigo-500 hover:underline font-semibold"
            >
              See all logs
            </button>
          </div>

          <div className="glass-card rounded-2xl border border-border overflow-hidden">
            {reports.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center">
                <ShieldAlert className="w-8 h-8 mb-2 text-muted-foreground/45" />
                <p>No completed interviews found.</p>
                <button 
                  onClick={() => setActiveView('upload')}
                  className="mt-4 text-xs font-semibold text-indigo-500 hover:underline"
                >
                  Upload your CV to practice
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Position</th>
                      <th className="py-4 px-6">Rating</th>
                      <th className="py-4 px-6">Length</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reports.slice(0, 3).map((report) => (
                      <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6 font-medium font-mono">{report.date}</td>
                        <td className="py-4 px-6 font-bold">{report.role}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            report.score >= 90 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/25' 
                              : report.score >= 80
                                ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/25'
                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                          }`}>
                            {report.score}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground">{report.duration}</td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => handleViewReport(report.id)}
                            className="font-bold text-indigo-500 hover:underline hover:text-indigo-400"
                          >
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Guides & Status Panel (1 col) */}
        <div className="space-y-6">
          <h3 className="font-extrabold text-lg px-2 flex items-center space-x-2">
            <PlayCircle className="w-4 h-4 text-indigo-500" />
            <span>Launch Pad</span>
          </h3>

          <div className="glass-card rounded-2xl border border-border p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Target Checklist</h4>
              <p className="text-xs text-muted-foreground">Follow these checkpoints to optimize your performance ratings.</p>
            </div>

            <div className="space-y-3.5 pt-2">
              {/* Checkpoint 1 */}
              <div className="flex items-start space-x-3 text-xs">
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                  uploadedResume ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40' : 'border-border text-muted-foreground'
                }`}>
                  1
                </span>
                <div className="space-y-0.5">
                  <h5 className={`font-semibold ${uploadedResume ? 'text-indigo-400' : 'text-foreground'}`}>Upload CV</h5>
                  <p className="text-muted-foreground text-[10px]">Import PDF to index skills details.</p>
                </div>
              </div>

              {/* Checkpoint 2 */}
              <div className="flex items-start space-x-3 text-xs">
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                  uploadedResume ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40' : 'border-border text-muted-foreground'
                }`}>
                  2
                </span>
                <div className="space-y-0.5">
                  <h5 className={`font-semibold ${uploadedResume ? 'text-indigo-400' : 'text-foreground'}`}>Confirm Skills</h5>
                  <p className="text-muted-foreground text-[10px]">Verify match metrics on Extracted Summary tab.</p>
                </div>
              </div>

              {/* Checkpoint 3 */}
              <div className="flex items-start space-x-3 text-xs">
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                  reports.length > 0 ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40' : 'border-border text-muted-foreground'
                }`}>
                  3
                </span>
                <div className="space-y-0.5">
                  <h5 className={`font-semibold ${reports.length > 0 ? 'text-indigo-400' : 'text-foreground'}`}>Run Interview</h5>
                  <p className="text-muted-foreground text-[10px]">Finish at least 1 diagnostic practice run.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
