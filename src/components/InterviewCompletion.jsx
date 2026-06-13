import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, CheckCircle2, ChevronRight, Download, 
  HelpCircle, Home, RotateCcw, AlertCircle, FileText, CheckCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function InterviewCompletion() {
  const { reports, setActiveView } = useAppStore();

  const latestReport = reports[0];

  if (!latestReport) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-muted-foreground h-96">
        <HelpCircle className="w-12 h-12 mb-3 text-muted-foreground/30 animate-bounce" />
        <p>No completed interviews on file. Please take an interview session.</p>
        <button 
          onClick={() => setActiveView('setup')}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Setup Setup
        </button>
      </div>
    );
  }

  const { role, difficulty, score, feedback } = latestReport;
  
  // Custom SVG Radar chart values
  const categories = [
    { name: "Technical", value: feedback.technical || 80 },
    { name: "Communication", value: feedback.communication || 80 },
    { name: "Problem Solving", value: feedback.problemSolving || 80 },
    { name: "Confidence", value: feedback.confidence || 80 },
    { name: "Domain Logic", value: Math.round((feedback.technical + feedback.problemSolving) / 2) }
  ];

  // Coordinates builder for SVG radar chart pentagon
  const width = 300;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = 100;

  const getCoordinatesForValue = (index, value) => {
    const angle = (Math.PI * 2 / 5) * index - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  // Build grid lines
  const gridRadii = [25, 50, 75, 100];
  const gridPoints = gridRadii.map(r => 
    [0, 1, 2, 3, 4].map(i => {
      const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
      return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
    }).join(' ')
  );

  // Build values polygon
  const valuePoints = categories.map((cat, i) => {
    const { x, y } = getCoordinatesForValue(i, cat.value);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 pb-16">
      
      {/* Header card with overall score */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-3xl bg-gradient-to-tr from-emerald-950/30 via-zinc-900/10 to-indigo-950/20 border border-border/80 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
        <div className="space-y-3 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Interview Evaluated</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Performance Summary</h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            Congratulations! You finished the **{role}** practice session. Below is your skill scorecard compiled by the RAG critique model.
          </p>
        </div>

        {/* Scoring Dial */}
        <div className="flex flex-col items-center flex-shrink-0 relative z-10">
          <div className="w-32 h-32 rounded-full border-8 border-emerald-500/10 border-t-emerald-500 flex items-center justify-center relative">
            <span className="text-3xl font-black font-mono">{score}%</span>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mt-3">Overall score</span>
        </div>
      </motion.div>

      {/* Main analytical breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Area (2 columns): Category Bars & Strengths */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Progress Bars breakdown */}
          <div className="glass-card rounded-3xl p-6 border border-border space-y-5">
            <h3 className="font-extrabold text-base flex items-center space-x-2">
              <Award className="w-4.5 h-4.5 text-indigo-500" />
              <span>Assessment Breakdown</span>
            </h3>

            <div className="space-y-4 pt-2">
              {categories.slice(0, 4).map((cat, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span>{cat.name} Score</span>
                    <span className="font-mono">{cat.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/80">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.value}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.15 }}
                      className={`h-full rounded-full bg-gradient-to-r ${
                        cat.value >= 90 
                          ? 'from-emerald-500 to-green-400' 
                          : cat.value >= 80 
                            ? 'from-indigo-500 to-indigo-400' 
                            : 'from-amber-500 to-amber-400'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Areas of Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl space-y-4">
              <h4 className="font-extrabold text-sm text-emerald-400 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Major Strengths</span>
              </h4>
              <ul className="space-y-3 text-xs leading-relaxed text-slate-300">
                {feedback.strengths?.map((str, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas of Improvement */}
            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl space-y-4">
              <h4 className="font-extrabold text-sm text-amber-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Areas of Growth</span>
              </h4>
              <ul className="space-y-3 text-xs leading-relaxed text-slate-300">
                {feedback.weaknesses?.map((weak, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Overall feedback critique block */}
          <div className="glass-card rounded-3xl p-6 border border-border space-y-3">
            <h3 className="font-extrabold text-sm">Hiring Committee Verdict</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {feedback.overallText || feedback.overall}
            </p>
          </div>

        </div>

        {/* Right Area (1 column): Custom Radar Chart & Action Toggles */}
        <div className="space-y-8">
          
          {/* Radar Chart */}
          <div className="glass-card rounded-3xl p-6 border border-border flex flex-col items-center">
            <h3 className="font-extrabold text-sm text-muted-foreground uppercase tracking-wider mb-4 font-mono">Skill Polygon</h3>
            
            <div className="relative w-full aspect-square flex items-center justify-center">
              <svg width={width} height={height} className="overflow-visible">
                {/* Concentric grid lines pentagons */}
                {gridPoints.map((points, idx) => (
                  <polygon 
                    key={idx} 
                    points={points} 
                    className="stroke-border/40 fill-none" 
                    strokeWidth="1.5" 
                  />
                ))}

                {/* Connecting axis lines */}
                {[0, 1, 2, 3, 4].map(i => {
                  const outer = getCoordinatesForValue(i, 100);
                  return (
                    <line 
                      key={i} 
                      x1={centerX} y1={centerY} 
                      x2={outer.x} y2={outer.y} 
                      className="stroke-border/30" 
                      strokeWidth="1.5" 
                    />
                  );
                })}

                {/* Values Polygon fill */}
                <polygon 
                  points={valuePoints} 
                  className="stroke-indigo-500 fill-indigo-500/20" 
                  strokeWidth="2.5" 
                  strokeLinejoin="round"
                />

                {/* Vertex label texts */}
                {categories.map((cat, i) => {
                  const outer = getCoordinatesForValue(i, 115);
                  // Adjust label offsets to prevent cutting off text
                  let textAnchor = "middle";
                  if (outer.x < centerX - 20) textAnchor = "end";
                  if (outer.x > centerX + 20) textAnchor = "start";

                  return (
                    <text 
                      key={i} 
                      x={outer.x} y={outer.y + 4} 
                      className="fill-muted-foreground font-semibold text-[9px] uppercase font-sans tracking-wide" 
                      textAnchor={textAnchor}
                    >
                      {cat.name}
                    </text>
                  );
                })}

                {/* Vertex dots */}
                {categories.map((cat, i) => {
                  const pt = getCoordinatesForValue(i, cat.value);
                  return (
                    <circle 
                      key={i} 
                      cx={pt.x} cy={pt.y} r="3.5" 
                      className="fill-indigo-400 stroke-background" 
                      strokeWidth="1.5" 
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Action Links Portal */}
          <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
            <h3 className="font-extrabold text-sm">Next Steps</h3>
            
            <div className="space-y-3 pt-2">
              <button 
                onClick={() => setActiveView('setup')}
                className="w-full h-11 border border-border hover:bg-muted text-foreground font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Mock Interview</span>
              </button>
              <button 
                onClick={() => setActiveView('reports')}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View All History Logs</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
