import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Moon, Smile, Zap, MessageSquare, CheckCircle2, TrendingUp, Info, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { fetchApi } from '../api';
import { TrendLine } from '../components/dashboard/Charts';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ mood_score: 5, sleep_hours: 8, stress_level: 3, notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetchApi('/dashboard/student-home');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchApi('/mood-checkin', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadData();
      setForm({ mood_score: 5, sleep_hours: 8, stress_level: 3, notes: '' });
    } catch (err) {
      alert('Failed to submit check-in');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-t-transparent" />
    </div>
  );

  // Heuristic: Wellness Score = 100 - Risk Score
  const wellnessScore = Math.round(100 - (data?.personal_status?.current_score || 0));
  const band = data?.personal_status?.band;
  
  // Positive Framing logic
  const wellnessLevel = wellnessScore > 80 ? 'Excellent' : wellnessScore > 60 ? 'Good' : wellnessScore > 40 ? 'Fair' : 'Needs Care';
  const wellnessColor = wellnessScore > 80 ? 'text-accent-green' : wellnessScore > 60 ? 'text-accent-blue' : wellnessScore > 40 ? 'text-accent-amber' : 'text-risk-critical';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tight">Hi, {data?.personal_status?.name}!</h1>
          <p className="text-text-secondary mt-1">Ready for today's reflection?</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center">
          <Smile className="h-6 w-6 text-accent-blue" />
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Wellness Meter */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
        >
          <Card className="h-full border-accent-blue/20 bg-accent-blue/5 overflow-hidden relative">
            <div className="absolute -top-12 -right-12 h-32 w-32 bg-accent-blue/10 rounded-full blur-3xl" />
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Heart className="mr-2 h-5 w-5 text-accent-blue" />
                Wellness Meter
              </CardTitle>
              <CardDescription>Your integrated campus harmony score</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="relative h-40 w-40 flex items-center justify-center">
                <svg className="h-full w-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className="stroke-bg-glass fill-none"
                    strokeWidth="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className={`fill-none transition-all duration-1000 ease-out`}
                    style={{
                        strokeDasharray: '440',
                        strokeDashoffset: (440 - (wellnessScore / 100) * 440).toString(),
                        stroke: wellnessScore > 60 ? '#10b981' : '#f59e0b',
                        strokeLinecap: 'round'
                    }}
                    strokeWidth="12"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black">{wellnessScore}</span>
                  <span className={`text-sm font-bold uppercase tracking-widest ${wellnessColor}`}>{wellnessLevel}</span>
                </div>
              </div>
              <p className="mt-8 text-center text-sm font-medium italic text-text-primary px-4 border-l-2 border-accent-blue/30">
                 "{data?.personal_status?.recommended_action}"
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mood Check-in Form */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2 }}
        >
          <Card className="h-full shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Activity className="mr-2 h-5 w-5 text-accent-cyan" />
                Daily Reflection
              </CardTitle>
              <CardDescription>How are you feeling today?</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Overall Mood (1-10)</Label>
                  <div className="flex justify-between items-center text-2xl px-2">
                    {[1, 10].includes(form.mood_score) ? (form.mood_score === 1 ? '😢' : '🤩') : '😊'}
                    <input 
                      type="range" min="1" max="10" 
                      className="w-full mx-4 h-2 bg-bg-glass rounded-lg appearance-none cursor-pointer accent-accent-blue" 
                      value={form.mood_score}
                      onChange={(e) => setForm({...form, mood_score: parseInt(e.target.value)})}
                    />
                    <span className="font-black text-accent-blue">{form.mood_score}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Sleep (Hours)</Label>
                    <div className="relative">
                       <Moon className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                       <Input 
                        type="number" step="0.5" 
                        className="pl-9"
                        value={form.sleep_hours}
                        onChange={(e) => setForm({...form, sleep_hours: parseFloat(e.target.value)})}
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Stress (1-10)</Label>
                    <div className="relative">
                       <Zap className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                       <Input 
                        type="number" 
                        className="pl-9"
                        value={form.stress_level}
                        onChange={(e) => setForm({...form, stress_level: parseInt(e.target.value)})}
                       />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Private Notes</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                    <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-border-glass bg-bg-tertiary px-3 py-2 pl-9 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-blue transition-all"
                        placeholder="Anything on your mind?..." 
                        value={form.notes}
                        onChange={(e) => setForm({...form, notes: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full py-6 text-lg" type="submit" disabled={submitting}>
                   {submitting ? 'Submitting...' : 'Complete Reflection'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         {/* Mood Trend Chart */}
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle className="text-lg flex items-center">
               <TrendingUp className="mr-2 h-5 w-5 text-accent-purple" />
               Wellbeing History
             </CardTitle>
             <CardDescription>Your trailing 7-day mood reflections</CardDescription>
           </CardHeader>
           <CardContent className="h-[250px]">
             <TrendLine data={data?.mood_trend} label="Mood Score" color="#8b5cf6" />
           </CardContent>
         </Card>

         {/* Room Info */}
         <Card className="flex flex-col justify-center">
            <CardHeader>
               <CardTitle className="text-lg flex items-center">
                  <Info className="mr-2 h-5 w-5 text-accent-cyan" />
                  Your Campus Info
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="p-4 rounded-xl bg-bg-glass border border-border-glass">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Hostel Allocation</Label>
                  <div className="text-xl font-bold text-text-primary mt-1">
                     {data?.room_allocation?.block} • {data?.room_allocation?.room}
                  </div>
               </div>
               <div className="p-4 rounded-xl bg-bg-glass border border-border-glass">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Support Availability</Label>
                  <div className="text-sm font-medium text-accent-green mt-1 flex items-center">
                     <CheckCircle2 className="mr-2 h-4 w-4" />
                     Counsellor is Available Today
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* Success Success Popover */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-full bg-accent-green text-white font-bold flex items-center shadow-2xl"
          >
            <CheckCircle2 className="mr-3 h-5 w-5" />
            Check-in submitted. Stay mindful!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
