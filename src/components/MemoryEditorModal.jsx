import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, StickyNote } from 'lucide-react';

export const MemoryEditorModal = ({ isOpen, onClose, onSave, initialMemory }) => {
  const [type, setType] = useState(initialMemory?.type || 'note');
  const [text, setText] = useState(initialMemory?.text || '');
  const [imageUrl, setImageUrl] = useState(initialMemory?.imageUrl || '');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({ type, text, imageUrl: type === 'photo' ? imageUrl : undefined });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-brand-bg retro-border p-6 relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-pixel glow-text mb-6">ATTACH MEMORY</h2>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setType('note')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 border font-mono text-sm transition-colors ${
                type === 'note' ? 'border-[#fef08a] text-[#fef08a] bg-[#fef08a]/10' : 'border-[#333] text-gray-500 hover:border-gray-400'
              }`}
            >
              <StickyNote size={16} /> STICKY NOTE
            </button>
            <button
              onClick={() => setType('photo')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 border font-mono text-sm transition-colors ${
                type === 'photo' ? 'border-white text-white bg-white/10' : 'border-[#333] text-gray-500 hover:border-gray-400'
              }`}
            >
              <ImageIcon size={16} /> POLAROID
            </button>
          </div>

          {type === 'photo' && (
            <div className="mb-4">
              <label className="block text-[10px] text-gray-500 mb-2 font-mono tracking-[0.2em]">PHOTO URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#111] border border-[#333] p-3 text-white font-mono text-sm outline-none focus:border-brand-accent"
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-[10px] text-gray-500 mb-2 font-mono tracking-[0.2em]">
              {type === 'photo' ? 'CAPTION' : 'NOTE TEXT'}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write something memorable..."
              className="w-full bg-[#111] border border-[#333] p-3 text-white font-mono text-sm outline-none focus:border-brand-accent resize-none h-24"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!text.trim() || (type === 'photo' && !imageUrl.trim())}
            className="w-full py-3 bg-brand-accent text-black font-bold font-mono tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
          >
            SAVE MEMORY
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
