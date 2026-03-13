import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, Home, User, ShieldAlert, Zap, LayoutDashboard, Settings, HelpCircle } from 'lucide-react';
import { removeToken, getUser } from '../../api';

export default function DashboardLayout({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const role = user?.role;

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: `/${role}`, roles: ['admin', 'counsellor', 'warden', 'student'] },
    { label: 'Alert Center', icon: ShieldAlert, path: `/${role}/alerts`, roles: ['admin', 'counsellor'] },
    { label: 'Resource Hub', icon: Zap, path: `/${role}/resources`, roles: ['admin', 'warden'] },
  ].filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen w-full bg-bg-primary text-text-primary grid-bg relative overflow-hidden">
      {/* Background Glows */}
      <div className="bg-orb w-[600px] h-[600px] bg-accent-blue/5 -top-48 -left-48" />
      <div className="bg-orb w-[500px] h-[500px] bg-accent-purple/5 -bottom-48 -right-48" />

      {/* Sidebar */}
      <aside className="w-72 flex-col justify-between hidden border-r border-border-glass bg-bg-secondary/40 backdrop-blur-2xl md:flex z-50 transition-all duration-300">
        <div className="flex flex-col h-full">
          <div className="flex h-20 items-center px-8 border-b border-border-glass">
            <div className="h-10 w-10 rounded-xl bg-accent-blue/10 flex items-center justify-center mr-3 border border-accent-blue/20">
               <ShieldAlert className="h-6 w-6 text-accent-blue" />
            </div>
            <h1 className="text-xl font-black tracking-tighter gradient-text">CAMPUSIQ</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto py-8">
             <div className="px-4 mb-4">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 opacity-70">Main Systems</p>
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <Link 
                      key={item.label}
                      to={item.path} 
                      className={`flex items-center rounded-xl px-4 py-3 text-xs font-bold transition-all duration-200 group relative ${
                        location.pathname === item.path 
                          ? 'bg-accent-blue/10 text-accent-blue shadow-[0_4px_20px_rgba(59,130,246,0.1)] border border-accent-blue/20' 
                          : 'text-text-secondary hover:bg-bg-glass hover:text-text-primary'
                      }`}
                    >
                      {location.pathname === item.path && (
                         <div className="absolute left-0 w-1 h-6 bg-accent-blue rounded-r-full" />
                      )}
                      <item.icon className={`mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                         location.pathname === item.path ? 'text-accent-blue' : 'text-text-muted'
                      }`} />
                      {item.label}
                    </Link>
                  ))}
                </nav>
             </div>

             <div className="px-4 mt-8 pt-8 border-t border-border-glass/50">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 opacity-70">Support & Config</p>
                <div className="space-y-2">
                   <button className="flex w-full items-center rounded-xl px-4 py-3 text-xs font-bold text-text-secondary hover:bg-bg-glass hover:text-text-primary transition-all">
                      <Settings className="mr-3 h-5 w-5 text-text-muted" />
                      Settings
                   </button>
                   <button className="flex w-full items-center rounded-xl px-4 py-3 text-xs font-bold text-text-secondary hover:bg-bg-glass hover:text-text-primary transition-all">
                      <HelpCircle className="mr-3 h-5 w-5 text-text-muted" />
                      Help Center
                   </button>
                </div>
             </div>
          </div>

          <div className="p-6 border-t border-border-glass bg-bg-secondary/20">
             <div className="flex items-center justify-between p-4 rounded-2xl bg-bg-glass border border-border-glass mb-4 group cursor-pointer hover:border-accent-purple/30 transition-all">
                <div className="flex items-center space-x-3">
                   <div className="h-10 w-10 rounded-full bg-accent-purple/10 flex items-center justify-center border border-accent-purple/20">
                      <User className="h-5 w-5 text-accent-purple" />
                   </div>
                   <div className="min-w-0">
                      <p className="text-xs font-black truncate">{user?.username || 'System User'}</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-widest leading-none mt-1">{role}</p>
                   </div>
                </div>
             </div>
             <button 
               onClick={handleLogout}
               className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-xs font-black text-risk-critical bg-risk-critical/5 hover:bg-risk-critical/10 border border-risk-critical/10 transition-all group"
             >
               <LogOut className="mr-3 h-4 w-4 transition-transform group-hover:-translate-x-1" />
               TERMINATE SESSION
             </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full relative z-10 min-w-0">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-border-glass bg-bg-secondary/30 backdrop-blur-xl px-10">
          <div className="flex items-center space-x-6">
             <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-accent-green shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-green">Operational</span>
             </div>
             <div className="h-6 w-[1px] bg-border-glass" />
             <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-secondary">{title}</h2>
          </div>
          
          <div className="flex items-center space-x-8">
             <div className="hidden lg:flex items-center space-x-6">
                <div className="text-[10px] font-bold text-text-muted flex flex-col items-end">
                   <span>DATA INTEGRITY</span>
                   <span className="text-accent-blue">VERIFIED</span>
                </div>
                <div className="h-10 w-[1px] bg-border-glass" />
             </div>
             <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end mr-2">
                   <span className="text-xs font-black">{user?.name}</span>
                   <span className="text-[10px] text-text-muted font-bold">{role?.toUpperCase()}</span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20">
                   <User className="h-5 w-5 text-accent-blue" />
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 lg:p-14 custom-scrollbar bg-bg-primary/20">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
