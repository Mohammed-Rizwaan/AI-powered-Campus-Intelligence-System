import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Moon,
  Brain,
  BookOpen,
  Calendar,
  Smile,
  Frown,
  Meh,
  Send,
  TrendingUp,
  Clock,
  BedDouble,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import Navbar from '../components/Navbar'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(10,10,15,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, cornerRadius: 8, padding: 12, titleColor: '#f1f5f9', bodyColor: '#94a3b8' } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 11 } } },
  },
}

export default function StudentPortal() {
  const [moodVal, setMoodVal] = useState(7)
  const [stressVal, setStressVal] = useState(2)
  const [sleepVal, setSleepVal] = useState(7)
  const [submitted, setSubmitted] = useState(false)

  const wellnessScore = 100 - 41 // inverted risk
  const wellnessLabel = wellnessScore >= 75 ? 'Great' : wellnessScore >= 50 ? 'Good' : wellnessScore >= 25 ? 'Needs Attention' : 'Support Available'

  const moodHistory = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [7, 6.5, 7, 5.8, 6, 5.5, moodVal],
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139,92,246,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#8b5cf6',
      pointRadius: 4,
    }],
  }

  const attendanceData = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
    datasets: [{
      data: [82, 80, 78, 76, 74, 73, 72],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointRadius: 4,
    }],
  }

  const upcomingSessions = [
    { type: 'Academic Assistance', date: 'Mar 14, 11:00 AM', with: 'Prof. Rajan', status: 'scheduled' },
    { type: 'Peer Mentoring', date: 'Mar 16, 3:00 PM', with: 'Arjun K. (Senior)', status: 'scheduled' },
  ]

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const getMoodEmoji = (v) => v >= 7 ? <Smile className="text-accent-green" size={20} /> : v >= 4 ? <Meh className="text-accent-amber" size={20} /> : <Frown className="text-accent-red" size={20} />

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="bg-orb w-[400px] h-[400px] bg-accent-cyan/8 top-[20%] right-[-80px] fixed" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👩‍🎓</span>
            <div>
              <h1 className="text-3xl font-bold">Welcome, <span className="gradient-text">Ananya</span></h1>
              <p className="text-text-secondary text-sm">CSE22078 · Year 1 · CSE Department</p>
            </div>
          </div>
        </motion.div>

        {/* Wellness Meter + Quick Stats */}
        <div className="grid md:grid-cols-3 gap-5 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 flex flex-col items-center text-center">
            <h3 className="text-sm font-semibold text-text-secondary mb-4">Your Wellness</h3>
            <div className="relative w-28 h-28">
              <svg width="112" height="112" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <motion.circle cx="56" cy="56" r="48" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 48}
                  initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - wellnessScore / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  transform="rotate(-90 56 56)"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.3))' }}
                />
                <text x="56" y="52" textAnchor="middle" fill="#f1f5f9" className="text-xl font-bold">{wellnessScore}%</text>
                <text x="56" y="68" textAnchor="middle" fill="#10b981" className="text-[10px] font-semibold">{wellnessLabel}</text>
              </svg>
            </div>
            <p className="text-xs text-text-muted mt-3">You're doing well! Keep it up 💪</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-secondary">Mood This Week</h3>
              <Heart size={16} className="text-accent-purple" />
            </div>
            <div className="h-36">
              <Line data={moodHistory} options={{ ...chartOpts, scales: { ...chartOpts.scales, y: { ...chartOpts.scales.y, min: 0, max: 10 } } }} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-secondary">Attendance Trend</h3>
              <BookOpen size={16} className="text-accent-blue" />
            </div>
            <div className="h-36">
              <Line data={attendanceData} options={{ ...chartOpts, scales: { ...chartOpts.scales, y: { ...chartOpts.scales.y, min: 50, max: 100 } } }} />
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Mood Check-in */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={16} className="text-accent-purple" />
              <h3 className="font-semibold">Daily Mood Check-in</h3>
            </div>

            <div className="space-y-5">
              {/* Mood */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-text-secondary">How are you feeling?</label>
                  <div className="flex items-center gap-2">
                    {getMoodEmoji(moodVal)}
                    <span className="text-sm font-bold">{moodVal}/10</span>
                  </div>
                </div>
                <input type="range" min="1" max="10" value={moodVal} onChange={e => setMoodVal(+e.target.value)}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)` }} />
              </div>

              {/* Stress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-text-secondary">Stress Level</label>
                  <span className="text-sm font-bold">{stressVal}/5</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => setStressVal(v)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${stressVal === v ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30' : 'bg-white/[0.03] text-text-muted border border-white/5 hover:bg-white/[0.06]'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-text-secondary flex items-center gap-1.5"><Moon size={14} /> Sleep Hours</label>
                  <span className="text-sm font-bold">{sleepVal}h</span>
                </div>
                <input type="range" min="2" max="12" step="0.5" value={sleepVal} onChange={e => setSleepVal(+e.target.value)}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #ef4444 0%, #3b82f6 50%, #10b981 100%)` }} />
              </div>

              <button onClick={handleSubmit}
                className={`w-full btn-primary justify-center ${submitted ? '!bg-accent-green' : ''}`}
                disabled={submitted}>
                {submitted ? <><CheckCircle2 size={16} /> Submitted! Your counsellor has been notified.</> : <><Send size={16} /> Submit Check-in</>}
              </button>
            </div>
          </motion.div>

          {/* Upcoming Sessions + Hostel Info */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Upcoming Support</h3>
                <Calendar size={16} className="text-accent-cyan" />
              </div>
              <div className="space-y-3">
                {upcomingSessions.map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{s.type}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-accent-cyan/10 text-accent-cyan">{s.status}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Clock size={10} /> {s.date}</span>
                      <span>with {s.with}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">My Hostel</h3>
                <BedDouble size={16} className="text-accent-purple" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Block', value: 'Block B' },
                  { label: 'Room', value: 'B-204' },
                  { label: 'Floor', value: '2nd' },
                  { label: 'Occupancy', value: '3/4' },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                    <div className="text-xs text-text-muted">{item.label}</div>
                    <div className="text-sm font-semibold mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
