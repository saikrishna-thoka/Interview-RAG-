import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertTriangle, RefreshCw, Cpu, Database, ArrowRight } from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { useAppStore } from '../store/useAppStore';

export default function ResumeUpload() {
  const { 
    setUploadedResume, setExtractedData, setActiveView, 
    isUploading, setIsUploading, uploadProgress, setUploadProgress 
  } = useAppStore();

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndProcessFile = async (uploadedFile) => {
    setError('');
    const extension = uploadedFile.name.split('.').pop().toLowerCase();
    
    if (extension !== 'pdf' && extension !== 'docx') {
      setError('Unsupported format. Please upload a PDF or DOCX file.');
      return;
    }

    setFile(uploadedFile);
    setIsUploading(true);
    setUploadProgress(10);
    setStatusText('Reading file binary...');

    try {
      // Simulate chunking and embedding steps
      const progressSteps = [
        { progress: 30, text: 'Extracting document text schemas...' },
        { progress: 55, text: 'Chunking sections & indexing vectors...' },
        { progress: 80, text: 'Uploading vector embeddings to database...' },
        { progress: 95, text: 'Finalizing candidate RAG profile context...' }
      ];

      for (const step of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setUploadProgress(step.progress);
        setStatusText(step.text);
      }

      // Call resume parsing service
      const parsedResume = await resumeService.uploadResume(uploadedFile);
      
      setUploadProgress(100);
      setStatusText('RAG Embeddings generated!');
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Save to Zustand
      setUploadedResume(parsedResume);
      setExtractedData(parsedResume);
      
      // Auto transition to analyzer screen
      setActiveView('analysis');
    } catch (e) {
      setError(e.message || 'Failed to parse resume');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setStatusText('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">RAG Context Synthesis</h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Upload your resume below. Our pipeline will perform semantic extraction and compile vector embeddings to anchor your AI interview prompts.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center space-x-2.5"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Upload Zone & States */}
      <div className="glass bg-background/50 border border-border rounded-3xl p-8 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!isUploading && !file && (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={onButtonClick}
              className={`border-2 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-500/5 scale-[0.99]' 
                  : 'border-border hover:border-indigo-500/50 hover:bg-muted/10'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleChange}
                accept=".pdf,.docx"
                className="hidden" 
              />
              <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base mb-1">Drag and drop your file here</h3>
              <p className="text-xs text-muted-foreground mb-4">Supported formats: PDF or DOCX (Max 10MB)</p>
              <button 
                type="button"
                className="px-5 h-10 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Browse Files
              </button>
            </motion.div>
          )}

          {isUploading && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center text-center"
            >
              <div className="relative mb-6 flex items-center justify-center">
                {/* Spinning loader */}
                <div className="w-16 h-16 rounded-full border-2 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                <Database className="w-6 h-6 text-indigo-500 absolute animate-pulse" />
              </div>

              <h3 className="font-bold text-lg mb-1">Processing Document</h3>
              <p className="text-xs text-muted-foreground mb-6 font-medium animate-pulse">{statusText}</p>
              
              {/* Progress bar container */}
              <div className="w-full max-w-sm h-2.5 bg-muted rounded-full overflow-hidden border border-border">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.1 }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                />
              </div>
              <span className="text-[10px] font-bold text-indigo-400 mt-2 font-mono">{uploadProgress}%</span>
            </motion.div>
          )}

          {file && !isUploading && (
            <motion.div
              key="completed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center text-center"
            >
              <div className="p-4 bg-green-500/10 text-green-500 rounded-full mb-4">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="font-bold text-base mb-1">Upload Successful</h3>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-6 bg-muted/30 px-3.5 py-1.5 rounded-xl border border-border">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-foreground max-w-[180px] truncate">{file.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => { setFile(null); setError(''); }}
                  className="px-4 h-10 text-xs font-semibold border border-border hover:bg-muted rounded-lg transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Upload Different File</span>
                </button>
                <button 
                  onClick={() => setActiveView('analysis')}
                  className="px-5 h-10 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1.5"
                >
                  <span>View Extracted RAG</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Card on RAG vectors */}
      <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start space-x-4">
        <Cpu className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm">Why PDF / DOCX RAG?</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Standard interview generators ask generic templates. By loading your resume into a retrieval context, the AI parses specific libraries (e.g. `Zustand`, `PyTorch`), reads details about your listed projects (e.g. `reducing response load by 30%`), and benchmarks technical scenarios against your real-world background.
          </p>
        </div>
      </div>
    </div>
  );
}
