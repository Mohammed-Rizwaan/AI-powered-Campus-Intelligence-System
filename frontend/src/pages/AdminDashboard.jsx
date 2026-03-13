import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, fetchApi } from '../api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import KPICards from '../components/dashboard/KPICards';
import { RiskDoughnut, TrendLine, ResourceBar } from '../components/dashboard/Charts';
import { AlertCircle, Zap, ShieldAlert, TrendingUp, Sparkles, LayoutDashboard } from 'lucide-react';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [wellbeing, setWellbeing] = useState(null);
  const [resource, setResource] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sumRes, wellRes, resRes, insightRes] = await Promise.all([
          fetchApi('/dashboard/summary'),
          fetchApi('/dashboard/wellbeing-overview'),
          fetchApi('/dashboard/resource-overview'),
          fetchApi('/resources/insights')
        ]);
        setSummary(sumRes.kpis);
        setWellbeing(wellRes);
        setResource(resRes);
        setInsights(insightRes.insights);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="relative h-12 w-12">
         <div className="absolute inset-0 rounded-full border-4 border-accent-blue/20" />
         <div className="absolute inset-0 rounded-full border-4 border-accent-blue border-t-transparent animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-black tracking-tighter">INTELLIGENCE TERMINAL</h1>
            <p className="text-text-secondary text-sm font-bold uppercase tracking-[0.2em] mt-1">Global Campus Status / Real-time Feeds</p>
         </div>
         <div className="flex bg-bg-glass p-1.5 rounded-xl border border-border-glass">
            <button className="px-4 py-2 text-xs font-black bg-accent-blue text-white rounded-lg shadow-lg shadow-accent-blue/20">SUMMARY</button>
            <button className="px-4 py-2 text-xs font-black text-text-secondary hover:text-text-primary transition-colors">DIAGNOSTICS</button>
         </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <KPICards kpis={summary} />
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Wellbeing Overview */}
        <Card className="lg:col-span-5 bg-bg-secondary/40 border-border-glass backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle className="text-lg font-black flex items-center">
                    <ShieldAlert className="mr-3 h-5 w-5 text-risk-critical" />
                    RISK PROFILE
                  </CardTitle>
                  <CardDescription>Current behavioral & academic risk distribution</CardDescription>
               </div>
               <div className="h-8 w-8 rounded-lg bg-bg-glass border border-border-glass flex items-center justify-center">
                  <LayoutDashboard className="h-4 w-4 text-text-muted" />
               </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <RiskDoughnut data={wellbeing?.risk_distribution} />
          </CardContent>
        </Card>

        {/* Risk Trend */}
        <Card className="lg:col-span-7 bg-bg-secondary/40 border-border-glass backdrop-blur-xl">
          <CardHeader>
             <CardTitle className="text-lg font-black flex items-center">
              <TrendingUp className="mr-3 h-5 w-5 text-accent-purple" />
              ANALYTIC TRENDS
            </CardTitle>
            <CardDescription>30-day composite risk score fluctuations</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <TrendLine data={wellbeing?.risk_trend_30_days} label="Composite Risk" color="#8b5cf6" />
          </CardContent>
        </Card>

        {/* Hostel Occupancy */}
        <Card className="lg:col-span-7 bg-bg-secondary/40 border-border-glass backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center">
              <AlertCircle className="mr-3 h-5 w-5 text-accent-cyan" />
              CAPACITY OPTIMIZATION
            </CardTitle>
            <CardDescription>Occupancy density per mapped hostel block</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResourceBar data={resource?.hostel_occupancy} label="Density %" color="#06b6d4" />
          </CardContent>
        </Card>

        {/* Energy usage */}
        <Card className="lg:col-span-5 bg-bg-secondary/40 border-border-glass backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center">
              <Zap className="mr-3 h-5 w-5 text-accent-amber" />
              RESOURCE SPIKES
            </CardTitle>
            <CardDescription>Daily energy consumption metrics (7D)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             <TrendLine data={resource?.energy_trend_7_days} label="Usage (kWh)" color="#f59e0b" />
          </CardContent>
        </Card>
      </div>

      {/* AI Strategy Insights Panel */}
      <Card className="border-border-glass bg-bg-secondary/40 backdrop-blur-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Sparkles className="h-40 w-40 text-accent-blue" />
        </div>
        <CardHeader className="border-b border-border-glass/50 pb-8">
          <div className="flex items-center space-x-4">
             <div className="h-12 w-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20">
                <Sparkles className="h-6 w-6 text-accent-blue" />
             </div>
             <div>
                <CardTitle className="text-2xl font-black gradient-text">HEURISTIC ENGINE INSIGHTS</CardTitle>
                <CardDescription>Machine-learning driven recommendations for proactive governance</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="pt-10">
          <div className="grid gap-6 md:grid-cols-3">
            {insights.slice(0, 3).map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-bg-tertiary/50 border border-border-glass group hover:border-accent-blue/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue bg-accent-blue/5 px-2.5 py-1 rounded-md border border-accent-blue/10">
                    {insight.category}
                  </span>
                  <div className={`h-2 w-2 rounded-full ${
                    insight.potential_saving === 'High' ? 'bg-risk-critical' : 'bg-accent-green'
                  } shadow-lg`} />
                </div>
                <p className="text-base font-bold text-text-primary leading-tight mb-3 group-hover:text-accent-blue transition-colors">
                   {insight.insight}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed italic">
                   "{insight.recommendation}"
                </p>
              </motion.div>
            ))}
          </div>

          {/* Critical Energy Anomaly Spotlight */}
          {resource?.pending_resource_alerts > 0 && (
             <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-2xl bg-risk-critical/5 border border-risk-critical/20 flex flex-col md:flex-row items-center gap-6"
            >
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-risk-critical/10 flex items-center justify-center border border-risk-critical/20 animate-pulse">
                <Zap className="h-8 w-8 text-risk-critical" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-black text-risk-critical uppercase tracking-tighter">RESOURCE ANOMALY DETECTED</h4>
                <p className="text-sm text-text-secondary mt-1">
                  Abnormal energy spikes detected in <strong>Lab-3</strong> during off-hours (02:00 - 05:00). Heuristics suggest equipment may have been left active.
                </p>
              </div>
              <button className="px-6 py-3 rounded-xl bg-risk-critical text-white font-black text-xs uppercase tracking-widest hover:bg-risk-critical/80 transition-all shadow-lg shadow-risk-critical/20 whitespace-nowrap">
                DESPATCH INVESTIGATION
              </button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
