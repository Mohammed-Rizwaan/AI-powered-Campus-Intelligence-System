import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, setToken } from '../api';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Shield, Lock, User, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.login(username, password);
      setToken(data.token);
      
      const role = data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'counsellor') navigate('/counsellor');
      else if (role === 'warden') navigate('/warden');
      else if (role === 'student') navigate('/student');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-bg-primary text-text-primary grid-bg relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="bg-orb w-[600px] h-[600px] bg-accent-blue/10 -top-48 -left-48" 
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="bg-orb w-[500px] h-[500px] bg-accent-purple/10 -bottom-48 -right-48" 
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <div className="flex flex-col items-center mb-8">
           <div className="h-16 w-16 bg-bg-glass border border-border-glass rounded-2xl flex items-center justify-center mb-4 shadow-2xl relative group">
              <Shield className="h-8 w-8 text-accent-blue group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-accent-blue/20 blur-xl rounded-full opacity-50" />
           </div>
           <h1 className="text-4xl font-black tracking-tighter gradient-text">CAMPUSIQ</h1>
           <p className="text-text-secondary text-sm font-bold uppercase tracking-[0.3em] mt-2">Intelligence Hub</p>
        </div>

        <Card className="z-10 shadow-2xl glow-blue border-border-glass bg-bg-secondary/40 backdrop-blur-2xl">
          <form onSubmit={handleLogin}>
            <CardHeader className="space-y-1 pb-8">
              <CardTitle className="text-xl font-bold flex items-center">
                <Lock className="mr-2 h-4 w-4 text-accent-blue" />
                Secure Access
              </CardTitle>
              <CardDescription className="text-text-muted">Enter credentials to enter the intelligence network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-xl bg-risk-critical/10 border border-risk-critical/20 text-xs font-bold text-risk-critical flex items-center"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {error}
                </motion.div>
              )}
              <div className="space-y-3">
                <Label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">System Entity ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g. admin_iq"
                    className="pl-10 h-12 bg-bg-tertiary/50"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" title="password label" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Security Key</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-12 bg-bg-tertiary/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Button className="w-full text-sm uppercase tracking-widest" type="submit" disabled={loading} size="lg">
                {loading ? (
                   <span className="flex items-center">
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Authorizing...
                   </span>
                ) : 'Establish Connection'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center mt-8 text-[10px] text-text-muted font-bold uppercase tracking-widest leading-loose">
          Authorized personnel only. <br />
          Encrypted with 256-bit campus-grade protocols.
        </p>
      </motion.div>
    </div>
  );
}
