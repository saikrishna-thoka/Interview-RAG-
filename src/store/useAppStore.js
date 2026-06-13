import { create } from 'zustand';

// Pre-loaded historical reports for mock dashboard display
const mockReports = [
  {
    id: 'rep-001',
    date: '2026-06-10',
    role: 'AI Engineer',
    difficulty: 'Intermediate',
    score: 88,
    duration: '14 min',
    status: 'Completed',
    feedback: {
      overall: "Excellent grasp of neural architectures and LLM prompt design. Strong communication skills but could elaborate more on quantitative metrics of past projects.",
      technical: 90,
      communication: 85,
      problemSolving: 92,
      confidence: 85,
      strengths: [
        "In-depth knowledge of retrieval-augmented generation (RAG)",
        "Solid optimization techniques for Llama and Mistral models",
        "Clear and structured coding paradigms"
      ],
      weaknesses: [
        "Needs more specific stats on performance speedups",
        "Could improve explanation of vector database indexing options (e.g. HNSW vs IVF-Flat)"
      ]
    }
  },
  {
    id: 'rep-002',
    date: '2026-06-05',
    role: 'Frontend Developer',
    difficulty: 'Advanced',
    score: 92,
    duration: '18 min',
    status: 'Completed',
    feedback: {
      overall: "Superb React performance optimization knowledge and CSS skills. Flawless communication.",
      technical: 94,
      communication: 95,
      problemSolving: 88,
      confidence: 93,
      strengths: [
        "Mastery of state stores and hooks lifecycle",
        "Exceptional communication and articulation of CSS architectures",
        "Clear understanding of Webpack/Vite bundlers"
      ],
      weaknesses: [
        "Could strengthen knowledge of server component hydration details"
      ]
    }
  }
];

export const useAppStore = create((set, get) => ({
  // Theme state
  theme: localStorage.getItem('theme') || 'dark',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  // Auth state
  user: JSON.parse(localStorage.getItem('user')) || null,
  login: (email, password) => {
    const mockUser = { id: 'usr-101', email, name: email.split('@')[0], plan: 'Free' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    set({ user: mockUser, activeView: 'dashboard' });
  },
  signup: (email, password, name) => {
    const mockUser = { id: 'usr-101', email, name: name || email.split('@')[0], plan: 'Free' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    set({ user: mockUser, activeView: 'dashboard' });
  },
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, activeView: 'landing', uploadedResume: null, extractedData: null, activeInterview: null });
  },
  
  // Navigation / Views
  activeView: 'landing', // landing, login, signup, forgot-password, dashboard, upload, analysis, setup, chat, completion, reports, pricing, settings
  setActiveView: (view) => set({ activeView: view }),

  // Groq Integration State
  groqKey: localStorage.getItem('groq_key') || import.meta.env.VITE_GROQ_API_KEY || '',
  setGroqKey: (key) => {
    localStorage.setItem('groq_key', key);
    set({ groqKey: key });
  },

  // Resume Upload State
  uploadedResume: null,
  extractedData: null,
  isUploading: false,
  uploadProgress: 0,
  
  setUploadedResume: (resume) => set({ uploadedResume: resume }),
  setExtractedData: (data) => set({ extractedData: data }),
  setIsUploading: (val) => set({ isUploading: val }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  // Interview setup configuration
  interviewConfig: {
    role: 'AI Engineer',
    customRole: '',
    difficulty: 'Intermediate',
    questionCount: 10
  },
  setInterviewConfig: (config) => set((state) => ({
    interviewConfig: { ...state.interviewConfig, ...config }
  })),

  // Active Interview Session
  activeInterview: null,
  // {
  //   questions: [],
  //   currentQuestionIndex: 0,
  //   chatTranscript: [],
  //   duration: 0,
  //   timerInterval: null
  // }
  isGeneratingQuestions: false,
  isSubmittingAnswer: false,

  startInterview: (questions) => {
    // Clear any previous timer
    const currentSession = get().activeInterview;
    if (currentSession && currentSession.timerInterval) {
      clearInterval(currentSession.timerInterval);
    }

    const timerInterval = setInterval(() => {
      set((state) => {
        if (!state.activeInterview) return state;
        return {
          activeInterview: {
            ...state.activeInterview,
            duration: state.activeInterview.duration + 1
          }
        };
      });
    }, 1000);

    set({
      activeView: 'chat',
      activeInterview: {
        questions: questions,
        currentQuestionIndex: 0,
        chatTranscript: [
          {
            sender: 'ai',
            text: `Hello! Welcome to your personalized interview session. We will be discussing the **${get().interviewConfig.role === 'Custom Role' ? get().interviewConfig.customRole : get().interviewConfig.role}** position. Let's start with the first question: \n\n ${questions[0]}`,
            timestamp: new Date().toISOString()
          }
        ],
        duration: 0,
        timerInterval: timerInterval
      }
    });
  },

  submitAnswer: (answerText, evaluationText, followUpQuestion) => {
    set((state) => {
      if (!state.activeInterview) return state;
      
      const updatedTranscript = [
        ...state.activeInterview.chatTranscript,
        {
          sender: 'user',
          text: answerText,
          timestamp: new Date().toISOString()
        }
      ];

      if (evaluationText) {
        updatedTranscript.push({
          sender: 'ai',
          text: evaluationText,
          isEvaluation: true,
          timestamp: new Date().toISOString()
        });
      }

      if (followUpQuestion) {
        updatedTranscript.push({
          sender: 'ai',
          text: followUpQuestion,
          timestamp: new Date().toISOString()
        });
      }

      const nextIndex = state.activeInterview.currentQuestionIndex + 1;
      
      return {
        activeInterview: {
          ...state.activeInterview,
          chatTranscript: updatedTranscript,
          currentQuestionIndex: nextIndex
        }
      };
    });
  },

  setGeneratingQuestions: (val) => set({ isGeneratingQuestions: val }),
  setSubmittingAnswer: (val) => set({ isSubmittingAnswer: val }),

  completeInterview: (finalEvaluation) => {
    const session = get().activeInterview;
    if (session && session.timerInterval) {
      clearInterval(session.timerInterval);
    }

    const durationMin = session ? Math.floor(session.duration / 60) : 10;
    const durationStr = `${durationMin} min`;
    const selectedRole = get().interviewConfig.role === 'Custom Role' ? get().interviewConfig.customRole : get().interviewConfig.role;

    const newReport = {
      id: `rep-${Math.floor(Math.random() * 1000 + 100)}`,
      date: new Date().toISOString().split('T')[0],
      role: selectedRole,
      difficulty: get().interviewConfig.difficulty,
      score: finalEvaluation.overall,
      duration: durationStr,
      status: 'Completed',
      feedback: finalEvaluation
    };

    set((state) => ({
      reports: [newReport, ...state.reports],
      activeView: 'completion',
      activeInterview: {
        ...state.activeInterview,
        timerInterval: null
      }
    }));
  },

  // Reports Log
  reports: mockReports,
  addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
  
  // Active report viewing
  selectedReportId: 'rep-001',
  setSelectedReportId: (id) => set({ selectedReportId: id }),

  // Notifications
  notifications: [
    { id: 1, text: 'Welcome to InterviewRAG AI! Complete your first resume upload to begin.', read: false },
    { id: 2, text: 'Groq LLM Service status is operational.', read: true }
  ],
  markNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  }))
}));
