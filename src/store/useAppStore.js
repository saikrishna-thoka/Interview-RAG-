import { create } from 'zustand';

const isSupabaseConfigured = false;
const supabase = null;

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

  // Groq API Key state
  groqKey: localStorage.getItem('groq_api_key') || '',
  setGroqKey: (key) => {
    localStorage.setItem('groq_api_key', key);
    set({ groqKey: key });
  },

  // Auth state
  user: null,
  session: null,
  authInitialized: false,
  isSupabaseConfigured: isSupabaseConfigured,
  supabaseConnectionStatus: 'checking', // 'checking', 'connected', 'disconnected', 'unconfigured'
  
  initializeAuth: async () => {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not configured. Using local mock guest auth.");
      set({ supabaseConnectionStatus: 'unconfigured', authInitialized: true });
      const mockUser = JSON.parse(localStorage.getItem('user')) || null;
      set({ user: mockUser });
      if (mockUser) {
        get().fetchUserResume();
        get().fetchReports();
      }
      return;
    }

    // Test Supabase connection
    set({ supabaseConnectionStatus: 'checking' });
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      const rawUser = session?.user || null;
      const user = rawUser ? {
        ...rawUser,
        name: rawUser.user_metadata?.full_name || rawUser.user_metadata?.name || rawUser.email?.split('@')[0] || 'Candidate'
      } : null;

      // Ping table to verify query capability
      const { error: pingError } = await supabase.from('subscription_plans').select('id').limit(1);
      if (pingError) throw pingError;

      set({ 
        user, 
        session, 
        authInitialized: true,
        supabaseConnectionStatus: 'connected'
      });
      
      if (user) {
        // Pre-load user details
        await get().fetchUserResume();
        await get().fetchReports();
        await get().fetchActiveInterviews();
        await get().fetchSubscription();
      }
    } catch (e) {
      console.error("Supabase connection / initialization error:", e);
      set({ 
        authInitialized: true,
        supabaseConnectionStatus: 'disconnected'
      });
      // Fallback to local guest mock
      const mockUser = JSON.parse(localStorage.getItem('user')) || null;
      set({ user: mockUser });
      if (mockUser) {
        get().fetchUserResume();
        get().fetchReports();
      }
    }

    // Subscribe to auth state changes
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      const rawNewUser = newSession?.user || null;
      const newUser = rawNewUser ? {
        ...rawNewUser,
        name: rawNewUser.user_metadata?.full_name || rawNewUser.user_metadata?.name || rawNewUser.email?.split('@')[0] || 'Candidate'
      } : null;
      
      set({ user: newUser, session: newSession });
      
      if (newUser) {
        await get().fetchUserResume();
        await get().fetchReports();
        await get().fetchActiveInterviews();
        await get().fetchSubscription();
        if (get().activeView === 'landing' || ['login', 'signup'].includes(get().activeView)) {
          set({ activeView: 'dashboard' });
        }
      } else {
        set({ 
          uploadedResume: null, 
          extractedData: null, 
          reports: [], 
          activeInterviews: [],
          activeInterview: null,
          activeView: 'landing' 
        });
      }
    });
  },

  login: async (email, password) => {
    if (!isSupabaseConfigured) {
      const mockUser = { id: 'usr-101', email, name: email.split('@')[0], plan: 'Free' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      set({ user: mockUser, activeView: 'dashboard' });
      get().fetchReports();
      return;
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signup: async (email, password, name) => {
    if (!isSupabaseConfigured) {
      const mockUser = { id: 'usr-101', email, name: name || email.split('@')[0], plan: 'Free' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      set({ user: mockUser, activeView: 'dashboard' });
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });
    if (error) throw error;
  },

  loginWithGoogle: async () => {
    if (!isSupabaseConfigured) {
      get().login("google.candidate@gmail.com", "google-oauth-token");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  },

  logout: async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('user');
      set({ user: null, activeView: 'landing' });
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Active View Tab Routing
  activeView: 'landing',
  setActiveView: (view) => set({ activeView: view }),

  // Resume State
  uploadedResume: null,
  extractedData: null,
  isUploading: false,
  uploadProgress: 0,
  
  setUploadedResume: (resume) => set({ uploadedResume: resume }),
  setExtractedData: (data) => set({ extractedData: data }),
  setIsUploading: (val) => set({ isUploading: val }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  fetchUserResume: async () => {
    const user = get().user;
    if (!user) return;

    if (!isSupabaseConfigured) {
      const mockResume = JSON.parse(localStorage.getItem('mock_resume')) || null;
      set({ uploadedResume: mockResume, extractedData: mockResume });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      set({ uploadedResume: data, extractedData: data });
    } catch (e) {
      console.error("Error fetching user resume:", e);
    }
  },

  deleteResume: async (id) => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('mock_resume');
      set({ uploadedResume: null, extractedData: null });
      return;
    }

    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set({ uploadedResume: null, extractedData: null });
    } catch (e) {
      console.error("Error deleting resume:", e);
      throw e;
    }
  },

  // Interview setup state configuration
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
  isGeneratingQuestions: false,
  isSubmittingAnswer: false,

  startInterview: async (questionsListOrId, optionalQuestionsList = null) => {
    // Determine the parameters based on the arguments
    let finalQuestions = null;
    let finalInterviewId = null;

    if (optionalQuestionsList) {
      finalInterviewId = questionsListOrId;
      finalQuestions = optionalQuestionsList;
    } else {
      finalQuestions = questionsListOrId;
      if (finalQuestions && finalQuestions[0] && typeof finalQuestions[0] === 'object' && finalQuestions[0].interview_id) {
        finalInterviewId = finalQuestions[0].interview_id;
      } else {
        finalInterviewId = `int-${Math.floor(Math.random() * 10000 + 1000)}`;
      }
    }

    // Clear any previous timers
    const prevSession = get().activeInterview;
    if (prevSession && prevSession.timerInterval) {
      clearInterval(prevSession.timerInterval);
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

    // Initial message from AI
    const firstQuestion = finalQuestions[0]?.question_text || finalQuestions[0];
    const roleText = get().interviewConfig.role === 'Custom Role' ? get().interviewConfig.customRole : get().interviewConfig.role;

    set({
      activeView: 'chat',
      activeInterview: {
        id: finalInterviewId,
        questions: finalQuestions,
        currentQuestionIndex: 0,
        chatTranscript: [
          {
            sender: 'ai',
            text: `Welcome! Let's start your personalized technical interview for the **${roleText}** position. \n\n**Question 1:** ${firstQuestion}`,
            timestamp: new Date().toISOString()
          }
        ],
        duration: 0,
        timerInterval: timerInterval
      }
    });
  },

  // Resumes an active interview session from PostgreSQL state
  resumeInterviewSession: async (interview) => {
    const user = get().user;
    if (!user) return;

    if (!isSupabaseConfigured) {
      alert("Database connections are disabled.");
      return;
    }

    try {
      // 1. Fetch questions queue
      const { data: qData, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .eq('interview_id', interview.id)
        .order('sequence_number', { ascending: true });

      if (qErr) throw qErr;

      // 2. Fetch answers given so far
      const { data: aData, error: aErr } = await supabase
        .from('answers')
        .select('*, questions(question_text)')
        .eq('user_id', user.id)
        .eq('questions.interview_id', interview.id);

      // Rebuild chat transcript
      const chatTranscript = [];
      let currentIndex = 0;

      qData.forEach((q, idx) => {
        const matchingAns = aData?.find(a => a.question_id === q.id);

        if (idx === 0) {
          chatTranscript.push({
            sender: 'ai',
            text: `Welcome back! Let's resume your interview for the **${interview.role}** position. \n\n**Question 1:** ${q.question_text}`,
            timestamp: interview.created_at
          });
        } else if (idx <= currentIndex) {
          chatTranscript.push({
            sender: 'ai',
            text: q.question_text,
            timestamp: new Date().toISOString()
          });
        }

        if (matchingAns) {
          chatTranscript.push({
            sender: 'user',
            text: matchingAns.answer_text,
            timestamp: matchingAns.created_at
          });
          if (matchingAns.evaluation?.evaluation) {
            chatTranscript.push({
              sender: 'ai',
              text: matchingAns.evaluation.evaluation,
              isEvaluation: true,
              timestamp: matchingAns.created_at
            });
          }
          currentIndex = idx + 1;
        }
      });

      // Clear any previous timers
      const prevSession = get().activeInterview;
      if (prevSession && prevSession.timerInterval) {
        clearInterval(prevSession.timerInterval);
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

      // Set active configuration
      set({
        activeView: 'chat',
        interviewConfig: {
          role: interview.role,
          customRole: '',
          difficulty: interview.difficulty,
          questionCount: qData.length
        },
        activeInterview: {
          id: interview.id,
          questions: qData,
          currentQuestionIndex: currentIndex,
          chatTranscript: chatTranscript,
          duration: 0,
          timerInterval: timerInterval
        }
      });

      // If all questions are already answered but final evaluation is missing, call final complete
      if (currentIndex >= qData.length) {
        clearInterval(timerInterval);
        set({
          activeInterview: {
            ...get().activeInterview,
            timerInterval: null
          }
        });
      }

    } catch (e) {
      console.error("Error resuming interview session:", e);
      alert("Failed to resume session.");
    }
  },

  submitAnswer: async (answerText, evaluationText, scoreVal) => {
    const session = get().activeInterview;
    const user = get().user;
    if (!session || !user) return;

    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isMock = !isSupabaseConfigured;

    if (!isMock) {
      try {
        // Insert user response into answers table in PostgreSQL
        const { error } = await supabase
          .from('answers')
          .insert({
            user_id: user.id,
            question_id: currentQuestion.id,
            answer_text: answerText,
            evaluation: { evaluation: evaluationText },
            score: scoreVal
          });
        if (error) throw error;
      } catch (e) {
        console.error("Failed to persist answer in Postgres:", e);
      }
    }

    set((state) => {
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

      const nextIndex = state.activeInterview.currentQuestionIndex + 1;
      const hasMore = nextIndex < session.questions.length;

      if (hasMore) {
        const nextQ = session.questions[nextIndex];
        const nextQText = nextQ.question_text || nextQ;
        updatedTranscript.push({
          sender: 'ai',
          text: nextQText,
          timestamp: new Date().toISOString()
        });
      }

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

  completeInterview: async (finalEvaluation) => {
    const session = get().activeInterview;
    const user = get().user;
    if (session && session.timerInterval) {
      clearInterval(session.timerInterval);
    }

    if (!session || !user) return;

    if (!isSupabaseConfigured) {
      const mockReport = {
        id: `rep-${Math.floor(Math.random() * 1000 + 100)}`,
        date: new Date().toISOString().split('T')[0],
        role: get().interviewConfig.role,
        score: finalEvaluation.overall,
        duration: '12 min',
        status: 'Completed',
        feedback: finalEvaluation
      };
      set((state) => ({
        reports: [mockReport, ...state.reports],
        activeView: 'completion',
        activeInterview: null
      }));
      return;
    }

    try {
      // 1. Update active interview record in DB to Completed
      const { error: intErr } = await supabase
        .from('interviews')
        .update({
          status: 'Completed',
          score: finalEvaluation.overall,
          completed_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (intErr) throw intErr;

      // 2. Insert analytical scorecard into reports table
      const { error: repErr } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          interview_id: session.id,
          overall_score: finalEvaluation.overall,
          technical_score: finalEvaluation.technical,
          communication_score: finalEvaluation.communication,
          confidence_score: finalEvaluation.confidence,
          strengths: finalEvaluation.strengths,
          weaknesses: finalEvaluation.weaknesses,
          recommendations: finalEvaluation.recommendations || []
        });

      if (repErr) throw repErr;

      // 3. Reload reports log
      await get().fetchReports();
      
      set({ 
        activeView: 'completion', 
        selectedReportId: null, // load newest automatically
        activeInterview: {
          ...session,
          timerInterval: null
        }
      });
    } catch (e) {
      console.error("Failed to complete interview in database:", e);
      alert("Failed to save evaluation reports.");
    }
  },

  // Reports
  reports: [],
  selectedReportId: null,
  setSelectedReportId: (id) => set({ selectedReportId: id }),

  fetchReports: async () => {
    const user = get().user;
    if (!user) return;

    if (!isSupabaseConfigured) {
      return; // static loaded on store instantiation
    }

    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          overall_score,
          technical_score,
          communication_score,
          confidence_score,
          strengths,
          weaknesses,
          recommendations,
          generated_at,
          interviews (
            id,
            role,
            difficulty,
            created_at,
            completed_at
          )
        `)
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false });

      if (error) throw error;

      // Map to local structure
      const formatted = data.map(r => {
        const durationMin = r.interviews?.completed_at && r.interviews?.created_at
          ? Math.max(1, Math.round((new Date(r.interviews.completed_at) - new Date(r.interviews.created_at)) / 1000 / 60))
          : 10;

        return {
          id: r.id,
          interviewId: r.interviews?.id || null,
          date: new Date(r.generated_at).toISOString().split('T')[0],
          role: r.interviews?.role || 'AI Engineer',
          difficulty: r.interviews?.difficulty || 'Intermediate',
          score: r.overall_score,
          duration: `${durationMin} min`,
          status: 'Completed',
          feedback: {
            overall: `Evaluation grades compiled on ${new Date(r.generated_at).toLocaleDateString()}`,
            overallText: `Evaluation grades compiled on ${new Date(r.generated_at).toLocaleDateString()}`,
            technical: r.technical_score,
            communication: r.communication_score,
            problemSolving: r.overall_score, // default back
            confidence: r.confidence_score,
            strengths: r.strengths,
            weaknesses: r.weaknesses,
            recommendations: r.recommendations
          }
        };
      });

      set({ reports: formatted });
    } catch (e) {
      console.error("Failed to fetch reports:", e);
    }
  },

  // Active user plan subscription
  activeSubscription: null,
  fetchSubscription: async () => {
    const user = get().user;
    if (!user) return;

    if (!isSupabaseConfigured) {
      set({ activeSubscription: { plan_name: 'Free Starter', limits: { questions: 10, resumes: 1 } } });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        set({ 
          activeSubscription: {
            plan_name: data.subscription_plans?.name || 'Free Starter',
            limits: {
              questions: data.subscription_plans?.question_limit || 10,
              resumes: data.subscription_plans?.resume_limit || 1
            },
            expires_at: data.expires_at
          }
        });
      } else {
        set({ activeSubscription: { plan_name: 'Free Starter', limits: { questions: 10, resumes: 1 } } });
      }
    } catch (e) {
      console.error("Error loading active user subscription:", e);
    }
  },

  // Notifications
  notifications: [
    { id: 1, text: 'Welcome to InterviewRAG AI! Complete your first resume upload to begin.', read: false },
    { id: 2, text: 'Supabase and PostgreSQL integrations are fully operational.', read: false }
  ],
  markNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),

  // Active Interviews & Resuming
  activeInterviews: [],
  fetchActiveInterviews: async () => {
    const user = get().user;
    if (!user || !isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'In Progress')
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ activeInterviews: data });
    } catch (e) {
      console.error("Error fetching active interviews:", e);
    }
  },

  deleteInterview: async (interviewId) => {
    const user = get().user;
    if (!user) return;
    if (!isSupabaseConfigured) {
      set((state) => ({
        reports: state.reports.filter(r => r.id !== interviewId && r.interviewId !== interviewId)
      }));
      return;
    }
    try {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', interviewId);
      if (error) throw error;
      await get().fetchReports();
      await get().fetchActiveInterviews();
      
      // If the deleted interview was the active interview, clear it
      const currentActive = get().activeInterview;
      if (currentActive && currentActive.id === interviewId) {
        if (currentActive.timerInterval) clearInterval(currentActive.timerInterval);
        set({ activeInterview: null, activeView: 'dashboard' });
      }
    } catch (e) {
      console.error("Failed to delete interview:", e);
      throw e;
    }
  }
}));
