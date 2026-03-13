import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api, fetchApi } from '../api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldAlert, AlertCircle, CheckCircle2, Search, Filter, ChevronRight, User } from 'lucide-react';
import StudentDetailDrawer from '../components/counsellor/StudentDetailDrawer';
import { useDemoMode } from '../context/DemoContext';

export default function CounsellorDashboard() {
  const { isDemoMode } = useDemoMode();
  const [alerts, setAlerts] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [alertRes, studentRes] = await Promise.all([
          fetchApi('/alerts?is_resolved=false'),
          fetchApi('/students')
        ]);
        setAlerts(alertRes.alerts);
        // Sort students by risk score descending
        setStudents(studentRes.students.sort((a, b) => b.current_risk_score - a.current_risk_score));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const acknowledgeAlert = async (id) => {
    try {
      await fetchApi(`/alerts/${id}/acknowledge`, { method: 'POST' });
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to acknowledge alert');
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="grid gap-8 xl:grid-cols-3 items-start">
        {/* Active Alerts Queue */}
        <div className="xl:col-span-1 space-y-8">
          <Card className="border-risk-critical/20 bg-risk-critical/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center text-risk-critical">
                <ShieldAlert className="mr-2 h-6 w-6" />
                Alert Queue
              </CardTitle>
              <CardDescription className="text-risk-critical/70">Immediate attention required</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {alerts.length === 0 ? (
                  <p className="text-sm text-text-secondary text-center py-8">All student alerts resolved.</p>
                ) : alerts.map((alert) => (
                  <motion.div 
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-5 rounded-2xl bg-bg-glass border border-risk-critical/20 space-y-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-text-primary text-sm">{alert.student_name}</div>
                      <span className="text-[10px] font-bold uppercase py-0.5 px-2 rounded bg-risk-critical text-white">
                        {alert.alert_type}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2 italic">"{alert.message}"</p>
                    <div className="flex space-x-2 pt-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="flex-1 text-[10px] h-9 hover:bg-risk-critical/10 text-risk-critical border border-risk-critical/20 rounded-xl"
                        onClick={() => setSelectedStudentId(alert.student_id)}
                      >
                         Analyze Risk
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="flex-1 text-[10px] h-9 hover:bg-accent-green/10 text-accent-green border border-accent-green/20 rounded-xl"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                         <CheckCircle2 className="h-3 w-3 mr-1" /> Ack
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Watchlist */}
        <div className="xl:col-span-2 space-y-8">
           <Card>
             <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                   <CardTitle className="text-xl">Student Watchlist</CardTitle>
                   <CardDescription>System-wide monitoring prioritized by risk</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                   <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                      <input 
                        placeholder="Search student..." 
                        className="h-10 w-full sm:w-64 rounded-xl border border-border-glass bg-bg-tertiary pl-9 pr-3 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue"
                      />
                   </div>
                </div>
             </CardHeader>
             <CardContent>
                <div className="rounded-2xl border border-border-glass overflow-hidden">
                   <div className="overflow-x-auto">
                   <table className="min-w-[760px] w-full text-left text-sm">
                      <thead className="bg-bg-glass text-text-secondary uppercase text-[10px] tracking-widest font-bold">
                         <tr>
                            <th className="px-7 py-5">Student</th>
                            <th className="px-7 py-5">Status</th>
                            <th className="px-7 py-5">Risk Score</th>
                            <th className="px-7 py-5 text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border-glass">
                         {students.map((student) => (
                            <tr 
                              key={student.id} 
                              className={`hover:bg-bg-glass transition-colors cursor-pointer ${
                                isDemoMode && student.name.includes('Priya') ? 'border-2 border-accent-blue relative z-10 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''
                              }`}
                              onClick={() => setSelectedStudentId(student.id)}
                            >
                               <td className="px-7 py-5">
                                  <div className="flex items-center space-x-3">
                                     <div className="h-8 w-8 rounded-full bg-accent-blue/10 flex items-center justify-center">
                                         <User className="h-4 w-4 text-accent-blue" />
                                     </div>
                                     <div>
                                        <div className="font-semibold text-text-primary">{student.name}</div>
                                        <div className="text-[10px] text-text-muted">{student.roll_number}</div>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-7 py-5">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                      student.risk_band === 'critical' ? 'bg-risk-critical/20 text-risk-critical' :
                                      student.risk_band === 'high' ? 'bg-risk-high/20 text-risk-high' :
                                      'bg-accent-green/20 text-accent-green'
                                  }`}>
                                     {student.risk_band}
                                  </span>
                               </td>
                               <td className="px-7 py-5">
                                  <div className="flex items-center space-x-2">
                                     <div className="flex-1 h-2 w-20 bg-bg-glass rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-accent-blue" 
                                            style={{ width: `${student.current_risk_score}%` }} 
                                        />
                                     </div>
                                     <span className="font-mono text-xs">{student.current_risk_score}</span>
                                  </div>
                               </td>
                               <td className="px-7 py-5 text-right">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-10 w-10 p-0 rounded-xl"
                                    onClick={(e) => { e.stopPropagation(); setSelectedStudentId(student.id); }}
                                  >
                                     <ChevronRight className="h-4 w-4" />
                                  </Button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                   </div>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>

      {/* Detail Drawer */}
      <StudentDetailDrawer 
        studentId={selectedStudentId} 
        onClose={() => setSelectedStudentId(null)} 
      />
    </div>
  );
}
