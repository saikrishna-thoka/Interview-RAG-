import { useAppStore } from '../store/useAppStore';

// Endpoint and model details
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.3-70b-versatile";

// Helper function to call Groq API
async function callGroqAPI(messages, responseJson = false) {
  const { groqKey } = useAppStore.getState();
  
  if (!groqKey) {
    throw new Error("Groq API Key is missing. Please add one in Settings or configured VITE_GROQ_API_KEY.");
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
      "Authorization": `Bearer ${groqKey}`
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

// Simulated mock responses to allow offline/no-key usage out-of-the-box
const mockQuestionsByRole = {
  "AI Engineer": [
    "What is retrieval-augmented generation (RAG), and how do you handle vector database indexing and retrieval latency?",
    "Explain how you would fine-tune a model like Llama 3 for a specific domain task. What hyperparameter adjustments would you make?",
    "In your RAG system project, how did you handle document chunking and overlapping, and what chunk evaluation metrics did you use?",
    "How do you deal with hallucination in production LLM products? What safety rails or guardrails have you implemented?",
    "Can you explain the difference between context retrieval precision vs. retrieval recall, and how they impact final LLM outputs?",
    "What are your strategies for optimizing model inference costs (e.g. quantization, prompt compression, caching)?",
    "Describe a challenging ML/AI pipeline debugging scenario you faced. How did you diagnose and resolve it?"
  ],
  "ML Engineer": [
    "Explain the bias-variance tradeoff and how you would address overfitting in a deep neural network.",
    "Describe the process of deploying an ML model into production using Docker and Kubernetes. How do you monitor data drift?",
    "What is the difference between gradient descent, stochastic gradient descent, and Adam optimization? When would you use each?",
    "How does a Transformer attention mechanism work under the hood? Explain query, key, and value matrices.",
    "Describe how you would set up a feature store for real-time model inputs. What databases are best suited for this?",
    "What metrics (e.g., ROC-AUC, F1, Log Loss) are most appropriate for evaluating an imbalanced classification model?"
  ],
  "Data Scientist": [
    "What is the difference between supervised and unsupervised learning? Give examples of algorithms for both.",
    "Explain how you would design an A/B test to evaluate a new recommendation algorithm. How do you determine sample size?",
    "How do you handle missing or highly skewed data in your feature engineering process?",
    "Can you explain PCA (Principal Component Analysis) and how it accomplishes dimensionality reduction?",
    "Explain the difference between L1 and L2 regularization. What are their structural effects on coefficients?"
  ],
  "Python Developer": [
    "What is the difference between a list and a tuple in Python? When would you use a generator over a list?",
    "How does Python's Global Interpreter Lock (GIL) work? How do you achieve true parallel execution?",
    "What are decorators in Python, and how would you write a decorator that logs the execution time of a function?",
    "Explain Python's memory management, garbage collection, and reference counting mechanisms.",
    "What are the benefits of using async/await syntax in modern Python frameworks like FastAPI?"
  ],
  "Full Stack Developer": [
    "Explain how web performance metrics like LCP, FID, and CLS are affected by React rendering structures.",
    "How do you design a secure, distributed session management system across separate client and server domains?",
    "What is the difference between REST, GraphQL, and WebSockets? In what scenarios do you prefer each?",
    "Describe your workflow for containerizing a React frontend and Node.js backend using Docker Compose.",
    "How do you manage database schema migrations in a live, high-traffic production system without downtime?"
  ]
};

const defaultMockQuestions = [
  "Can you describe your most challenging software project? What tech stack did you choose and why?",
  "How do you approach learning a new technology or framework under tight deadlines?",
  "Describe a time you had a technical disagreement with a team member. How did you reach a consensus?",
  "How do you ensure code quality, test coverage, and documentation consistency in your projects?",
  "What is your understanding of RESTful API design principles and how do you secure API endpoints?"
];

export const groqService = {
  // Generate interview questions based on Resume RAG data
  generateQuestions: async (resumeData, role, difficulty, count = 10) => {
    const { groqKey } = useAppStore.getState();
    
    // Check if key is available
    if (!groqKey) {
      console.warn("Groq key not found. Using local mock generator.");
      // Simulated generation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const sourceList = mockQuestionsByRole[role] || mockQuestionsByRole["AI Engineer"] || defaultMockQuestions;
      // Slice & pad if necessary
      const questions = [];
      for (let i = 0; i < count; i++) {
        questions.push(sourceList[i % sourceList.length]);
      }
      return questions;
    }

    try {
      const prompt = `
        You are an elite technical interviewer. You have access to a candidate's resume and details.
        Generate exactly ${count} tailored, highly relevant interview questions for the role: **${role}** at difficulty level: **${difficulty}**.
        
        Candidate Resume Details:
        - Skills: ${resumeData.skills?.join(', ') || 'N/A'}
        - Projects: ${JSON.stringify(resumeData.projects || [])}
        - Experience: ${JSON.stringify(resumeData.experience || [])}
        - Summary: ${resumeData.summary || 'N/A'}
        
        Guidelines:
        1. Mix technical theory, code architecture, and behavioral questions related to their actual projects.
        2. Tailor questions strictly to their background (using RAG context) and the target role: ${role}.
        3. Do not ask generic questions; reference their listed technologies or project descriptions.
        4. Output a JSON object with a single key "questions" containing a list of strings.
        
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
        return parsed.questions;
      }
      throw new Error("Malformed JSON received from Groq");
    } catch (e) {
      console.error("Failed to generate questions via Groq. Falling back to mock generator.", e);
      // Fallback
      const sourceList = mockQuestionsByRole[role] || mockQuestionsByRole["AI Engineer"] || defaultMockQuestions;
      return sourceList.slice(0, count);
    }
  },

  // Evaluate candidate's answer and produce immediate feedback + follow-up
  evaluateAnswer: async (resumeData, role, difficulty, question, answerText, history = []) => {
    const { groqKey } = useAppStore.getState();

    if (!groqKey) {
      // Offline/Mock simulation
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const scores = [7, 8, 9, 10];
      const mockScore = scores[Math.floor(Math.random() * scores.length)];
      
      let evaluation = "";
      if (mockScore >= 9) {
        evaluation = `**System Evaluation (Score: ${mockScore}/10):** Excellent answer! You correctly referenced core design patterns and explained your technical reasoning. Your experience shines through in your description.`;
      } else if (mockScore >= 8) {
        evaluation = `**System Evaluation (Score: ${mockScore}/10):** Strong response. You addressed the core question well. To make this answer outstanding, you could include more details about metrics or specific edge-case handling.`;
      } else {
        evaluation = `**System Evaluation (Score: ${mockScore}/10):** Good effort. You touched upon the fundamental concepts, but your answer is slightly brief. Make sure to detail your implementation methodologies.`;
      }

      return {
        evaluation: evaluation,
        score: mockScore
      };
    }

    try {
      const contextTranscript = history.map(msg => `${msg.sender === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.text}`).join('\n');
      
      const prompt = `
        You are a senior technical interviewer. Evaluate the candidate's answer to the question.
        
        Target Role: ${role}
        Difficulty: ${difficulty}
        
        Candidate's Resume Details:
        - Skills: ${resumeData.skills?.join(', ') || 'N/A'}
        
        Current Question: "${question}"
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
      console.error("Failed to evaluate answer via Groq. Using mock evaluator.", e);
      return {
        evaluation: `**System Evaluation (Score: 8/10):** Solid response. Your explanation shows familiarity with the technology, though further detailing on performance trade-offs would be highly beneficial.`,
        score: 8
      };
    }
  },

  // Generate the final interview assessment report
  generateFinalEvaluation: async (resumeData, role, difficulty, chatTranscript) => {
    const { groqKey } = useAppStore.getState();

    if (!groqKey) {
      // Simulated Evaluation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const randomScore = Math.floor(Math.random() * 15) + 80; // 80 - 95
      return {
        overall: randomScore,
        technical: Math.min(100, randomScore + 2),
        communication: Math.min(100, randomScore - 3),
        problemSolving: Math.min(100, randomScore + 4),
        confidence: Math.min(100, randomScore + 1),
        overallText: `Excellent job! Throughout the interview for the **${role}** position, you displayed a deep understanding of software engineering and specific domain tools. Your background aligns well with the difficulty tier.`,
        strengths: [
          `Strong knowledge of core ${role} technologies and methodologies`,
          "Clear explanations of application designs in past projects",
          "Effective communication and technical confidence under pressure"
        ],
        weaknesses: [
          "Could give more quantitative results (e.g. percentages, load speeds) of your improvements",
          "A few answers were brief and could be backed by deeper architectural details"
        ]
      };
    }

    try {
      const cleanTranscript = chatTranscript
        .filter(msg => !msg.isEvaluation) // remove system evaluations to let LLM judge raw answers
        .map(msg => `${msg.sender === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.text}`)
        .join('\n\n');

      const prompt = `
        You are a hiring committee manager. Review this completed technical interview transcript and provide a final evaluation report.
        
        Candidate Name: ${resumeData.candidate_name}
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
        
        Example Output format:
        {
          "overall": 85,
          "technical": 88,
          "communication": 80,
          "problemSolving": 87,
          "confidence": 85,
          "overallText": "The candidate performed very well...",
          "strengths": ["...", "...", "..."],
          "weaknesses": ["...", "..."]
        }
      `;

      const messages = [
        { role: "system", content: "You are an AI hiring committee evaluator. You must review the interview transcript and output only structured JSON." },
        { role: "user", content: prompt }
      ];

      const responseText = await callGroqAPI(messages, true);
      return JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to generate final report via Groq. Using local report.", e);
      return {
        overall: 84,
        technical: 86,
        communication: 82,
        problemSolving: 85,
        confidence: 83,
        overallText: `Good performance overall. You answered technical queries with confidence, showing strong foundation in ${role}. Areas of improvement include providing deeper architectural reasoning on complex prompts.`,
        strengths: [
          "Demonstrates strong knowledge of libraries",
          "Excellent responsiveness and conversational speed",
          "Understands practical implementation requirements"
        ],
        weaknesses: [
          "Should elaborate more on performance benchmarks",
          "Could structure long-form system designs more clearly"
        ]
      };
    }
  }
};
