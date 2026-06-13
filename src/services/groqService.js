import { useAppStore } from '../store/useAppStore';
import { supabase } from './supabaseClient';

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.3-70b-versatile";
const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Helper function to call Groq API
async function callGroqAPI(messages, responseJson = false) {
  const { groqKey } = useAppStore.getState();
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || groqKey;
  
  if (!apiKey) {
    throw new Error("Groq API Key is missing. Please configure VITE_GROQ_API_KEY in your env settings.");
  }

  const payload = {
    model: MODEL_NAME,
    messages: messages,
    temperature: 0.7,
  };

  if (responseJson) {
    payload.response_format = { type: "json_object" };
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error?.message || `Groq API Error: ${response.statusText}`;
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Local mock questions fallbacks
const mockQuestionsByRole = {
  "AI Engineer": [
    "What is retrieval-augmented generation (RAG), and how do you handle vector database indexing and retrieval latency?",
    "Explain how you would fine-tune a model like Llama 3 for a specific domain task. What hyperparameter adjustments would you make?",
    "In your RAG system project, how did you handle document chunking and overlapping, and what chunk evaluation metrics did you use?",
    "How do you deal with hallucination in production LLM products? What safety rails or guardrails have you implemented?"
  ],
  "Full Stack Developer": [
    "Explain how web performance metrics like LCP, FID, and CLS are affected by React rendering structures.",
    "How do you design a secure, distributed session management system across separate client and server domains?",
    "What is the difference between REST, GraphQL, and WebSockets? In what scenarios do you prefer each?"
  ]
};
const defaultMockQuestions = [
  "Can you describe your most challenging software project? What tech stack did you choose and why?",
  "How do you approach learning a new technology or framework under tight deadlines?"
];

export const groqService = {
  // Generate questions, create interview, and save questions to PostgreSQL
  generateQuestions: async (resumeData, role, difficulty, count = 10) => {
    const { user } = useAppStore.getState();
    if (!user) throw new Error("User session required to start interviews.");

    let generatedQuestionsText = [];

    // 1. Generate questions text (live via Groq or fallback to local mock list)
    const apiKey = import.meta.env.VITE_GROQ_API_KEY || useAppStore.getState().groqKey;

    if (apiKey) {
      try {
        const prompt = `
          You are an elite technical interviewer. You have access to a candidate's resume and details.
          Generate exactly ${count} tailored, highly relevant interview questions for the role: **${role}** at difficulty level: **${difficulty}**.
          
          Candidate Resume Details:
          - Skills: ${resumeData.skills?.join(', ') || 'N/A'}
          - Projects: ${JSON.stringify(resumeData.projects || [])}
          - Experience: ${JSON.stringify(resumeData.experience || [])}
          
          Guidelines:
          1. Mix technical theory, code architecture, and behavioral questions related to their actual projects.
          2. Tailor questions strictly to their background (using RAG context) and the target role: ${role}.
          3. Output a JSON object with a single key "questions" containing a list of strings.
          
          Example Output format:
          {
            "questions": [
              "Given your project X using React, how did you handle...",
              "In your experience as Y, how did you..."
            ]
          }
        `;

        const systemMessage = [
          { role: "system", content: "You are an AI assistant designed to output only structured JSON containing interview questions." },
          { role: "user", content: prompt }
        ];

        const responseText = await callGroqAPI(systemMessage, true);
        const parsed = JSON.parse(responseText);
        
        if (parsed.questions && Array.isArray(parsed.questions)) {
          generatedQuestionsText = parsed.questions;
        } else {
          throw new Error("Malformed JSON received from Groq");
        }
      } catch (e) {
        console.error("Failed to call Groq API. Using mock generator fallback.", e);
        const sourceList = mockQuestionsByRole[role] || mockQuestionsByRole["AI Engineer"] || defaultMockQuestions;
        for (let i = 0; i < count; i++) {
          generatedQuestionsText.push(sourceList[i % sourceList.length]);
        }
      }
    } else {
      // Offline/No Key Mock setup
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const sourceList = mockQuestionsByRole[role] || mockQuestionsByRole["AI Engineer"] || defaultMockQuestions;
      for (let i = 0; i < count; i++) {
        generatedQuestionsText.push(sourceList[i % sourceList.length]);
      }
    }

    // 2. Persist to database if Supabase is connected
    if (isSupabaseConfigured) {
      try {
        // Insert Interview Row
        const { data: interviewData, error: intErr } = await supabase
          .from('interviews')
          .insert({
            user_id: user.id,
            resume_id: resumeData.id,
            role: role,
            difficulty: difficulty,
            status: 'In Progress'
          })
          .select()
          .single();

        if (intErr) throw intErr;

        // Batch insert Question Rows
        const questionRows = generatedQuestionsText.map((qText, idx) => ({
          user_id: user.id,
          interview_id: interviewData.id,
          question_text: qText,
          question_type: 'Technical',
          difficulty: difficulty,
          sequence_number: idx + 1
        }));

        const { data: questionsData, error: qErr } = await supabase
          .from('questions')
          .insert(questionRows)
          .select()
          .order('sequence_number', { ascending: true });

        if (qErr) throw qErr;

        return questionsData;
      } catch (e) {
        console.error("Failed to save session to PostgreSQL database:", e);
        throw new Error(`Database transaction failed: ${e.message}`);
      }
    }

    // Return plain text mock array if offline
    return generatedQuestionsText;
  },

  // Evaluate candidate's answer and produce immediate feedback + score
  evaluateAnswer: async (resumeData, role, difficulty, question, answerText, history = []) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY || useAppStore.getState().groqKey;

    if (!apiKey) {
      // Mock evaluation offline
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const score = Math.floor(Math.random() * 3) + 8; // 8, 9, 10
      return {
        evaluation: `**System Evaluation (Score: ${score}/10):** Solid response. You detailed your project's architecture, demonstrating a clear understanding of the tools.`,
        score: score
      };
    }

    try {
      const contextTranscript = history.map(msg => `${msg.sender === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.text}`).join('\n');
      const qText = question.question_text || question;
      
      const prompt = `
        You are a senior technical interviewer. Evaluate the candidate's answer to the question.
        
        Target Role: ${role}
        Difficulty: ${difficulty}
        
        Current Question: "${qText}"
        Candidate's Answer: "${answerText}"
        
        Previous Conversation Transcript (for context):
        ${contextTranscript}
        
        Provide your assessment. Your response must be in JSON format with two keys:
        1. "evaluation": A concise conversational evaluation paragraph (2-3 sentences max) summarizing their answer's strengths, missing areas, and a rating out of 10. Start with "**System Evaluation (Score: X/10):**".
        2. "score": An integer rating from 1 to 10.
        
        Example Output format:
        {
          "evaluation": "**System Evaluation (Score: 8/10):** Good explanation of vectors. You correctly explained indexing, though you left out HNSW details. Nice description of Pinecone latency.",
          "score": 8
        }
      `;

      const messages = [
        { role: "system", content: "You are an AI developer interviewer. You must evaluate the candidate's response and output only structured JSON." },
        { role: "user", content: prompt }
      ];

      const responseText = await callGroqAPI(messages, true);
      return JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to evaluate answer via Groq. Using local mock.", e);
      return {
        evaluation: `**System Evaluation (Score: 8/10):** Good foundation. You explained your reasoning well, though expanding on system constraints would be helpful.`,
        score: 8
      };
    }
  },

  // Generate the final interview assessment report
  generateFinalEvaluation: async (resumeData, role, difficulty, chatTranscript) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY || useAppStore.getState().groqKey;

    if (!apiKey) {
      // Mock final evaluation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const overall = Math.floor(Math.random() * 10) + 85;
      return {
        overall: overall,
        technical: Math.min(100, overall + 2),
        communication: Math.min(100, overall - 3),
        problemSolving: Math.min(100, overall + 4),
        confidence: Math.min(100, overall + 1),
        overallText: `Excellent job! Throughout the interview for the ${role} position, you displayed a deep understanding of software engineering and specific domain tools.`,
        strengths: ["Excellent structure", "Knowledge of vector retrieval databases", "Clear and confident communication style"],
        weaknesses: ["Could benefit from more load metrics references", "elaborate on model quantization details"],
        recommendations: ["Review pgvector HNSW configurations", "Practice advanced distributed caches systems"]
      };
    }

    try {
      const cleanTranscript = chatTranscript
        .filter(msg => !msg.isEvaluation)
        .map(msg => `${msg.sender === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.text}`)
        .join('\n\n');

      const prompt = `
        You are a hiring committee manager. Review this completed technical interview transcript and provide a final evaluation report.
        
        Candidate Name: ${resumeData.candidate_name || 'Candidate'}
        Target Role: ${role}
        Difficulty: ${difficulty}
        
        Interview Transcript:
        ${cleanTranscript}
        
        Evaluate the candidate across five dimensions:
        - Technical Competence (score out of 100)
        - Communication Clarity (score out of 100)
        - Problem Solving Ability (score out of 100)
        - Confidence / Presentation (score out of 100)
        
        Also calculate an overall score (out of 100) as a weighted average.
        
        Your response must be in JSON format with the following keys:
        1. "overall": (integer) Overall score out of 100.
        2. "technical": (integer) Technical score out of 100.
        3. "communication": (integer) Communication score out of 100.
        4. "problemSolving": (integer) Problem solving score out of 100.
        5. "confidence": (integer) Confidence score out of 100.
        6. "overallText": (string) A detailed summary (3-4 sentences) evaluating the candidate's performance, alignment with the role, and general impression.
        7. "strengths": (array of strings) 3 major technical/behavioral strengths highlighted.
        8. "weaknesses": (array of strings) 2-3 specific constructive areas of improvement.
        9. "recommendations": (array of strings) 2 career mock next steps or learning suggestions.
        
        Example Output format:
        {
          "overall": 85,
          "technical": 88,
          "communication": 80,
          "problemSolving": 87,
          "confidence": 85,
          "overallText": "The candidate performed very well...",
          "strengths": ["...", "...", "..."],
          "weaknesses": ["...", "..."],
          "recommendations": ["...", "..."]
        }
      `;

      const messages = [
        { role: "system", content: "You are an AI hiring committee evaluator. You must review the interview transcript and output only structured JSON." },
        { role: "user", content: prompt }
      ];

      const responseText = await callGroqAPI(messages, true);
      return JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to generate final report via Groq. Using local fallback.", e);
      return {
        overall: 84,
        technical: 86,
        communication: 82,
        problemSolving: 85,
        confidence: 83,
        overallText: `Good performance overall. You answered technical queries with confidence, showing strong foundation in ${role}.`,
        strengths: ["Demonstrates strong library knowledge", "Excellent responsiveness and conversational speed", "Understands practical requirements"],
        weaknesses: ["Should elaborate on performance benchmarks", "Structure system designs more clearly"],
        recommendations: ["Learn pgvector index parameters", "Examine distributed systems protocols"]
      };
    }
  }
};
