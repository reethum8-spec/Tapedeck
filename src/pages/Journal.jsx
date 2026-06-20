import React, { useState } from 'react';
import { useTape } from '../context/TapeContext';
import { AnimatedPage } from '../components/AnimatedPage';
import { CassetteCanvas } from '../components/CassetteCanvas';
import { motion, AnimatePresence } from 'framer-motion';

const MemoryCard = ({ tape, updateTape }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [entry, setEntry] = useState(tape.journalEntry || '');

  const handleSave = (e) => {
    e.stopPropagation();
    updateTape(tape.id, { journalEntry: entry });
    setIsFlipped(false);
  };

  return (
    <div className="relative w-full max-w-[320px] aspect-[3/4] perspective-1000">
      <motion.div
        className="w-full h-full relative preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        {/* Front of Polaroid */}
        <div className="absolute inset-0 backface-hidden bg-white p-4 pb-16 rounded-sm shadow-xl flex flex-col items-center">
          <div className="w-full aspect-square bg-[#0a0a0a] rounded flex items-center justify-center p-4 relative overflow-hidden">
            <CassetteCanvas tape={tape} isPlaying={false} progress={0} />
            <div className="absolute inset-0 bg-black/10 pointer-events-none mix-blend-overlay" />
          </div>
          <div className="mt-auto pt-4 text-center w-full">
            <div className="font-mono text-black text-lg font-bold truncate handwritten-font">
              {tape.name}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              {tape.sideA.length + tape.sideB.length} TRACKS
            </div>
          </div>
        </div>

        {/* Back of Polaroid */}
        <div className="absolute inset-0 backface-hidden bg-[#fffdf0] p-6 rounded-sm shadow-xl rotate-y-180 flex flex-col border border-yellow-900/10">
          <div className="text-xs text-gray-400 font-mono mb-2 uppercase tracking-widest text-center">
            {tape.name} - MEMORY LOG
          </div>
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Write a memory about this mixtape..."
            className="flex-1 bg-transparent resize-none outline-none text-gray-800 font-mono text-sm leading-relaxed"
            style={{ 
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #e5e5e5 24px)',
              lineHeight: '24px',
              paddingTop: '4px'
            }}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
              className="px-3 py-1 text-xs font-bold text-gray-500 hover:text-black transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs font-bold bg-brand-accent text-black rounded hover:shadow-[0_0_10px_rgba(93,202,165,0.4)] transition-shadow"
            >
              SAVE MEMORY
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const Journal = () => {
  const { tapes, updateTape } = useTape();

  return (
    <AnimatedPage>
      <div className="text-center mb-12 pt-8">
        <h1 className="text-3xl md:text-5xl font-pixel glow-text mb-4 tracking-tight">
          LISTENING JOURNAL
        </h1>
        <p className="text-gray-500 font-mono text-sm tracking-widest">
          ATTACH MEMORIES TO YOUR MIXTAPES
        </p>
      </div>

      {tapes.length === 0 ? (
        <div className="text-center mt-16">
          <div className="inline-block retro-border p-8 max-w-md">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-brand-accent font-pixel text-sm mb-3">NO ENTRIES</h3>
            <p className="text-gray-500 text-sm font-mono leading-relaxed">
              Create a tape first to start your listening journal.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center px-4">
          {tapes.map((tape, i) => (
            <motion.div
              key={tape.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
              className="w-full flex justify-center"
            >
              <MemoryCard tape={tape} updateTape={updateTape} />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatedPage>
  );
};
