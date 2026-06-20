import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AnimatedPage } from '../components/AnimatedPage';
import { Check, ChevronRight, Cat, Rabbit, Ghost, Disc, Music, Headphones } from 'lucide-react';

const TAPE_COLORS = [
  { id: 'pink', name: 'Pastel Pink', color: '#ffb3ba' },
  { id: 'lavender', name: 'Lavender', color: '#e6e6fa' },
  { id: 'matcha', name: 'Matcha Green', color: '#baffc9' },
  { id: 'midnight', name: 'Midnight Blue', color: '#2c3e50' },
  { id: 'orange', name: 'Retro Orange', color: '#ffdfba' },
  { id: 'transparent', name: 'Transparent', color: 'rgba(255,255,255,0.2)' },
];

const GENRES = [
  'Pop', 'Indie', 'Lo-fi', 'K-Pop', 'Rock', 
  'Jazz', 'Hip-Hop', 'Classical', 'R&B', 'Electronic'
];

export const Onboarding = () => {
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Form State
  const [tapeTag, setTapeTag] = useState('');
  const [companion, setCompanion] = useState('cat');
  const [tapeColor, setTapeColor] = useState('pink');
  const [genres, setGenres] = useState([]);

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = () => {
    completeOnboarding({
      tapeTag: tapeTag || `user${Math.floor(Math.random() * 10000)}`,
      companion,
      tapeColor,
      genres
    });
    navigate('/');
  };

  const toggleGenre = (g) => {
    setGenres(prev => 
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
  };

  const variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          
          {/* Progress Bar */}
          <div className="mb-12 flex justify-center gap-2">
            {[1,2,3,4,5].map(i => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-12 bg-brand-accent' : 
                  i < step ? 'w-4 bg-brand-accent/50' : 'w-4 bg-[#333]'
                }`} 
              />
            ))}
          </div>

          <div className="bg-[#111] border border-[#222] rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-[400px]">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: TapeTag */}
              {step === 1 && (
                <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col h-full justify-center">
                  <h2 className="text-3xl font-pixel text-brand-accent mb-2">Claim Your TapeTag</h2>
                  <p className="text-gray-400 font-mono mb-8">This is how friends will find your mixtapes.</p>
                  
                  <div className="relative mb-8">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xl">@</span>
                    <input 
                      type="text" 
                      value={tapeTag}
                      onChange={(e) => setTapeTag(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="username"
                      className="w-full bg-[#1a1a1a] border-2 border-[#333] focus:border-brand-accent rounded-xl py-4 pl-12 pr-4 text-white font-mono text-xl outline-none transition-colors"
                      autoFocus
                    />
                    {tapeTag.length > 2 && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-accent">
                        <Check size={20} />
                      </motion.div>
                    )}
                  </div>

                  <button 
                    onClick={nextStep}
                    disabled={tapeTag.length < 3}
                    className="mt-auto flex items-center justify-center gap-2 bg-brand-accent text-black font-bold py-4 rounded-xl hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Continue <ChevronRight size={20} />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Companion */}
              {step === 2 && (
                <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col h-full justify-center">
                  <h2 className="text-3xl font-pixel text-brand-accent mb-2">Pick Your Companion</h2>
                  <p className="text-gray-400 font-mono mb-8">They'll keep you company while you jam.</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-12">
                    {[
                      { id: 'cat', icon: Cat, label: 'Pixel Cat' },
                      { id: 'bunny', icon: Rabbit, label: 'Bumping Bunny' },
                      { id: 'buddy', icon: Ghost, label: 'Space Buddy' }
                    ].map(c => (
                      <button
                        key={c.id}
                        onClick={() => setCompanion(c.id)}
                        className={`p-6 rounded-xl border-2 flex flex-col items-center gap-4 transition-all ${
                          companion === c.id 
                            ? 'border-brand-accent bg-brand-accent/10 shadow-[0_0_15px_rgba(93,202,165,0.2)]' 
                            : 'border-[#333] hover:border-[#555] bg-[#1a1a1a]'
                        }`}
                      >
                        <c.icon size={48} className={companion === c.id ? 'text-brand-accent' : 'text-gray-500'} />
                        <span className="font-mono text-xs">{c.label}</span>
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={nextStep}
                    className="mt-auto flex items-center justify-center gap-2 bg-brand-accent text-black font-bold py-4 rounded-xl hover:bg-brand-accent/90 transition-all"
                  >
                    Continue <ChevronRight size={20} />
                  </button>
                </motion.div>
              )}

              {/* STEP 3: Tape Style */}
              {step === 3 && (
                <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col h-full justify-center">
                  <h2 className="text-3xl font-pixel text-brand-accent mb-2">First Tape Style</h2>
                  <p className="text-gray-400 font-mono mb-8">Choose the aesthetic for your first mixtape.</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                    {TAPE_COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setTapeColor(c.id)}
                        className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                          tapeColor === c.id 
                            ? 'border-white bg-white/5' 
                            : 'border-[#333] hover:border-[#555] bg-[#1a1a1a]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded shadow-inner" style={{ background: c.color }} />
                        <span className="font-mono text-xs text-left leading-tight">{c.name}</span>
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={nextStep}
                    className="mt-auto flex items-center justify-center gap-2 bg-brand-accent text-black font-bold py-4 rounded-xl hover:bg-brand-accent/90 transition-all"
                  >
                    Continue <ChevronRight size={20} />
                  </button>
                </motion.div>
              )}

              {/* STEP 4: Genres */}
              {step === 4 && (
                <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col h-full justify-center">
                  <h2 className="text-3xl font-pixel text-brand-accent mb-2">Favorite Genres</h2>
                  <p className="text-gray-400 font-mono mb-8">Select a few to tune your recommendations.</p>
                  
                  <div className="flex flex-wrap gap-3 mb-12">
                    {GENRES.map(g => {
                      const isSelected = genres.includes(g);
                      return (
                        <button
                          key={g}
                          onClick={() => toggleGenre(g)}
                          className={`px-4 py-2 rounded-full border transition-all font-mono text-sm ${
                            isSelected 
                              ? 'border-brand-accent bg-brand-accent text-black font-bold' 
                              : 'border-[#444] text-gray-400 hover:border-gray-300'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    onClick={nextStep}
                    className="mt-auto flex items-center justify-center gap-2 bg-brand-accent text-black font-bold py-4 rounded-xl hover:bg-brand-accent/90 transition-all"
                  >
                    Continue <ChevronRight size={20} />
                  </button>
                </motion.div>
              )}

              {/* STEP 5: Connect */}
              {step === 5 && (
                <motion.div key="step5" variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col h-full justify-center text-center">
                  <Disc size={48} className="text-brand-accent mx-auto mb-4" />
                  <h2 className="text-3xl font-pixel text-brand-accent mb-2">Bring Your Music</h2>
                  <p className="text-gray-400 font-mono mb-8">Connect your favorite streaming services to import playlists into Tapedeck.</p>
                  
                  <div className="space-y-4 mb-8">
                    <button className="w-full bg-[#1DB954] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all">
                      <Music size={20} /> Connect Spotify
                    </button>
                    <button className="w-full bg-[#fa243c] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all">
                      <Headphones size={20} /> Connect Apple Music
                    </button>
                  </div>

                  <button 
                    onClick={handleComplete}
                    className="text-gray-500 hover:text-white font-mono text-sm transition-colors"
                  >
                    SKIP FOR NOW →
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};
