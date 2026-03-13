import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/Card';
import { TrendingUp, TrendingDown, Users, AlertCircle, Home, Zap, Shield } from 'lucide-react';

const icons = {
  total_students: Users,
  students_at_risk: AlertCircle,
  active_alerts: Shield,
  pending_interventions: TrendingUp,
  global_occupancy_rate: Home,
};

const labels = {
  total_students: 'TOTAL ENTITIES',
  students_at_risk: 'RISK DETECTION',
  active_alerts: 'SYSTEM ALERTS',
  pending_interventions: 'ACTIVE ACTIONS',
  global_occupancy_rate: 'SPACE UTILIZATION',
};

const colors = {
  total_students: 'text-accent-blue bg-accent-blue/5 border-accent-blue/10',
  students_at_risk: 'text-risk-critical bg-risk-critical/5 border-risk-critical/10',
  active_alerts: 'text-accent-amber bg-accent-amber/5 border-accent-amber/10',
  pending_interventions: 'text-accent-purple bg-accent-purple/5 border-accent-purple/10',
  global_occupancy_rate: 'text-accent-cyan bg-accent-cyan/5 border-accent-cyan/10',
};

export default function KPICards({ kpis }) {
  if (!kpis) return null;

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Object.entries(kpis).map(([key, value], index) => {
        const Icon = icons[key] || Users;
        const colorClass = colors[key] || 'text-accent-blue bg-accent-blue/5 border-accent-blue/10';
        
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden border-border-glass bg-bg-secondary/40 backdrop-blur-xl group hover:border-border-glass-hover transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {key === 'students_at_risk' && value > 0 && (
                       <span className="flex h-2 w-2 rounded-full bg-risk-critical animate-ping" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-[0.2em] text-text-muted uppercase">{labels[key]}</p>
                    <div className="flex items-baseline mt-1 space-x-1">
                      <h3 className="text-3xl font-black tracking-tighter text-text-primary">
                        {key === 'global_occupancy_rate' ? `${value}%` : value}
                      </h3>
                      <span className="text-[10px] font-bold text-accent-green flex items-center">
                         <TrendingUp className="h-3 w-3 mr-0.5" />
                         LIVE
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              {/* Decorative progress bars or indicators could go here */}
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-bg-glass">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, delay: index * 0.1 }}
                    className={`h-full opacity-30 ${colorClass.split(' ')[0].replace('text-', 'bg-')}`}
                 />
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
