import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Brain,
  LogIn,
  Users,
  Shield,
  GraduationCap,
  BedDouble,
  Eye,
  EyeOff,
} from 'lucide-react'

const roles = [
  { id: 'admin', label: 'Administrator', icon: Shield, desc: 'Campus-wide analytics & management', email: 'admin@campus.edu', path: '/admin', gradient: 'from-accent-blue to-accent-purple' },
  { id: 'counsellor', label: 'Counsellor', icon: Users, desc: 'Student well-being & interventions', email: 'dr.sharma@campus.edu', path: '/counsellor', gradient: 'from-accent-purple to-accent-pink' },
  { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Personal wellness & support', email: 'ananya@campus.edu', path: '/student', gradient: 'from-accent-cyan to-accent-blue' },
  { id: 'warden', label: 'Hostel Manager', icon: BedDouble, desc: 'Block management & resources', email: 'warden.c@campus.edu', path: '/warden', gradient: 'from-accent-green to-accent-cyan' },
]

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(roles[0])
  const [showPwd, setShowPwd] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    navigate(selectedRole.path)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* BG */}
      <div className="bg-orb w-[500px] h-[500px] bg-accent-blue/15 top-[-100px] left-[-100px] absolute" />
      <div className="bg-orb w-[400px] h-[400px] bg-accent-purple/15 bottom-[-50px] right-[-80px] absolute" />
      <div className="absolute inset-0 grid-bg" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mx-auto mb-4">
            <Brain size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold">
            Campus<span className="gradient-text">IQ</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">AI-Powered Campus Intelligence System</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 glow-blue">
          <h2 className="text-lg font-semibold mb-5">Login as</h2>

          {/* Role Picker */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {roles.map(role => (
              <motion.button
                key={role.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(role)}
                className={`p-3 rounded-xl text-left transition-all ${
                  selectedRole.id === role.id
                    ? 'ring-1 ring-accent-blue/40'
                    : ''
                }`}
                style={{
                  background: selectedRole.id === role.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedRole.id === role.id ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-2 opacity-80`}>
                  <role.icon size={16} className="text-white" />
                </div>
                <div className="text-sm font-semibold">{role.label}</div>
                <div className="text-[10px] text-text-muted mt-0.5">{role.desc}</div>
              </motion.button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-text-muted uppercase font-semibold mb-1.5 block">Email</label>
              <input
                type="email"
                value={selectedRole.email}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.03] border border-white/10 focus:border-accent-blue/40 focus:outline-none focus:ring-1 focus:ring-accent-blue/20 transition-all text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase font-semibold mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  defaultValue="demo1234"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.03] border border-white/10 focus:border-accent-blue/40 focus:outline-none focus:ring-1 focus:ring-accent-blue/20 transition-all text-text-primary pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full btn-primary justify-center py-3">
              <LogIn size={16} />
              Login as {selectedRole.label}
            </button>
          </form>

          <p className="text-[10px] text-text-muted text-center mt-4">
            Demo mode — all roles are pre-configured for the hackathon demo
          </p>
        </div>
      </motion.div>
    </div>
  )
}
