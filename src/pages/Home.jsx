import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTape } from '../context/TapeContext';
import { useAuth } from '../context/AuthContext';
import { CassetteCanvas } from '../components/CassetteCanvas';
import { AnimatedPage } from '../components/AnimatedPage';
import { BackgroundVinyl } from '../components/BackgroundVinyl';
import { motion, AnimatePresence } from 'framer-motion';
import { Pen, Trash2, Gift, Lock, Clock, Share2, Users } from 'lucide-react';
import { ShareModal } from '../components/ShareModal';

const LockedTape = ({ tape }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const diff = new Date(tape.lockedUntil) - new Date();
      if (diff <= 0) {
        setTimeLeft('UNLOCKED');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [tape.lockedUntil]);

  return (
    <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-4 border-2 border-[#333] shadow-[0_0_15px_rgba(0,0,0,0.8)_inset]">
      <Lock size={32} className="text-gray-400 mb-2" />
      <h3 className="font-pixel text-[10px] text-white tracking-widest text-center mb-1">TIME CAPSULE</h3>
      <div className="flex items-center gap-1 text-brand-accent font-mono text-sm mt-2">
        <Clock size={14} />
        {timeLeft}
      </div>
    </div>
  );
};

const WrappedGift = ({ tape, onUnwrap }) => {
  const [isUnwrapping, setIsUnwrapping] = useState(false);

  const handleUnwrap = (e) => {
    e.stopPropagation();
    setIsUnwrapping(true);
    setTimeout(() => {
      onUnwrap();
    }, 1200); // Wait for animation to finish
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="absolute inset-0 z-20 rounded-xl overflow-hidden cursor-pointer"
        onClick={handleUnwrap}
        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
        transition={{ duration: 1 }}
      >
        {/* Wrapping Paper Pattern */}
        <div className="absolute inset-0 bg-[#e74c3c]" style={{ backgroundImage: 'radial-gradient(#c0392b 15%, transparent 16%), radial-gradient(#c0392b 15%, transparent 16%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }} />
        
        {/* Ribbons */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-[#f1c40f] shadow-lg" />
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 bg-[#f1c40f] shadow-lg" />
        
        {/* Bow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#f39c12] rounded-full border-4 border-[#f1c40f] flex items-center justify-center shadow-xl">
          <Gift className="text-white" size={24} />
        </div>

        {/* Gift Tag */}
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-sm shadow-md border border-gray-300 transform -rotate-6">
          <p className="font-mono text-[10px] text-gray-500">FROM:</p>
          <p className="font-mono text-xs text-black font-bold">{tape.giftSender}</p>
        </div>

        {isUnwrapping && (
          <motion.div 
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, times: [0, 0.5, 1] }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export const Home = () => {
  const navigate = useNavigate();
  const { tapes, deleteTape, updateTape } = useTape();
  const { user } = useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [tapeToShare, setTapeToShare] = useState(null);

  const handleUnwrapGift = (tapeId) => {
    updateTape(tapeId, { isUnwrapped: true });
  };

  const handleShareClick = (e, tape) => {
    e.stopPropagation();
    setTapeToShare(tape);
    setShareModalOpen(true);
  };

  const handleTapeClick = (tape) => {
    // Prevent clicking if it's a locked time capsule
    if (tape.lockedUntil && new Date(tape.lockedUntil) > new Date()) {
      return;
    }
    // Prevent clicking if it's still wrapped
    if (tape.isGift && tape.isUnwrapped === false) {
      return; // click is handled by WrappedGift component
    }
    navigate(`/player/${tape.id}`);
  };

  return (
    <AnimatedPage>
      <BackgroundVinyl />
      {/* Hero Section */}
      <div className="text-center mb-12 pt-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-brand-accent font-mono text-xs tracking-[0.3em] mb-3 uppercase"
        >
          WELCOME, @{user?.tapeTag || 'GUEST'}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-pixel glow-text mb-4 tracking-tight"
        >
          YOUR SHELF
        </motion.h1>
        <p className="text-gray-500 font-mono text-sm tracking-widest">
          {tapes.length === 0 ? 'NO TAPES YET — CREATE YOUR FIRST MIXTAPE' : `${tapes.length} TAPE${tapes.length !== 1 ? 'S' : ''} IN COLLECTION`}
        </p>
      </div>

      {/* Cassette Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
        {tapes.map((tape, i) => {
          const isLocked = tape.lockedUntil && new Date(tape.lockedUntil) > new Date();
          const isWrapped = tape.isGift && tape.isUnwrapped === false;

          return (
            <motion.div
              key={tape.id}
              initial={{ opacity: 0, y: 30, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
              whileHover={{ y: -8, scale: 1.03, rotate: 1 }}
              className={`w-full max-w-[320px] group ${isLocked || isWrapped ? 'cursor-default' : 'cursor-pointer'}`}
              onClick={() => handleTapeClick(tape)}
            >
              <motion.div layoutId={`cassette-${tape.id}`} className="relative">
                <CassetteCanvas tape={tape} isPlaying={false} progress={0} />
                
                {/* Overlays */}
                {isLocked && <LockedTape tape={tape} />}
                {isWrapped && <WrappedGift tape={tape} onUnwrap={() => handleUnwrapGift(tape.id)} />}
                
                {/* Hover glow */}
                {!isLocked && !isWrapped && (
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ boxShadow: `0 0 30px ${tape.color}44, 0 0 60px ${tape.color}22` }}
                  />
                )}
              </motion.div>
              
              {/* Track count badge and Action Buttons */}
              <div className="mt-2 flex justify-between items-center px-4">
                <span className="text-[10px] font-mono text-gray-600 tracking-widest flex items-center gap-2">
                  {((tape.sideA || []).length + (tape.sideB || []).length)} TRACKS
                  {tape.isGift && tape.isUnwrapped && <Gift size={10} className="text-pink-400" title="Gift" />}
                  {tape.isCollaborative && <Users size={10} className="text-brand-accent" title="Collaborative" />}
                </span>
                <div className="flex gap-1">
                  {!isLocked && !isWrapped && (
                    <>
                      <button 
                        onClick={(e) => handleShareClick(e, tape)}
                        className="text-gray-600 hover:text-[#f1c40f] transition-colors p-1"
                        title="Share Tape"
                      >
                        <Share2 size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/edit/${tape.id}`); }}
                        className="text-gray-600 hover:text-brand-accent transition-colors p-1"
                        title="Edit Tape"
                      >
                        <Pen size={14} />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if(window.confirm('Erase this tape forever?')) {
                        deleteTape(tape.id); 
                      }
                    }}
                    className="text-gray-600 hover:text-red-500 transition-colors p-1"
                    title="Delete Tape"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* New Tape Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: tapes.length * 0.08 + 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="w-full max-w-[320px] aspect-[3/2] border-2 border-dashed border-[#333] hover:border-brand-accent rounded-xl flex items-center justify-center cursor-pointer transition-colors duration-300 group relative overflow-hidden"
          onClick={() => navigate('/create')}
        >
          <div className="absolute inset-0 bg-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-gray-600 group-hover:text-brand-accent flex flex-col items-center gap-3 font-mono transition-colors relative z-10">
            <span className="text-xs tracking-[0.3em]">NEW TAPE</span>
          </div>
        </motion.div>
      </div>

      {/* Empty state */}
      {tapes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-block retro-border p-8 max-w-md">
            <div className="text-6xl mb-4">📼</div>
            <h3 className="text-brand-accent font-pixel text-sm mb-3">EMPTY SHELF</h3>
            <p className="text-gray-500 text-sm mb-6 font-mono leading-relaxed">
              Head to <span className="text-brand-accent">DISCOVER</span> to find music,
              or <span className="text-brand-accent">CREATE</span> a blank tape and fill it up.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/discover')}
                className="px-6 py-2 bg-brand-accent text-black text-xs font-bold tracking-wider rounded hover:shadow-[0_0_16px_rgba(93,202,165,0.4)] transition-shadow"
              >
                DISCOVER MUSIC
              </button>
              <button
                onClick={() => navigate('/create')}
                className="px-6 py-2 border border-[#444] text-gray-400 text-xs font-bold tracking-wider rounded hover:border-brand-accent hover:text-brand-accent transition-colors"
              >
                CREATE TAPE
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
        tape={tapeToShare} 
      />
    </AnimatedPage>
  );
};
