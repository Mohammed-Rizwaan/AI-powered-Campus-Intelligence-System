import React, { useEffect, useState } from 'react';
import { api, fetchApi } from '../api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Shield, Activity, Users, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GenericDashboard({ roleTitle }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.getMe().then(res => setUser(res.user));
  }, []);

  const stats = [
    { label: 'System Status', value: 'Active', icon: Shield, color: 'text-accent-green' },
    { label: 'Entity Access', value: roleTitle, icon: Users, color: 'text-accent-blue' },
    { label: 'Refreshed', value: 'Live', icon: Clock, color: 'text-accent-purple' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border-glass bg-bg-secondary/40 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl bg-bg-glass ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xl font-black mt-1">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="overflow-hidden border-border-glass bg-bg-secondary/40 backdrop-blur-3xl relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Activity className="h-32 w-32 text-accent-blue" />
          </div>
          <CardHeader className="pb-8">
            <div className="flex items-center space-x-4 mb-4">
               <div className="h-12 w-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20 shadow-inner">
                  <LayoutDashboardIcon className="h-6 w-6 text-accent-blue" />
               </div>
               <div>
                  <CardTitle className="text-2xl font-black">Control Interface</CardTitle>
                  <CardDescription>Authentication successful / Data streams ready</CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 rounded-2xl bg-bg-glass border border-border-glass">
              <p className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Identity Verification</p>
               {user ? (
                <div className="flex items-center space-x-6">
                    <div className="h-16 w-16 rounded-full bg-accent-blue/5 border-2 border-accent-blue/20 flex items-center justify-center p-1">
                       <div className="h-full w-full rounded-full bg-bg-tertiary flex items-center justify-center">
                          <User className="h-8 w-8 text-accent-blue" />
                       </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">{user.username}</h3>
                        <div className="flex items-center mt-1 space-x-3">
                           <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-accent-blue text-white">{roleTitle}</span>
                           <span className="text-xs text-text-muted">ID: {user.id.slice(0, 8)}</span>
                        </div>
                    </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4 animate-pulse">
                   <div className="h-16 w-16 rounded-full bg-bg-glass" />
                   <div className="space-y-2">
                       <div className="h-4 w-32 bg-bg-glass rounded" />
                       <div className="h-3 w-24 bg-bg-glass rounded" />
                   </div>
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
               <div className="p-6 rounded-2xl bg-bg-glass border border-border-glass">
                  <h4 className="text-xs font-black text-accent-blue uppercase tracking-[0.2em] mb-3">Live Feed Status</h4>
                  <div className="space-y-3">
                     {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between text-xs text-text-secondary">
                           <span className="flex items-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-accent-green mr-2 animate-pulse" />
                              Data Channel {i}00{i}
                           </span>
                           <span className="font-mono">Syncing...</span>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="p-6 rounded-2xl bg-bg-glass border border-border-glass flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2">Notice</p>
                  <p className="text-sm italic leading-relaxed text-text-primary">
                    "Welcome to your operational center. Detailed modules are loading. Please check the sidebar for active intelligence feeds."
                  </p>
               </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function LayoutDashboardIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
