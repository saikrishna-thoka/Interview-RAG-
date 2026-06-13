import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Cpu, FileText, CheckCircle2, ChevronDown, 
  ArrowRight, ShieldCheck, Zap, Award, Star, Moon, Sun, Menu, X
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function LandingPage() {
  const { theme, toggleTheme, setActiveView } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: <FileText className="w-6 h-6 text-indigo-500" />,
      title: "Deep Resume RAG",
      desc: "Our vector embeddings chunk and retrieve exact details from your resume to tailor specific technical and architectural questions."
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-500" />,
      title: "Llama 3 Powered AI",
      desc: "Practice with a conversational agent that acts as a lead interviewer, reacting in real-time to your custom explanations."
    },
    {
      icon: <Zap className="w-6 h-6 text-pink-500" />,
      title: "Real-time Scoring & Evaluation",
      desc: "Get instant micro-grades on each response and a comprehensive assessment dashboard once you finish."
    },
    {
      icon: <Award className="w-6 h-6 text-indigo-500" />,
      title: "Weakness Drill-down",
      desc: "Our analytics break down your technical, communication, and confidence scores, pointing out exactly what to improve."
    }
  ];

  const steps = [
    { num: "01", title: "Upload Resume", desc: "Drag and drop your PDF or DOCX resume. Our RAG pipeline instantly extracts skills, experience, and projects." },
    { num: "02", title: "Setup the Role", desc: "Choose your target position (e.g. AI Engineer, Python Developer), select difficulty level, and set question count." },
    { num: "03", title: "Interactive Chat", desc: "Take a realistic, conversational chat-based technical interview. Each answer determines the AI's follow-up." },
    { num: "04", title: "Unlock Analytics", desc: "Review your detailed radar chart, score breakdown, strengths report, and download your exportable PDF report." }
  ];

  const testimonials = [
    {
      quote: "InterviewRAG AI helped me prep for my Lead ML Engineer interview. The RAG system asked specific questions about PyTorch optimization details from my resume. I got the job!",
      author: "Sarah Jenkins",
      role: "ML Engineer at Stripe",
      rating: 5
    },
    {
      quote: "The ChatGPT-like chat interface is super engaging. Getting immediate feedback after each question helped me restructure my system design explanations.",
      author: "Marcus Chen",
      role: "Senior Full Stack Dev",
      rating: 5
    }
  ];

  const faqs = [
    {
      q: "How does the Resume RAG pipeline work?",
      a: "When you upload your resume, our system processes the text and indexes it. When generating questions, the LLM retrieves relevant keywords, libraries, and project highlights from your background to craft highly personalized technical questions."
    },
    {
      q: "Can I use it for custom job descriptions?",
      a: "Yes! In the setup page, you can choose 'Custom Role' and enter any job description or title. The AI interviewer will adapt its questioning scope accordingly."
    },
    {
      q: "Is there a limit to how many interviews I can practice?",
      a: "Our Free tier includes 1 resume upload and 10 questions. Upgrading to the Pro tier gives you unlimited interview practices, complete analytical dashboards, and PDF report downloads."
    },
    {
      q: "Which AI models are running behind the scenes?",
      a: "We integrate with Groq's high-speed API utilizing the latest llama-3.3-70b-versatile model. This achieves sub-second text generation speeds for a smooth, lag-free chat dialogue."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full radial-glow opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full radial-glow opacity-40 pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('landing')}>
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">InterviewRAG <span className="text-indigo-500">AI</span></span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="#features" className="hover:text-indigo-500 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-500 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-indigo-500 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-500 transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg hover:bg-muted transition-colors border border-border"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            <button 
              onClick={() => setActiveView('login')}
              className="px-4 h-10 text-sm font-semibold rounded-lg hover:bg-muted border border-border transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => setActiveView('signup')}
              className="px-5 h-10 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-colors"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center space-x-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted border border-border transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 rounded-lg hover:bg-muted border border-border transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden glass border-b border-border absolute w-full left-0 px-6 py-6 space-y-4 shadow-xl"
            >
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium hover:text-indigo-500 transition-colors">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium hover:text-indigo-500 transition-colors">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium hover:text-indigo-500 transition-colors">Pricing</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium hover:text-indigo-500 transition-colors">FAQ</a>
              
              <div className="pt-4 border-t border-border flex flex-col space-y-3">
                <button 
                  onClick={() => { setMobileMenuOpen(false); setActiveView('login'); }}
                  className="w-full h-11 text-center font-semibold text-sm border border-border rounded-xl hover:bg-muted transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); setActiveView('signup'); }}
                  className="w-full h-11 text-center font-semibold text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 px-4 py-1.5 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-8 hover:scale-105 transition-transform cursor-pointer"
          onClick={() => setActiveView('signup')}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Llama 3.3 RAG Agent is live</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight max-w-4xl"
        >
          Ace Every Interview with <span className="gradient-text">AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
        >
          Upload your resume, select a role, and practice personalized interviews powered by RAG and AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <button 
            onClick={() => setActiveView('signup')}
            className="w-full sm:w-auto px-8 h-12 text-base font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 h-12 text-base font-semibold rounded-xl border border-border hover:bg-muted transition-colors flex items-center justify-center"
          >
            Watch Demo
          </a>
        </motion.div>

        {/* Hero Visual Block */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 w-full max-w-5xl rounded-2xl glass p-4 border border-white/20 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 mix-blend-color-dodge pointer-events-none" />
          <div className="rounded-xl overflow-hidden border border-border bg-slate-900 aspect-[16/9] flex flex-col relative justify-center items-center text-white p-8">
            <div className="absolute top-4 left-4 flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            
            <Cpu className="w-16 h-16 text-indigo-500 mb-4 animate-bounce" />
            <h3 className="text-xl md:text-2xl font-bold font-mono">system_init_interview_agent</h3>
            <p className="text-sm text-slate-400 font-mono mt-2 text-center max-w-lg">
              {"{ status: 'parsing_resume', embeddings: 1536, active_model: 'llama-3.3-70b-versatile' }"}
            </p>
            <div className="mt-8 flex gap-3">
              <span className="px-3 py-1 text-xs rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PDF Parser</span>
              <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Vector Similarity</span>
              <span className="px-3 py-1 text-xs rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">Live LLM Critique</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-border relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Standardized AI Hiring Workspaces</h2>
          <p className="mt-4 text-muted-foreground text-lg">Harness vector document search and dynamic conversational APIs for hyper-specific practice.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -8 }}
              className="p-6 rounded-2xl glass-card flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-indigo-50 dark:bg-zinc-800 w-fit rounded-xl mb-6">
                  {feat.icon}
                </div>
                <h3 className="font-bold text-xl mb-3">{feat.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Stepper */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto border-t border-border">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Four Steps to Interview Readiness</h2>
          <p className="mt-4 text-muted-foreground text-lg">We streamline resume synthesis and question pipelines to get you mock ready in minutes.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              <div className="text-6xl md:text-8xl font-black text-indigo-500/10 mb-4 transition-colors group-hover:text-indigo-500/20 font-mono">
                {step.num}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-border bg-indigo-50/20 dark:bg-zinc-900/30 rounded-3xl mb-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Endorsed by Candidates Everywhere</h2>
          <p className="mt-4 text-muted-foreground text-lg">Hear how software engineers land tier-1 offers using our interactive RAG simulation.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 px-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className="glass-card p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="italic text-muted-foreground mb-6 font-medium text-base">"{test.quote}"</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  {test.author[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{test.author}</h4>
                  <p className="text-xs text-muted-foreground">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Page Grid */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto border-t border-border">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Flexible SaaS Pricing</h2>
          <p className="mt-4 text-muted-foreground text-lg">Start with free credits, unlock unlimited runs with Pro.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="p-8 rounded-2xl glass-card border-border flex flex-col justify-between relative">
            <div>
              <h3 className="font-bold text-xl mb-2">Free Starter</h3>
              <p className="text-sm text-muted-foreground mb-6">Test the platform out.</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold font-mono">$0</span>
                <span className="text-muted-foreground text-sm ml-2">/ month</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> <span>1 Resume upload</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> <span>10 AI questions</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> <span>Dashboard activity feed</span></li>
              </ul>
            </div>
            <button 
              onClick={() => setActiveView('signup')}
              className="w-full h-11 text-sm font-semibold rounded-xl border border-border hover:bg-muted transition-colors"
            >
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="p-8 rounded-2xl glass bg-gradient-to-b from-indigo-950/20 to-purple-950/20 border-2 border-indigo-500/80 flex flex-col justify-between relative">
            <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full">
              Recommended
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2 text-indigo-400">Pro Developer</h3>
              <p className="text-sm text-muted-foreground mb-6">Complete interview readiness.</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold font-mono text-white">$19</span>
                <span className="text-muted-foreground text-sm ml-2">/ month</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-slate-200">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> <span>Unlimited Resume uploads</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> <span>Unlimited AI interviews</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> <span>Full skill analytical scores</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> <span>Exportable PDF reports</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> <span>Custom Role specifications</span></li>
              </ul>
            </div>
            <button 
              onClick={() => setActiveView('signup')}
              className="w-full h-11 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="p-8 rounded-2xl glass-card border-border flex flex-col justify-between relative">
            <div>
              <h3 className="font-bold text-xl mb-2">Enterprise Team</h3>
              <p className="text-sm text-muted-foreground mb-6">For coding bootcamps and HR teams.</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold font-mono">$99</span>
                <span className="text-muted-foreground text-sm ml-2">/ month</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> <span>Bulk resume parsing</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> <span>Team management dashboard</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> <span>Custom LLM prompt overrides</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> <span>Priority API bandwidth</span></li>
              </ul>
            </div>
            <button 
              onClick={() => setActiveView('signup')}
              className="w-full h-11 text-sm font-semibold rounded-xl border border-border hover:bg-muted transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto border-t border-border">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          <p className="mt-4 text-muted-foreground text-lg">Clear answers to your platform inquiries.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="border border-border rounded-xl overflow-hidden glass bg-background/50"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-base hover:bg-muted/50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-indigo-500 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground border-t border-border/40 pt-4 bg-muted/20">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action section */}
      <section className="py-20 px-6 text-center max-w-5xl mx-auto border-t border-border">
        <div className="glass bg-gradient-to-tr from-indigo-900/10 via-background to-purple-900/10 border border-border rounded-3xl p-12 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Start Practicing For Free</h2>
          <p className="text-muted-foreground text-md max-w-xl mb-8 leading-relaxed">
            Upload your resume now and build confidence with high-fidelity, RAG-tailored mock questions.
          </p>
          <button 
            onClick={() => setActiveView('signup')}
            className="px-8 h-12 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/25 transition-all flex items-center space-x-2"
          >
            <span>Launch Free Interview Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-slate-50 dark:bg-zinc-950/40 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-tight">InterviewRAG</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Transforming your resume into high-impact, contextualized mock interviews using RAG vectors and Llama 3 models.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 text-indigo-500">Product</h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground">How it Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 text-indigo-500">Resources</h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
              <li><span className="hover:text-foreground cursor-pointer">Security Policies</span></li>
              <li><span className="hover:text-foreground cursor-pointer">API Keys Guide</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 text-indigo-500">Legal</h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li><span className="hover:text-foreground cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-foreground cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-foreground cursor-pointer">Contact Us</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-border flex flex-col md:flex-row justify-between items-center text-[10px] text-muted-foreground gap-4">
          <span>&copy; 2026 InterviewRAG AI. All rights reserved.</span>
          <div className="flex space-x-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Cookies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
