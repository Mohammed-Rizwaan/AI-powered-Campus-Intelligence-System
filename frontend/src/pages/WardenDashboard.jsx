import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Users, Zap, MoveRight, CheckCircle2, AlertTriangle, Info, ArrowRightLeft } from 'lucide-react';
import { api, fetchApi } from '../api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function WardenDashboard() {
  const [hostels, setHostels] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [energyAlerts, setEnergyAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState({});
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  const loadData = async () => {
    try {
      const [hostelRes, suggestionRes, energyRes] = await Promise.all([
        fetchApi('/hostels'),
        fetchApi('/hostels/allocation-suggestions'),
        fetchApi('/resources/energy-alerts')
      ]);
      setHostels(hostelRes.hostel_blocks);
      setSuggestions(suggestionRes.suggestions);
      setEnergyAlerts(energyRes.energy_alerts);
      
      if (hostelRes.hostel_blocks.length > 0) {
        setSelectedBlockId(hostelRes.hostel_blocks[0].id);
      }
    } catch (err) {
      console.error('Failed to load warden data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async (blockId) => {
    try {
      const res = await fetchApi(`/hostels/${blockId}/rooms`);
      setRooms(prev => ({ ...prev, [blockId]: res.rooms }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedBlockId && !rooms[selectedBlockId]) {
      loadRooms(selectedBlockId);
    }
  }, [selectedBlockId]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Top Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {hostels.map((block) => (
          <Card key={block.id} className={`${block.status === 'Overloaded' ? 'border-risk-critical/30' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                 <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">{block.name}</p>
                    <h3 className="text-2xl font-black mt-1">{block.occupancy_rate}%</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      block.status === 'Overloaded' ? 'bg-risk-critical/10 text-risk-critical' : 
                      block.status === 'Underutilized' ? 'bg-accent-amber/10 text-accent-amber' : 'bg-accent-green/10 text-accent-green'
                    }`}>
                      {block.status}
                    </span>
                 </div>
                 <div className={`p-3 rounded-xl bg-bg-glass ${block.status === 'Overloaded' ? 'text-risk-critical' : 'text-accent-blue'}`}>
                    <Home className="h-6 w-6" />
                 </div>
              </div>
              <div className="mt-4 h-1.5 w-full bg-bg-glass rounded-full overflow-hidden">
                <div 
                  className={`h-full ${block.status === 'Overloaded' ? 'bg-risk-critical' : 'bg-accent-blue'}`} 
                  style={{ width: `${block.occupancy_rate}%` }} 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-3 items-start">
        {/* Allocation Intelligence */}
        <div className="xl:col-span-2 space-y-8">
           <Card className="border-accent-blue/20 bg-accent-blue/5">
              <CardHeader>
                 <CardTitle className="text-xl flex items-center">
                    <ArrowRightLeft className="mr-2 h-6 w-6 text-accent-blue" />
                    Allocation Intelligence
                 </CardTitle>
                 <CardDescription>AI-generated suggestions to optimize campus living space</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                   {suggestions.map((sug, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 rounded-2xl bg-bg-glass border border-border-glass flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                         <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue font-bold">
                               {sug.student_count}
                            </div>
                            <div>
                               <p className="text-sm font-semibold">{sug.reason}</p>
                               <div className="flex items-center text-[10px] text-text-secondary mt-1 uppercase tracking-widest">
                                  <span className="font-bold text-risk-critical">{sug.from_block}</span>
                                  <MoveRight className="mx-2 h-3 w-3" />
                                  <span className="font-bold text-accent-green">{sug.to_block}</span>
                               </div>
                            </div>
                         </div>
                         <Button variant="outline" size="sm" className="h-9 text-xs font-bold rounded-xl">
                            Mark Reviewed
                         </Button>
                      </motion.div>
                   ))}
                </div>
              </CardContent>
           </Card>

           <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                 <div>
                    <CardTitle className="text-xl">Room Inventory</CardTitle>
                    <CardDescription>Real-time availability tracking</CardDescription>
                 </div>
                 <div className="flex bg-bg-glass p-1.5 rounded-2xl overflow-x-auto">
                    {hostels.map(b => (
                       <button 
                         key={b.id}
                         onClick={() => setSelectedBlockId(b.id)}
                         className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                            selectedBlockId === b.id ? 'bg-bg-secondary text-accent-blue shadow-sm' : 'text-text-secondary hover:text-text-primary'
                         }`}
                       >
                          {b.name}
                       </button>
                    ))}
                 </div>
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8 gap-4">
                    {rooms[selectedBlockId]?.map((room) => (
                       <div 
                         key={room.id}
                         className={`p-4 rounded-2xl border text-center transition-all ${
                            room.is_full ? 'bg-risk-critical/5 border-risk-critical/20 grayscale' : 'bg-bg-glass border-border-glass hover:border-accent-blue/40 hover:shadow-sm'
                         }`}
                       >
                          <div className="text-xs font-bold text-text-primary">{room.room_number}</div>
                          <div className="text-[10px] text-text-secondary mt-1">{room.allocated}/{room.capacity}</div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Resource Alerts */}
        <div className="xl:col-span-1 space-y-8">
           <Card className="border-accent-amber/20 bg-accent-amber/5">
              <CardHeader>
                 <CardTitle className="text-xl flex items-center text-accent-amber">
                    <Zap className="mr-2 h-6 w-6" />
                    Resource Monitoring
                 </CardTitle>
                 <CardDescription className="text-accent-amber/70">Anomaly detection system</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-5">
                    {energyAlerts.length === 0 ? (
                       <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                          <CheckCircle2 className="h-10 w-10 mb-2 opacity-20" />
                          <p className="text-sm">No active resource anomalies.</p>
                       </div>
                    ) : energyAlerts.map((alert) => (
                       <motion.div 
                         key={alert.id}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className={`p-5 rounded-2xl border relative overflow-hidden ${
                            alert.anomaly_description.includes('CRITICAL') ? 'bg-risk-critical/10 border-risk-critical/20 shadow-[0_0_20px_rgba(239,68,68,0.1)] animate-pulse' : 'bg-bg-glass border-border-glass'
                         }`}
                       >
                          <div className="flex items-center space-x-2 mb-2 font-bold text-xs uppercase tracking-wider">
                             <AlertTriangle className="h-4 w-4" />
                             <span>{alert.location}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed mb-3">
                             {alert.anomaly_description}
                          </p>
                          <Button variant="ghost" size="sm" className="w-full text-[10px] h-9 bg-bg-glass/50 hover:bg-bg-glass rounded-xl">
                             Acknowledge Anomaly
                          </Button>
                       </motion.div>
                    ))}
                 </div>
              </CardContent>
              <CardFooter className="pt-0">
                 <div className="w-full p-4 rounded-xl bg-bg-glass border border-border-glass">
                    <div className="flex items-center text-xs font-bold text-text-secondary mb-2">
                       <Info className="h-3 w-3 mr-2" />
                       OPERATIONAL INSIGHT
                    </div>
                    <p className="text-[10px] leading-normal italic text-text-secondary">
                       "Lab-3 energy spike matches off-hours cleaning schedule? Verify if equipment left on."
                    </p>
                 </div>
              </CardFooter>
           </Card>
        </div>
      </div>
    </div>
  );
}
