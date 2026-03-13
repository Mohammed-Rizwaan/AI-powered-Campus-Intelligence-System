import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, BookOpen, Brain, Activity, ClipboardList, CheckCircle2, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { api, fetchApi } from '../../api';
import { TrendLine, RiskDoughnut, ResourceBar } from '../dashboard/Charts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const factorLabels = {
  attendance_drop: 'Attendance Drop',
  backlogs_exist: 'Active Backlogs',
  gpa_drop: 'GPA Trend',
  mood_instability: 'Mood Trend',
  sleep_deprivation: 'Sleep Issues',
  high_stress: 'Stress Level',
  late_entries: 'Hostel Late Entries',
  disengagement: 'Club/Library Activity',
  meals_skipped: 'Mess Activity'
};

const factorColors = {
    academic: '#3b82f6',
    wellbeing: '#ec4899',
    behavioral: '#f59e0b'
};

export default function StudentDetailDrawer({ studentId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (studentId) {
      setLoading(true);
      fetchApi(`/students/${studentId}`)
        .then(res => setDetails(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [studentId]);

  const handleSchedule = async () => {
    try {
      setScheduling(true);
      await api.createIntervention({
        student_id: studentId,
        status: 'pending',
        notes: notes || 'Scheduled counselling session following high risk alert.'
      });
      alert('Intervention scheduled successfully!');
      setNotes('');
    } catch (err) {
      alert('Failed to schedule intervention');
    } finally {
      setScheduling(false);
    }
  };

  if (!studentId) return null;
  const moods = details?.moods || [];
  const academics = details?.academics || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-bg-primary/40 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full w-full max-w-2xl bg-bg-secondary border-l border-border-glass shadow-2xl overflow-y-auto"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-t-transparent" />
            </div>
          ) : details && (
            <div className="p-8 space-y-8">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">{details.student.name}</h2>
                  <p className="text-text-secondary mt-1">{details.student.roll_number} • {details.student.department} Year {details.student.year}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 w-8 p-0">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Risk Banner */}
              <div className={`p-6 rounded-2xl border ${
                details.latest_risk.risk_level === 'critical' ? 'bg-risk-critical/10 border-risk-critical/20' :
                details.latest_risk.risk_level === 'high' ? 'bg-risk-high/10 border-risk-high/20' : 'bg-bg-glass border-border-glass'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Brain className={`h-6 w-6 ${
                      details.latest_risk.risk_level === 'critical' ? 'text-risk-critical' : 'text-accent-blue'
                    }`} />
                    <span className="text-xl font-bold uppercase tracking-wider">AI Risk Assessment</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black">{details.latest_risk.total_risk_score}/100</div>
                    <div className={`text-xs font-bold uppercase ${
                         details.latest_risk.risk_level === 'critical' ? 'text-risk-critical' : 'text-text-secondary'
                    }`}>{details.latest_risk.risk_level} Risk</div>
                  </div>
                </div>
                <p className="text-sm font-medium leading-relaxed italic border-l-2 border-accent-blue/30 pl-4 py-1">
                  "{details.latest_risk.explanation}"
                </p>
              </div>

              {/* Factor Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                   <Activity className="mr-2 h-5 w-5 text-accent-cyan" />
                   Contributing Factors (Explainable AI)
                </h3>
                <div className="p-4 rounded-xl bg-bg-glass border border-border-glass h-[200px]">
                   <Bar
                    data={{
                        labels: Object.keys(details.latest_risk.factors).map(k => factorLabels[k] || k),
                        datasets: [{
                            label: 'Impact Points',
                            data: Object.values(details.latest_risk.factors),
                            backgroundColor: '#3b82f6aa',
                            borderRadius: 6,
                        }]
                    }}
                    options={{
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { display: false },
                            y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } }
                        }
                    }}
                   />
                </div>
              </div>

              {/* Multi-Tab Metrics Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                 <Card className="bg-bg-glass/30 border-border-glass">
                    <CardHeader className="p-4">
                        <CardTitle className="text-sm font-bold flex items-center">
                            <Activity className="mr-2 h-4 w-4 text-accent-pink" />
                            Recent Mood Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[120px] p-2">
                         <TrendLine 
                            data={{
                                labels: moods.map(() => "").reverse(),
                                data: moods.map(m => m.mood_score).reverse()
                            }} 
                            label="Mood Score"
                            color="#ec4899"
                         />
                    </CardContent>
                 </Card>

                 <Card className="bg-bg-glass/30 border-border-glass">
                    <CardHeader className="p-4">
                        <CardTitle className="text-sm font-bold flex items-center">
                            <BookOpen className="mr-2 h-4 w-4 text-accent-blue" />
                            Academic Record
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[120px] p-2">
                         <TrendLine 
                            data={{
                                labels: academics.map(a => `Sem ${a.semester}`),
                                data: academics.map(a => a.gpa)
                            }} 
                            label="GPA"
                            color="#3b82f6"
                         />
                    </CardContent>
                 </Card>
              </div>

              {/* Action Panel */}
              <Card className="border-accent-blue/20 bg-accent-blue/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-accent-blue" />
                    Intervention Planner
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-text-secondary uppercase tracking-widest">Counsellor Action Notes</Label>
                    <Input 
                        placeholder="e.g. Discussing attendance drop and backlogs..." 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleSchedule} disabled={scheduling}>
                    {scheduling ? 'Scheduling...' : 'Set Mandatory Counselling Session'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
