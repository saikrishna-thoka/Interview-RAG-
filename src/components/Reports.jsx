import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Search, Download, Calendar, 
  ExternalLink, Sparkles, AlertCircle, CheckCircle, Clock, Trash2
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Reports() {
  const { reports, selectedReportId, setSelectedReportId, deleteInterview } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [pdfNotification, setPdfNotification] = useState('');

  const handleDeleteReport = async (report) => {
    if (window.confirm(`Are you sure you want to delete the interview report for ${report.role}?`)) {
      try {
        await deleteInterview(report.interviewId || report.id);
      } catch (err) {
        alert("Failed to delete interview report.");
      }
    }
  };

  // Handle PDF download simulation
  const handleDownloadPdf = (report) => {
    setPdfNotification(`Generating PDF Report for ${report.role}...`);
    setTimeout(() => {
      setPdfNotification(`Success: PDF report ${report.id}.pdf has been saved to your downloads.`);
      setTimeout(() => setPdfNotification(''), 4000);
    }, 1500);
  };

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScore = r.score >= minScore;
    return matchesSearch && matchesScore;
  });

  const selectedReport = reports.find(r => r.id === selectedReportId) || reports[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 pb-16">
      
      {/* Toast Notification for PDF download */}
      {pdfNotification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-indigo-900 border border-indigo-500/30 text-indigo-200 text-xs shadow-2xl flex items-center space-x-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>{pdfNotification}</span>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Interview Reports Log</h2>
        <p className="text-sm text-muted-foreground">
          Browse through your completed practice transcripts, category grades, and download detailed feedback summaries.
        </p>
      </div>

      {/* Filter and Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table + Filter Column (2 columns width) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters Bar */}
          <div className="glass bg-background/40 border border-border p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search position (e.g. AI Engineer)..."
                className="w-full h-10 pl-9 pr-4 bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground font-semibold whitespace-nowrap">Min Score:</span>
              <select 
                value={minScore} 
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="h-10 px-3 bg-muted/40 hover:bg-muted/70 border border-border rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none transition-colors cursor-pointer"
              >
                <option value={0}>All Scores</option>
                <option value={90}>Excellent (90%+)</option>
                <option value={80}>Strong (80%+)</option>
                <option value={70}>Passing (70%+)</option>
              </select>
            </div>
          </div>

          {/* Table list */}
          <div className="glass-card rounded-2xl border border-border overflow-hidden shadow-md">
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center">
                <AlertCircle className="w-8 h-8 mb-2 text-muted-foreground/45" />
                <p>No matching report logs found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                      <th className="py-4 px-5">Date</th>
                      <th className="py-4 px-5">Target Role</th>
                      <th className="py-4 px-5">Score</th>
                      <th className="py-4 px-5">Duration</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReports.map((report) => (
                      <tr 
                        key={report.id} 
                        onClick={() => setSelectedReportId(report.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedReportId === report.id 
                            ? 'bg-indigo-500/5 hover:bg-indigo-500/10' 
                            : 'hover:bg-muted/30'
                        }`}
                      >
                        <td className="py-4 px-5 font-medium font-mono">{report.date}</td>
                        <td className="py-4 px-5 font-bold">{report.role}</td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[9px] ${
                            report.score >= 90 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/25' 
                              : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/25'
                          }`}>
                            {report.score}%
                          </span>
                        </td>
                        <td className="py-4 px-5 text-muted-foreground">{report.duration}</td>
                        <td className="py-4 px-5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => setSelectedReportId(report.id)}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                            title="View Report Panel"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDownloadPdf(report)}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteReport(report)}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                            title="Delete Interview Report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Selected Details Panel (1 column width) */}
        <div className="lg:col-span-1">
          {selectedReport ? (
            <div className="glass bg-background/30 border border-border rounded-3xl p-6 space-y-6 shadow-xl sticky top-24">
              
              {/* Header details */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-indigo-400 font-mono uppercase tracking-wider">Attempt Detail</span>
                <h3 className="font-extrabold text-base leading-tight">{selectedReport.role}</h3>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold pt-1 border-b border-border/60 pb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    <span>{selectedReport.date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>{selectedReport.duration}</span>
                  </span>
                </div>
              </div>

              {/* Scorecard Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Technical</span>
                  <h4 className="font-bold text-sm font-mono">{selectedReport.feedback.technical}%</h4>
                </div>
                <div className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Communication</span>
                  <h4 className="font-bold text-sm font-mono">{selectedReport.feedback.communication}%</h4>
                </div>
                <div className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Problem Solve</span>
                  <h4 className="font-bold text-sm font-mono">{selectedReport.feedback.problemSolving}%</h4>
                </div>
                <div className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-0.5">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Confidence</span>
                  <h4 className="font-bold text-sm font-mono">{selectedReport.feedback.confidence}%</h4>
                </div>
              </div>

              {/* Strengths bullet points */}
              <div className="space-y-2 border-t border-border/60 pt-4">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Primary Strengths</span>
                </span>
                <ul className="space-y-2 text-[10px] text-muted-foreground leading-relaxed">
                  {selectedReport.feedback.strengths?.slice(0, 2).map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Committee Critique Paragraph */}
              <div className="space-y-2 border-t border-border/60 pt-4">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Assessment Verdict</span>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {selectedReport.feedback.overallText || selectedReport.feedback.overall}
                </p>
              </div>

              {/* Download & Delete actions */}
              <div className="flex gap-2.5">
                <button 
                  onClick={() => handleDownloadPdf(selectedReport)}
                  className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report PDF</span>
                </button>
                <button 
                  onClick={() => handleDeleteReport(selectedReport)}
                  className="h-10 px-3 border border-border bg-card hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-xl transition-all flex items-center justify-center"
                  title="Delete Report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Select a session to view detailed analytics.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
