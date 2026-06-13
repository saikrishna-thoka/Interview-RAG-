// Service simulating resume uploads and parsing operations
export const resumeService = {
  uploadResume: async (file) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const filename = file.name.toLowerCase();
    
    // Attempt to parse name from file (e.g. "John_Doe_CV.pdf" -> "John Doe")
    let candidateName = "Alex Mercer";
    const nameMatch = file.name.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, "").match(/([A-Za-z]+)\s+([A-Za-z]+)/);
    if (nameMatch) {
      candidateName = nameMatch[0].replace(/\b\w/g, c => c.toUpperCase());
    }

    // Default templates based on keywords in file name
    if (filename.includes('web') || filename.includes('frontend') || filename.includes('react')) {
      return {
        resume_id: `res-${Math.floor(Math.random() * 10000)}`,
        candidate_name: candidateName,
        email: "alex.mercer@dev.io",
        phone: "+1 (555) 019-2834",
        education: [
          { degree: "B.S. Computer Science", institution: "UC Berkeley", year: "2022" }
        ],
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
        certifications: ["React Advanced Certification (Meta)", "AWS Cloud Practitioner"],
        match_score: 94,
        readiness_score: 88,
        summary: "Highly skilled React developer with a strong focus on animations, styling systems, and user-centric design paradigms."
      };
    }

    if (filename.includes('ml') || filename.includes('machine') || filename.includes('data') || filename.includes('ai') || filename.includes('rag')) {
      return {
        resume_id: `res-${Math.floor(Math.random() * 10000)}`,
        candidate_name: candidateName,
        email: "alex.mercer@ai-labs.com",
        phone: "+1 (555) 782-9901",
        education: [
          { degree: "M.S. Artificial Intelligence", institution: "Stanford University", year: "2024" },
          { degree: "B.S. Data Science", institution: "Stanford University", year: "2022" }
        ],
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
          { role: "AI Research Intern", company: "DeepMind Prototyping", duration: "2023 - 2024", description: "Assisted in fine-tuning visual-language models and optimizing inference times on custom TPU backends." }
        ],
        certifications: ["DeepLearning.AI TensorFlow Developer", "Google Professional ML Engineer"],
        match_score: 96,
        readiness_score: 92,
        summary: "Specialized AI Engineer with direct research and development experience in prompt optimization, RAG embedding flows, and local LLM inference setups."
      };
    }

    // Default template (Fullstack/Python Developer)
    return {
      resume_id: `res-${Math.floor(Math.random() * 10000)}`,
      candidate_name: candidateName,
      email: "alex.mercer@gmail.com",
      phone: "+1 (555) 345-6789",
      education: [
        { degree: "B.S. Software Engineering", institution: "Georgia Institute of Technology", year: "2023" }
      ],
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
      certifications: ["AWS Certified Developer - Associate", "Docker Certified Associate"],
      match_score: 88,
      readiness_score: 85,
      summary: "Versatile developer experienced in configuring scalable databases, containerized environments, and full-stack Javascript/Python codebases."
    };
  }
};
