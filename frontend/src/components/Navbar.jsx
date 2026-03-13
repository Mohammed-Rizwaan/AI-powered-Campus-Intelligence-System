import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  LayoutDashboard,
  Menu,
  X,
  LogIn,
  Sparkles,
} from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/ai-insights', label: 'AI Insights', icon: Sparkles },
  { to: '/admin', label: 'Admin', icon: LayoutDashboard },
  { to: '/counsellor', label: 'Counsellor' },
  { to: '/student', label: 'Student' },
  { to: '/warden', label: 'Warden' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div
        className="mx-4 mt-4 rounded-2xl px-6 py-3"
        style={{
          background: 'rgba(10, 10, 15, 0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Brain size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Campus<span className="gradient-text">IQ</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Login Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="btn-secondary !py-2 !px-5 !text-sm !rounded-xl"
            >
              <LogIn size={16} />
              Login
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-text-secondary hover:text-white transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mx-4 mt-2 rounded-2xl p-4"
            style={{
              background: 'rgba(10, 10, 15, 0.9)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block mt-2 text-center btn-primary !text-sm !py-2.5"
            >
              Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
