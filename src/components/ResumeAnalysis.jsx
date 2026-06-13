import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Mail, Phone, GraduationCap, Briefcase, Award, CheckCircle, ArrowRight, Settings } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function ResumeAnalysis() {
  const { extractedData, setActiveView, user } = useAppStore();

  if (!extractedData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-muted-foreground">
        <FileText className="w-12 h-12 mb-3 text-muted-foreground/30" />
        <p>No resume analysis active. Please upload a file first.</p>
        <button 
          onClick={() => setActiveView('upload')}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const data = extractedData;
  const matchScore = data.match_score || 85;
  const readinessScore = data.readiness_score || 80;

  // SVG parameters for circular dials
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const matchStrokeDashoffset = circumference - (matchScore / 100) * circumference;
  const readinessStrokeDashoffset = circumference - (readinessScore / 100) * circumference;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 pb-16">
      
      {/* Top dashboard summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Match Score Card */}
        <div className="glass-card rounded-3xl p-6 border border-border flex items-center space-x-6">
          <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="48" cy="48" r={radius} 
                className="stroke-muted fill-none" 
                strokeWidth="7" 
              />
              <motion.circle 
                cx="48" cy="48" r={radius} 
                className="stroke-indigo-500 fill-none" 
                strokeWidth="7" 
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: matchStrokeDashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xl font-black font-mono">{matchScore}%</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm">Resume Match Score</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Comparison against market benchmarks and job descriptions.
            </p>
          </div>
        </div>

        {/* Readiness Meter Card */}
        <div className="glass-card rounded-3xl p-6 border border-border flex items-center space-x-6">
          <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="48" cy="48" r={radius} 
                className="stroke-muted fill-none" 
                strokeWidth="7" 
              />
              <motion.circle 
                cx="48" cy="48" r={radius} 
                className="stroke-emerald-500 fill-none" 
                strokeWidth="7" 
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: readinessStrokeDashoffset }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xl font-black font-mono">{readinessScore}%</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm">Readiness Meter</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Overall grading of technical skills and certifications.
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass-card rounded-3xl p-6 border border-border flex flex-col justify-between">
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-lg truncate">{data.candidate_name}</h3>
            <div className="flex flex-col space-y-1 text-xs text-muted-foreground font-mono">
              <span className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{data.email || user?.email || 'alex.mercer@gmail.com'}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>{data.phone || '(555) 019-2834'}</span>
              </span>
            </div>
          </div>
          <button 
            onClick={() => setActiveView('setup')}
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors mt-4 flex items-center justify-center space-x-2 group"
          >
            <span>Configure Interview</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>

      {/* RAG Extracted Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols) - Skills, Experience, Projects */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Skills Badge Cloud */}
          <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
            <h3 className="font-extrabold text-base flex items-center space-x-2">
              <Award className="w-4.5 h-4.5 text-indigo-500" />
              <span>Extracted Skill Profile</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {data.skills?.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 border border-indigo-500/25 shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Projects Display */}
          <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
            <h3 className="font-extrabold text-base flex items-center space-x-2">
              <FileText className="w-4.5 h-4.5 text-indigo-500" />
              <span>Featured RAG Projects</span>
            </h3>
            <div className="space-y-4 pt-2">
              {data.projects?.map((project, index) => (
                <div 
                  key={index}
                  className="p-5 rounded-2xl bg-muted/20 border border-border/80 space-y-2.5 hover:border-indigo-500/20 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-foreground">{project.title}</h4>
                    <div className="flex gap-1">
                      {project.tech?.map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 text-[9px] font-bold bg-muted text-muted-foreground border border-border rounded-md">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col) - Education, Certifications, Experience timeline */}
        <div className="space-y-8">
          
          {/* Education */}
          <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
            <h3 className="font-extrabold text-base flex items-center space-x-2">
              <GraduationCap className="w-4.5 h-4.5 text-indigo-500" />
              <span>Education</span>
            </h3>
            <div className="space-y-3 pt-2">
              {data.education?.map((edu, index) => (
                <div key={index} className="text-xs border-l-2 border-indigo-500/40 pl-3.5 space-y-1">
                  <h4 className="font-bold text-foreground">{edu.degree}</h4>
                  <p className="text-muted-foreground text-[10px]">{edu.institution} &bull; {edu.year}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Timeline */}
          <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
            <h3 className="font-extrabold text-base flex items-center space-x-2">
              <Briefcase className="w-4.5 h-4.5 text-indigo-500" />
              <span>Experience</span>
            </h3>
            <div className="space-y-4 pt-2">
              {data.experience?.map((exp, index) => (
                <div key={index} className="text-xs border-l-2 border-indigo-500/40 pl-3.5 space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-foreground leading-tight">{exp.role}</h4>
                    <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap">{exp.duration}</span>
                  </div>
                  <p className="text-[10px] font-semibold text-indigo-400">{exp.company}</p>
                  <p className="text-muted-foreground text-[10px] leading-relaxed pt-0.5">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="glass-card rounded-3xl p-6 border border-border space-y-4">
            <h3 className="font-extrabold text-base flex items-center space-x-2">
              <CheckCircle className="w-4.5 h-4.5 text-indigo-500" />
              <span>Certifications</span>
            </h3>
            <ul className="space-y-2 pt-2">
              {data.certifications?.map((cert, index) => (
                <li key={index} className="flex items-center space-x-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="text-muted-foreground">{cert}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
