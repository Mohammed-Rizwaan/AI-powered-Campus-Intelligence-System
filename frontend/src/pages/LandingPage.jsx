import { motion } from 'framer-motion'
import {
  Brain,
  Shield,
  Activity,
  Building2,
  Zap,
  Users,
  BarChart3,
  ArrowRight,
  Sparkles,
  Eye,
  HeartPulse,
  BedDouble,
  Lightbulb,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

/* ============================
   HERO SECTION
   ============================ */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-20">
      {/* Background orbs */}
      <div className="bg-orb w-[500px] h-[500px] bg-accent-blue/20 top-[-100px] left-[-100px] absolute" />
      <div className="bg-orb w-[400px] h-[400px] bg-accent-purple/20 bottom-[-50px] right-[-80px] absolute" />
      <div className="bg-orb w-[300px] h-[300px] bg-accent-cyan/10 top-[40%] left-[60%] absolute" />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <Sparkles size={14} className="text-accent-blue" />
          <span className="text-sm font-medium text-accent-blue">
            AI-Powered Campus Intelligence
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          Predict. Protect.
          <br />
          <span className="gradient-text">Optimize.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          CampusIQ fuses AI-driven student well-being intelligence with smart
          resource optimization — preventing dropout before it happens and
          making every campus resource count.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/admin" className="btn-primary text-base px-8 py-3.5">
            Explore Dashboard
            <ArrowRight size={18} />
          </Link>
          <Link to="/ai-insights" className="btn-secondary text-base px-8 py-3.5">
            <Brain size={18} />
            AI Insights
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto"
        >
          {[
            { value: '94%', label: 'Risk Detection Accuracy', icon: Eye },
            { value: '3.2x', label: 'Faster Intervention', icon: Zap },
            { value: '28%', label: 'Resource Savings', icon: BarChart3 },
            { value: '500+', label: 'Students Monitored', icon: Users },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="glass-card p-5 text-center"
            >
              <stat.icon size={20} className="text-accent-blue mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-xs text-text-muted mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ============================
   PROBLEM STATEMENT SECTION
   ============================ */
function ProblemSection() {
  const problems = [
    {
      icon: HeartPulse,
      title: 'Silent Struggles',
      desc: 'High dropout and suicide risk driven by academic stress, social isolation, and lack of early intervention.',
      color: 'text-accent-red',
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.15)',
    },
    {
      icon: Eye,
      title: 'Invisible Warning Signs',
      desc: 'Institutions have limited visibility into behavioral, academic, and social indicators that precede crises.',
      color: 'text-accent-amber',
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.15)',
    },
    {
      icon: Building2,
      title: 'Resource Waste',
      desc: 'Underutilized hostels, energy waste, and inefficient facility scheduling drain campus budgets.',
      color: 'text-accent-purple',
      bg: 'rgba(139, 92, 246, 0.08)',
      border: 'rgba(139, 92, 246, 0.15)',
    },
    {
      icon: Activity,
      title: 'Disconnected Systems',
      desc: 'Well-being monitoring and resource management operate independently, missing critical correlations.',
      color: 'text-accent-cyan',
      bg: 'rgba(6, 182, 212, 0.08)',
      border: 'rgba(6, 182, 212, 0.15)',
    },
  ]

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-accent-red uppercase tracking-widest">
            The Problem
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
            Campuses Are <span className="gradient-text">Flying Blind</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Critical student signals go unnoticed while resources are
            misallocated — a failure that costs lives and budgets.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px]"
              style={{
                background: p.bg,
                border: `1px solid ${p.border}`,
              }}
            >
              <p.icon size={28} className={p.color} />
              <h3 className="text-xl font-semibold mt-4 mb-2">{p.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================
   AI WORKFLOW SECTION
   ============================ */
function WorkflowSection() {
  const steps = [
    {
      step: '01',
      title: 'Data Ingestion',
      desc: 'Attendance, grades, mood check-ins, hostel logs, and behavioral signals flow into CampusIQ.',
      icon: Activity,
    },
    {
      step: '02',
      title: 'AI Risk Engine',
      desc: '10-factor weighted scoring model computes risk scores with full explainability for every student.',
      icon: Brain,
    },
    {
      step: '03',
      title: 'Smart Alerts',
      desc: 'Threshold-based alerts fire to counsellors with severity levels and actionable context.',
      icon: Zap,
    },
    {
      step: '04',
      title: 'Intervention & Optimization',
      desc: 'Personalized recommendations + hostel rebalancing + energy insights delivered to decision-makers.',
      icon: Lightbulb,
    },
  ]

  return (
    <section className="relative py-24 px-6">
      <div className="bg-orb w-[400px] h-[400px] bg-accent-cyan/10 top-[20%] right-[-100px] absolute" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-accent-cyan uppercase tracking-widest">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
            The AI <span className="gradient-text-cyan">Workflow</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            From raw campus data to actionable intelligence — in four steps.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="glass-card p-6 relative group"
            >
              {/* Step number */}
              <div className="text-5xl font-black text-white/5 absolute top-4 right-4">
                {s.step}
              </div>

              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <s.icon size={22} className="text-accent-cyan" />
              </div>

              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {s.desc}
              </p>

              {/* Connector arrow on desktop */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                  <ChevronRight size={20} className="text-text-muted/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================
   KEY FEATURES SECTION
   ============================ */
function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: 'Predictive Risk Scoring',
      desc: '10-factor AI engine detects dropout/distress signals with explainable factor breakdowns.',
      gradient: 'from-accent-blue to-accent-purple',
    },
    {
      icon: Shield,
      title: 'Early Intervention Alerts',
      desc: 'Auto-triggered alerts to counsellors with severity levels, trends, and recommended actions.',
      gradient: 'from-accent-green to-accent-cyan',
    },
    {
      icon: BedDouble,
      title: 'Smart Hostel Allocation',
      desc: 'AI-optimized room allocation and occupancy rebalancing across hostel blocks.',
      gradient: 'from-accent-purple to-accent-pink',
    },
    {
      icon: Zap,
      title: 'Energy & Resource Intelligence',
      desc: 'Detect energy waste, underutilized facilities, and optimize campus infrastructure.',
      gradient: 'from-accent-amber to-accent-red',
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      desc: 'Tailored dashboards for students, counsellors, admins, and hostel managers.',
      gradient: 'from-accent-cyan to-accent-blue',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      desc: 'Live visualizations of student well-being trends and campus resource utilization.',
      gradient: 'from-accent-pink to-accent-purple',
    },
  ]

  return (
    <section className="relative py-24 px-6 bg-bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-accent-purple uppercase tracking-widest">
            Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
            Intelligent <span className="gradient-text">Features</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Every feature maps directly to the problem statement's key findings
            and major objectives.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="glass-card p-6 group cursor-default"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}
              >
                <f.icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================
   CTA SECTION
   ============================ */
function CTASection() {
  return (
    <section className="relative py-28 px-6">
      <div className="bg-orb w-[600px] h-[600px] bg-accent-blue/10 top-[-100px] left-[30%] absolute" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-4xl mx-auto text-center glass-card p-12 md:p-16 glow-blue"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Build a{' '}
          <span className="gradient-text">Smarter Campus?</span>
        </h2>
        <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">
          CampusIQ unifies student safety and resource efficiency into one
          AI-powered platform. See it in action.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/admin" className="btn-primary text-base px-8 py-3.5">
            View Admin Dashboard
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
            <LogIn size={18} />
            Login as Any Role
          </Link>
        </div>

        {/* Feature checklist */}
        <div className="flex flex-wrap justify-center gap-4 mt-10 text-sm text-text-secondary">
          {[
            'Predictive AI Engine',
            'Real-time Alerts',
            'Resource Optimization',
            'Privacy First',
          ].map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-accent-green" />
              {item}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

/* ============================
   FOOTER
   ============================ */
function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-accent-blue" />
          <span className="text-sm font-semibold">
            Campus<span className="gradient-text">IQ</span>
          </span>
        </div>
        <p className="text-xs text-text-muted">
          © 2026 CampusIQ — AI-Powered Campus Intelligence System. Hackathon
          Prototype.
        </p>
      </div>
    </footer>
  )
}

/* ============================
   LANDING PAGE COMPOSITION
   ============================ */
export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <WorkflowSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  )
}
