import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, User, Disc } from 'lucide-react';
import { AnimatedPage } from '../components/AnimatedPage';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (method) => {
    // Mock login
    login({
      id: Math.random().toString(36).substr(2, 9),
      method,
      joinedAt: new Date().toISOString()
    });
    navigate('/onboarding');
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-bg px-4">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-brand-accent blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-purple-600 blur-[100px]" />
        </div>

        <motion.div 
          className="max-w-md w-full bg-[#111]/80 backdrop-blur-xl border border-[#333] rounded-2xl p-8 relative z-10 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center mb-10">
            <motion.div 
              className="inline-block mb-4"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            >
              <Disc size={48} className="text-brand-accent mx-auto" />
            </motion.div>
            <h1 className="text-3xl font-pixel glow-text mb-4 text-brand-accent">TAPEDECK</h1>
            <p className="text-gray-400 font-mono text-sm leading-relaxed">
              Your music. Your mixtapes.<br />Your memories.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => handleLogin('google')}
              className="w-full flex items-center gap-4 bg-white text-black p-4 rounded-xl hover:bg-gray-100 transition-colors font-bold shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <button 
              onClick={() => handleLogin('apple')}
              className="w-full flex items-center gap-4 bg-[#1a1a1a] text-white p-4 rounded-xl border border-[#333] hover:bg-[#222] transition-colors font-bold shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Continue with Apple
            </button>

            <button 
              onClick={() => handleLogin('email')}
              className="w-full flex items-center gap-4 bg-[#1a1a1a] text-white p-4 rounded-xl border border-[#333] hover:bg-[#222] transition-colors font-bold shadow-lg"
            >
              <Mail className="w-5 h-5" />
              Continue with Email
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[#333]">
            <button 
              onClick={() => handleLogin('guest')}
              className="w-full flex items-center justify-center gap-3 text-gray-500 hover:text-white transition-colors text-sm font-mono tracking-wider"
            >
              <User size={16} />
              CONTINUE AS GUEST
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};
