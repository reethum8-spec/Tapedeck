import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTape } from '../context/TapeContext';
import { CassetteCanvas } from '../components/CassetteCanvas';
import { AnimatedPage } from '../components/AnimatedPage';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const STICKERS = ['🎵', '⭐', '🌙', '🔥', '🌊', '✨', '💖', '🌈', '⚡', '🌸', '👽'];

export const EditTape = () => {
  const { id } = useParams();
  const { tapes, updateTape } = useTape();
  const navigate = useNavigate();

  const existingTape = tapes.find(t => t.id === id);

  const [name, setName] = useState('');
  const [shellColor, setShellColor] = useState('#1a472a');
  const [labelColor, setLabelColor] = useState('#5DCAA5');
  const [sticker, setSticker] = useState('🎵');

  useEffect(() => {
    if (existingTape) {
      setName(existingTape.name || '');
      setShellColor(existingTape.color || '#1a472a');
      setLabelColor(existingTape.labelColor || '#5DCAA5');
      setSticker(existingTape.sticker || '');
    } else {
      navigate('/');
    }
  }, [existingTape, navigate]);

  if (!existingTape) return null;

  if (existingTape.lockedUntil && new Date(existingTape.lockedUntil) > new Date()) {
    return (
      <AnimatedPage>
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-24 h-24 bg-[#111] rounded-xl flex items-center justify-center border-2 border-[#333] mb-6 shadow-[0_0_30px_rgba(0,0,0,0.8)_inset]">
            <Lock size={48} className="text-gray-500" />
          </div>
          <div className="text-xl font-pixel text-brand-accent glow-text mb-4">TIME CAPSULE LOCKED</div>
          <p className="font-mono text-gray-400 text-sm max-w-sm">
            This tape is sealed and cannot be played or edited until the countdown finishes.
          </p>
          <button onClick={() => navigate('/')} className="mt-8 text-brand-accent font-mono text-sm underline hover:text-white">
            BACK TO SHELF
          </button>
        </div>
      </AnimatedPage>
    );
  }

  const previewTape = {
    ...existingTape,
    name,
    color: shellColor,
    labelColor: labelColor,
    sticker,
  };

  const handleSave = () => {
    if (!name.trim()) return;
    updateTape(id, {
      name,
      color: shellColor,
      labelColor: labelColor,
      sticker,
    });
    navigate('/');
  };

  return (
    <AnimatedPage>
      <div className="text-center mb-8 pt-4">
        <h1 className="text-2xl font-pixel glow-text mb-2">EDIT YOUR TAPE</h1>
        <p className="text-gray-500 font-mono text-xs tracking-widest">CUSTOMIZE YOUR MIXTAPE'S LOOK</p>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-10 items-center lg:items-start">
        {/* Live Preview */}
        <motion.div
          className="flex-1 w-full max-w-[420px]"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="sticky top-24">
            <div className="retro-border p-6 flex flex-col items-center gap-4">
              <div className="text-[10px] font-mono text-gray-500 tracking-widest mb-2">LIVE PREVIEW</div>
              <motion.div
                key={`${shellColor}-${labelColor}-${sticker}`}
                initial={{ scale: 0.95, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <CassetteCanvas tape={previewTape} isPlaying={false} progress={0.3} />
              </motion.div>
              <div className="led-dot" />
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="flex-1 w-full"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          <div className="retro-border p-8 space-y-8">
            {/* Name */}
            <div>
              <label className="block text-[10px] text-gray-500 mb-2 font-mono tracking-[0.2em]">TAPE NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={18}
                className="w-full bg-[#0a0a0a] border border-[#333] p-4 text-brand-accent text-lg focus:border-brand-accent outline-none font-mono tracking-wider transition-colors"
                placeholder="ENTER NAME..."
              />
            </div>

            {/* Custom Color Palette */}
            <div className="flex gap-6">
              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 mb-3 font-mono tracking-[0.2em]">SHELL COLOR</label>
                <div className="relative w-full h-14 rounded-lg overflow-hidden border border-[#333] focus-within:border-brand-accent transition-colors">
                  <input
                    type="color"
                    value={shellColor}
                    onChange={(e) => setShellColor(e.target.value)}
                    className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] cursor-pointer"
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center mix-blend-difference font-mono text-xs text-white drop-shadow-md">
                    {shellColor.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 mb-3 font-mono tracking-[0.2em]">LABEL COLOR</label>
                <div className="relative w-full h-14 rounded-lg overflow-hidden border border-[#333] focus-within:border-brand-accent transition-colors">
                  <input
                    type="color"
                    value={labelColor}
                    onChange={(e) => setLabelColor(e.target.value)}
                    className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] cursor-pointer"
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center mix-blend-difference font-mono text-xs text-white drop-shadow-md">
                    {labelColor.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticker Picker */}
            <div>
              <label className="block text-[10px] text-gray-500 mb-3 font-mono tracking-[0.2em]">STICKER</label>
              <div className="flex gap-2 flex-wrap">
                {STICKERS.map((s) => (
                  <motion.button
                    key={s}
                    onClick={() => setSticker(s)}
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    whileTap={{ scale: 0.85 }}
                    className={`w-12 h-12 text-2xl flex items-center justify-center rounded-lg border transition-all duration-200 ${
                      sticker === s
                        ? 'bg-brand-accent/10 border-brand-accent shadow-[0_0_10px_rgba(93,202,165,0.3)]'
                        : 'border-[#333] hover:border-gray-500 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {s}
                  </motion.button>
                ))}
                <motion.button
                  onClick={() => setSticker('')}
                  whileHover={{ scale: 1.1 }}
                  className={`w-12 h-12 text-[10px] font-mono flex items-center justify-center rounded-lg border transition-all duration-200 ${
                    sticker === ''
                      ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                      : 'border-[#333] text-gray-600 hover:border-gray-500'
                  }`}
                >
                  NONE
                </motion.button>
              </div>
            </div>

            {/* Save Button */}
            <motion.button
              onClick={handleSave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-brand-accent text-black font-bold text-sm tracking-[0.3em] rounded hover:shadow-[0_0_20px_rgba(93,202,165,0.4)] transition-all duration-300 font-mono"
            >
              ✔ SAVE TAPE
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};
