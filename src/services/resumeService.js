import { supabase } from './supabaseClient';
import { useAppStore } from '../store/useAppStore';

const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const resumeService = {
  uploadResume: async (file) => {
    const { user } = useAppStore.getState();
    if (!user) throw new Error("Authentication session required to upload resumes.");

    const filename = file.name.toLowerCase();
    
    // 1. Establish file upload to Supabase Storage
    let publicUrl = "http://localhost/mock_resume_file.pdf";
    
    if (isSupabaseConfigured) {
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${user.id}/${Math.floor(Math.random() * 1000000)}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('resumes')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadErr) {
        console.error("Storage upload failed:", uploadErr);
        throw new Error(`Supabase Storage Upload failed: ${uploadErr.message}`);
      }

      // Retrieve public URL
      const { data: { publicUrl: retrievedUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(uniqueFileName);
        
      publicUrl = retrievedUrl;
    } else {
      // Offline mock latency
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    // 2. Extract schema metadata (mocking parser extraction)
    let candidateName = "Alex Mercer";
    const nameMatch = file.name.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, "").match(/([A-Za-z]+)\s+([A-Za-z]+)/);
    if (nameMatch) {
      candidateName = nameMatch[0].replace(/\b\w/g, c => c.toUpperCase());
    }

    let parsedResume = {};

    if (filename.includes('web') || filename.includes('frontend') || filename.includes('react')) {
      parsedResume = {
        candidate_name: candidateName,
        skills: ["React", "JavaScript", "TypeScript", "Tailwind CSS", "Next.js", "Zustand", "HTML5/CSS3", "Framer Motion", "Jest", "Vite"],
        projects: [
          {
            title: "SaaS Task Analytics Dashboard",
            description: "A collaborative project planning application using React, Vite, and Tailwind CSS. Optimised render loops reducing TTFB by 42% and implemented smooth spring-based drag animations.",
            tech: ["React", "Tailwind CSS", "Zustand"]
          },
          {
            title: "Component Library Boilerplate",
            description: "Built a highly accessible, customizable UI design system wrapper using Radix UI primitives and custom CSS variables, packaged with Rollup and distributed on npm.",
            tech: ["TypeScript", "Radix UI", "Tailwind"]
          }
        ],
        experience: [
          { role: "Frontend Developer", company: "PixelCraft Solutions", duration: "2022 - Present", description: "Led frontend development for custom client portals, optimizing bundle sizes and page layouts for speed." }
        ],
        education: [
          { degree: "B.S. Computer Science", institution: "UC Berkeley", year: "2022" }
        ],
        certifications: ["React Advanced Certification (Meta)", "AWS Cloud Practitioner"],
        match_score: 94,
        readiness_score: 88,
        summary: "Highly skilled React developer with a strong focus on animations, styling systems, and user-centric design paradigms."
      };
    } else if (filename.includes('ml') || filename.includes('machine') || filename.includes('data') || filename.includes('ai') || filename.includes('rag')) {
      parsedResume = {
        candidate_name: candidateName,
        skills: ["Python", "PyTorch", "Transformers", "RAG (Retrieval-Augmented Generation)", "LangChain", "Vector DBs (Pinecone, Chroma)", "Groq API", "Scikit-Learn", "FastAPI", "Docker"],
        projects: [
          {
            title: "RAG Document Analytics Assistant",
            description: "Engineered a production RAG system processing PDF contracts, using Pinecone and LlamaIndex. Designed hybrid semantic-keyword retrievals that increased semantic recall by 30%.",
            tech: ["Python", "LangChain", "Pinecone", "LlamaIndex"]
          },
          {
            title: "Quantized Model Inference Service",
            description: "Created high-throughput API endpoints for running GGUF-quantized LLMs in resource-constrained environments. Implemented token-streaming with WebSockets.",
            tech: ["FastAPI", "PyTorch", "Docker", "HuggingFace"]
          }
        ],
        experience: [
          { role: "AI Research Intern", company: "DeepMind Prototyping", duration: "2023 - 2024", description: "Assisted in fine-tuning VLM models and optimizing GPU resource latency schedules." }
        ],
        education: [
          { degree: "M.S. Artificial Intelligence", institution: "Stanford University", year: "2024" },
          { degree: "B.S. Data Science", institution: "Stanford University", year: "2022" }
        ],
        certifications: ["DeepLearning.AI TensorFlow Developer", "Google Professional ML Engineer"],
        match_score: 96,
        readiness_score: 92,
        summary: "Specialized AI Engineer with direct research and development experience in prompt optimization, RAG embedding flows, and local LLM inference setups."
      };
    } else {
      parsedResume = {
        candidate_name: candidateName,
        skills: ["JavaScript", "Python", "Node.js", "Express", "PostgreSQL", "React", "Docker", "REST APIs", "Git", "GitHub Actions"],
        projects: [
          {
            title: "Microservices E-Commerce API",
            description: "Architected a scalable checkout system using Express, RabbitMQ, and Redis. Implemented secure JWT user sessions and Stripe checkout hooks.",
            tech: ["Node.js", "Express", "Redis", "PostgreSQL"]
          },
          {
            title: "Dockerized Deployment Stack",
            description: "Configured full CI/CD deployment pipelines deploying multi-container React/Node applications to AWS ECS, automating blue-green updates.",
            tech: ["Docker", "GitHub Actions", "AWS"]
          }
        ],
        experience: [
          { role: "Junior Full Stack Engineer", company: "Apex Tech Labs", duration: "2023 - Present", description: "Maintained legacy node microservices while spearheading React migration efforts for internal admin dashboards." }
        ],
        education: [
          { degree: "B.S. Software Engineering", institution: "Georgia Institute of Technology", year: "2023" }
        ],
        certifications: ["AWS Certified Developer - Associate", "Docker Certified Associate"],
        match_score: 88,
        readiness_score: 85,
        summary: "Versatile developer experienced in configuring scalable databases, containerized environments, and full-stack Javascript/Python codebases."
      };
    }

    // 3. Save Resume record to PostgreSQL via Supabase DB
    if (isSupabaseConfigured) {
      const { data: dbData, error: dbErr } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          candidate_name: parsedResume.candidate_name,
          skills: parsedResume.skills,
          projects: parsedResume.projects,
          experience: parsedResume.experience,
          education: parsedResume.education
        })
        .select()
        .single();

      if (dbErr) {
        console.error("Database insert failed:", dbErr);
        throw new Error(`Database record creation failed: ${dbErr.message}`);
      }

      // Return database fields augmented with calculated scores
      return {
        ...dbData,
        match_score: parsedResume.match_score,
        readiness_score: parsedResume.readiness_score,
        summary: parsedResume.summary,
        certifications: parsedResume.certifications
      };
    }

    // Fallback Mock representation
    const localId = `res-${Math.floor(Math.random() * 10000)}`;
    const mockDbResult = {
      id: localId,
      resume_id: localId,
      user_id: user.id,
      file_name: file.name,
      file_url: publicUrl,
      ...parsedResume
    };
    
    localStorage.setItem('mock_resume', JSON.stringify(mockDbResult));
    return mockDbResult;
  }
};
