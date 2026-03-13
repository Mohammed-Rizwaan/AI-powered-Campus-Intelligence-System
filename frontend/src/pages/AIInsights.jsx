import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Moon,
  Users,
  Activity,
  Heart,
  Coffee,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Shield,
  Clock,
  BedDouble,
  Library,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import Navbar from '../components/Navbar'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(10,10,15,0.9)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      cornerRadius: 8,
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.03)' },
      ticks: { color: '#64748b', font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.03)' },
      ticks: { color: '#64748b', font: { size: 11 } },
    },
  },
}

/* Synthetic student data */
const students = [
  {
    id: 1,
    name: 'Priya Sharma',
    roll: 'CSE21045',
    year: 2,
    dept: 'CSE',
    riskScore: 78,
    riskBand: 'critical',
    avatar: '👩‍💻',
    factors: {
      attendance: { score: 25, detail: 'Dropped to 58% from 85%' },
      gpa_decline: { score: 20, detail: 'GPA fell from 7.8 to 6.2' },
      mood: { score: 15, detail: 'Avg mood: 3.2/10 (last 7 days)' },
      backlogs: { score: 8, detail: '2 active backlogs' },
      sleep: { score: 5, detail: 'Avg sleep: 4.5h' },
      late_entries: { score: 5, detail: '7 late hostel entries this month' },
    },
    moodTrend: [7, 6.5, 5, 4.8, 4, 3.5, 3.2],
    attendanceTrend: [85, 82, 78, 72, 68, 62, 58],
    recommendations: [
      { type: 'Counselling Session', priority: 'Urgent', reason: 'Risk score crossed 75 threshold' },
      { type: 'Academic Tutoring', priority: 'High', reason: 'GPA declined by 1.6 points' },
      { type: 'Peer Mentoring', priority: 'Medium', reason: 'Social isolation indicators detected' },
    ],
  },
  {
    id: 2,
    name: 'Rahul Verma',
    roll: 'ECE21032',
    year: 2,
    dept: 'ECE',
    riskScore: 62,
    riskBand: 'high',
    avatar: '👨‍🎓',
    factors: {
      attendance: { score: 15, detail: 'Dropped to 68% from 80%' },
      gpa_decline: { score: 20, detail: 'GPA fell from 7.2 to 5.8' },
      mood: { score: 8, detail: 'Avg mood: 5.1/10' },
      backlogs: { score: 15, detail: '3 active backlogs' },
      sleep: { score: 0, detail: 'Normal sleep pattern' },
      late_entries: { score: 4, detail: '4 late entries' },
    },
    moodTrend: [6, 5.8, 5.5, 5.5, 5.2, 5, 5.1],
    attendanceTrend: [80, 78, 76, 74, 72, 70, 68],
    recommendations: [
      { type: 'Academic Tutoring', priority: 'Urgent', reason: '3 backlogs accumulated' },
      { type: 'Counselling Session', priority: 'High', reason: 'Consistent mood decline' },
    ],
  },
  {
    id: 3,
    name: 'Ananya Reddy',
    roll: 'CSE22078',
    year: 1,
    dept: 'CSE',
    riskScore: 41,
    riskBand: 'moderate',
    avatar: '👩‍🎓',
    factors: {
      attendance: { score: 10, detail: 'At 72%' },
      gpa_decline: { score: 10, detail: 'Slight decline from 8.0 to 7.4' },
      mood: { score: 8, detail: 'Avg mood: 5.8/10' },
      backlogs: { score: 8, detail: '1 backlog' },
      sleep: { score: 5, detail: 'Avg sleep: 4.8h' },
      late_entries: { score: 0, detail: 'No late entries' },
    },
    moodTrend: [7, 7, 6.5, 6.2, 6, 5.8, 5.8],
    attendanceTrend: [82, 80, 78, 76, 74, 73, 72],
    recommendations: [
      { type: 'Academic Assistance', priority: 'Medium', reason: 'Early backlog intervention' },
    ],
  },
]

const riskColors = {
  critical: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: 'text-accent-red', dot: 'bg-accent-red' },
  high: { bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', text: 'text-accent-amber', dot: 'bg-accent-amber' },
  moderate: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: 'text-accent-amber', dot: 'bg-amber-400' },
  low: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: 'text-accent-green', dot: 'bg-accent-green' },
}

const factorIcons = {
  attendance: BookOpen,
  gpa_decline: TrendingDown,
  mood: Heart,
  backlogs: AlertTriangle,
  sleep: Moon,
  late_entries: Clock,
}

const factorLabels = {
  attendance: 'Attendance Drop',
  gpa_decline: 'GPA Decline',
  mood: 'Mood Deterioration',
  backlogs: 'Active Backlogs',
  sleep: 'Sleep Deficit',
  late_entries: 'Late Hostel Entries',
}

/* ============================
   FACTOR BREAKDOWN BAR
   ============================ */
function FactorBreakdown({ factors }) {
  const sorted = Object.entries(factors).sort((a, b) => b[1].score - a[1].score)
  const maxScore = 25

  return (
    <div className="space-y-3">
      {sorted.map(([key, val], i) => {
        const Icon = factorIcons[key] || Activity
        const pct = (val.score / maxScore) * 100

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Icon size={14} className="text-text-muted" />
                <span className="text-sm font-medium">{factorLabels[key]}</span>
              </div>
              <span className="text-sm font-bold text-accent-blue">
                +{val.score}pts
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: i * 0.08 + 0.2, duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background:
                    val.score >= 20
                      ? 'linear-gradient(90deg, #ef4444, #f97316)'
                      : val.score >= 10
                      ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                      : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                }}
              />
            </div>
            <p className="text-xs text-text-muted mt-0.5">{val.detail}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ============================
   RISK SCORE GAUGE
   ============================ */
function RiskGauge({ score, band }) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const colors = {
    critical: '#ef4444',
    high: '#f97316',
    moderate: '#f59e0b',
    low: '#10b981',
  }

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={colors[band]}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          transform="rotate(-90 80 80)"
          style={{ filter: `drop-shadow(0 0 8px ${colors[band]}40)` }}
        />
        <text
          x="80"
          y="75"
          textAnchor="middle"
          className="text-3xl font-bold"
          fill="#f1f5f9"
        >
          {score}
        </text>
        <text
          x="80"
          y="95"
          textAnchor="middle"
          className="text-xs uppercase font-semibold"
          fill={colors[band]}
        >
          {band}
        </text>
      </svg>
    </div>
  )
}

/* ============================
   MAIN AI INSIGHTS PAGE
   ============================ */
export default function AIInsights() {
  const [selectedStudent, setSelectedStudent] = useState(students[0])

  const moodChartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [
      {
        label: 'Mood Score',
        data: selectedStudent.moodTrend,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const attendanceChartData = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
    datasets: [
      {
        label: 'Attendance %',
        data: selectedStudent.attendanceTrend,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const riskDistribution = {
    labels: ['Low', 'Moderate', 'High', 'Critical'],
    datasets: [
      {
        data: [18, 12, 8, 3],
        backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }

  const factorBarData = {
    labels: Object.keys(selectedStudent.factors).map((k) => factorLabels[k]),
    datasets: [
      {
        data: Object.values(selectedStudent.factors).map((f) => f.score),
        backgroundColor: [
          'rgba(239,68,68,0.7)',
          'rgba(249,115,22,0.7)',
          'rgba(139,92,246,0.7)',
          'rgba(245,158,11,0.7)',
          'rgba(59,130,246,0.7)',
          'rgba(6,182,212,0.7)',
        ],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />

      {/* Background */}
      <div className="bg-orb w-[500px] h-[500px] bg-accent-purple/10 top-[10%] right-[-100px] fixed" />
      <div className="bg-orb w-[400px] h-[400px] bg-accent-blue/10 bottom-[10%] left-[-100px] fixed" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-accent-purple" />
            <span className="text-sm font-semibold text-accent-purple uppercase tracking-widest">
              Explainable AI Engine
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            AI <span className="gradient-text">Insights</span>
          </h1>
          <p className="text-text-secondary mt-2 max-w-xl">
            Transparent risk predictions with full factor breakdowns. Every
            score is explainable — no black boxes.
          </p>
        </motion.div>

        {/* Top Grid: Risk Distribution + Student Selector */}
        <div className="grid lg:grid-cols-3 gap-5 mb-6">
          {/* Risk Distribution Donut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-sm font-semibold text-text-secondary mb-4">
              Campus Risk Distribution
            </h3>
            <div className="h-48 flex items-center justify-center">
              <Doughnut
                data={riskDistribution}
                options={{
                  ...chartOptions,
                  cutout: '70%',
                  scales: undefined,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'bottom',
                      labels: { color: '#94a3b8', padding: 12, usePointStyle: true, pointStyle: 'circle' },
                    },
                  },
                }}
              />
            </div>
            <div className="text-center mt-2">
              <span className="text-2xl font-bold">41</span>
              <span className="text-sm text-text-muted ml-1">total students</span>
            </div>
          </motion.div>

          {/* Student Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6 lg:col-span-2"
          >
            <h3 className="text-sm font-semibold text-text-secondary mb-4">
              Select Student for Deep Analysis
            </h3>
            <div className="space-y-3">
              {students.map((s) => {
                const rc = riskColors[s.riskBand]
                const isActive = selectedStudent.id === s.id
                return (
                  <motion.button
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left ${
                      isActive
                        ? 'ring-1 ring-accent-blue/40'
                        : ''
                    }`}
                    style={{
                      background: isActive
                        ? 'rgba(59,130,246,0.08)'
                        : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${
                        isActive ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)'
                      }`,
                    }}
                  >
                    <span className="text-2xl">{s.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{s.name}</div>
                      <div className="text-xs text-text-muted">
                        {s.roll} · {s.dept} · Year {s.year}
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-lg text-xs font-bold uppercase"
                      style={{ background: rc.bg, color: rc.text.replace('text-', ''), border: `1px solid ${rc.border}` }}
                    >
                      <span className={rc.text}>{s.riskScore}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`text-text-muted transition-transform ${
                        isActive ? 'rotate-90 text-accent-blue' : ''
                      }`}
                    />
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Main Analysis Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStudent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-3 gap-5"
          >
            {/* Risk Gauge + Summary */}
            <div className="glass-card p-6 flex flex-col items-center justify-center">
              <h3 className="text-sm font-semibold text-text-secondary mb-4">
                Risk Score
              </h3>
              <RiskGauge score={selectedStudent.riskScore} band={selectedStudent.riskBand} />
              <div className="mt-4 text-center">
                <p className="font-semibold text-lg">{selectedStudent.name}</p>
                <p className="text-xs text-text-muted mt-1">
                  {selectedStudent.roll} · {selectedStudent.dept} · Year {selectedStudent.year}
                </p>
              </div>
              <div
                className="mt-4 w-full p-3 rounded-xl text-center text-sm"
                style={{
                  background: riskColors[selectedStudent.riskBand].bg,
                  border: `1px solid ${riskColors[selectedStudent.riskBand].border}`,
                }}
              >
                <span className={riskColors[selectedStudent.riskBand].text + ' font-semibold'}>
                  {selectedStudent.riskBand === 'critical'
                    ? '🔴 Immediate intervention required'
                    : selectedStudent.riskBand === 'high'
                    ? '🟠 Alert counsellor recommended'
                    : selectedStudent.riskBand === 'moderate'
                    ? '🟡 Monitoring advised'
                    : '🟢 No action needed'}
                </span>
              </div>
            </div>

            {/* Factor Breakdown — THE STAR */}
            <div className="glass-card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary">
                    Explainable AI — Factor Breakdown
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Every factor contributing to the risk score
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-purple/10 border border-accent-purple/20">
                  <Brain size={14} className="text-accent-purple" />
                  <span className="text-xs font-semibold text-accent-purple">
                    AI Analysis
                  </span>
                </div>
              </div>
              <FactorBreakdown factors={selectedStudent.factors} />
            </div>

            {/* Mood Trend */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-secondary">
                  Mood Trend (7 days)
                </h3>
                <Heart size={16} className="text-accent-purple" />
              </div>
              <div className="h-44">
                <Line
                  data={moodChartData}
                  options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      y: { ...chartOptions.scales.y, min: 0, max: 10 },
                    },
                  }}
                />
              </div>
            </div>

            {/* Attendance Trend */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-secondary">
                  Attendance Trend (7 weeks)
                </h3>
                <BookOpen size={16} className="text-accent-blue" />
              </div>
              <div className="h-44">
                <Line
                  data={attendanceChartData}
                  options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      y: { ...chartOptions.scales.y, min: 40, max: 100 },
                    },
                  }}
                />
              </div>
            </div>

            {/* Factor Bar Chart */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-secondary">
                  Factor Contributions
                </h3>
                <BarChart3 size={16} className="text-accent-amber" />
              </div>
              <div className="h-44">
                <Bar
                  data={factorBarData}
                  options={{
                    ...chartOptions,
                    indexAxis: 'y',
                    scales: {
                      ...chartOptions.scales,
                      x: { ...chartOptions.scales.x, max: 25 },
                    },
                  }}
                />
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="glass-card p-6 lg:col-span-3">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary">
                    AI-Recommended Interventions
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Personalized actions based on risk factor analysis
                  </p>
                </div>
                <Shield size={16} className="text-accent-green" />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {selectedStudent.recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl transition-all hover:translate-y-[-2px]"
                    style={{
                      background:
                        rec.priority === 'Urgent'
                          ? 'rgba(239,68,68,0.06)'
                          : rec.priority === 'High'
                          ? 'rgba(249,115,22,0.06)'
                          : 'rgba(59,130,246,0.06)',
                      border: `1px solid ${
                        rec.priority === 'Urgent'
                          ? 'rgba(239,68,68,0.15)'
                          : rec.priority === 'High'
                          ? 'rgba(249,115,22,0.15)'
                          : 'rgba(59,130,246,0.15)'
                      }`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{rec.type}</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          rec.priority === 'Urgent'
                            ? 'bg-accent-red/20 text-accent-red'
                            : rec.priority === 'High'
                            ? 'bg-accent-amber/20 text-accent-amber'
                            : 'bg-accent-blue/20 text-accent-blue'
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">{rec.reason}</p>
                    <button className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-accent-blue hover:text-accent-cyan transition-colors">
                      Schedule Now
                      <ArrowUpRight size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}


