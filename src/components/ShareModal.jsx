import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Users, Copy, Check } from 'lucide-react';
import LZString from 'lz-string';
import { useAuth } from '../context/AuthContext';

export const ShareModal = ({ isOpen, onClose, tape }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState('gift'); // 'gift' or 'collab'
  const [senderName, setSenderName] = useState(user?.tapeTag || '');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tape) return null;

  const handleGenerate = () => {
    // Check if the tape has a server ID (non-UUID length 24 hex)
    const isServerSynced = tape.id && !tape.isLocalOnly && !tape.id.includes('-');

    if (isServerSynced) {
      const link = `${window.location.origin}/?share=${tape.id}&mode=${mode}&sender=${encodeURIComponent(senderName || '')}`;
      setGeneratedLink(link);
    } else {
      // Fallback to long URL format if offline/unsynced
      const exportTape = { ...tape };
      delete exportTape.id;

      if (mode === 'gift') {
        exportTape.isGift = true;
        exportTape.isUnwrapped = false;
        exportTape.giftSender = senderName || 'A Friend';
      } else {
        exportTape.isCollaborative = true;
        exportTape.contributors = [user?.tapeTag || 'Unknown'];
      }

      const jsonString = JSON.stringify(exportTape);
      const compressed = LZString.compressToEncodedURIComponent(jsonString);
      const link = `${window.location.origin}/?import=${compressed}`;
      
      setGeneratedLink(link);
    }
    setCopied(false);
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAndClose = () => {
    setGeneratedLink('');
    setCopied(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-brand-bg retro-border p-6 relative border-t-4 border-t-brand-accent"
        >
          <button 
            onClick={resetAndClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-pixel glow-text mb-6">SHARE TAPE</h2>

          {!generatedLink ? (
            <>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setMode('gift')}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 border font-mono text-sm transition-colors ${
                    mode === 'gift' ? 'border-[#f1c40f] text-[#f1c40f] bg-[#f1c40f]/10' : 'border-[#333] text-gray-500 hover:border-gray-400'
                  }`}
                >
                  <Gift size={16} /> AS GIFT
                </button>
                <button
                  onClick={() => setMode('collab')}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 border font-mono text-sm transition-colors ${
                    mode === 'collab' ? 'border-brand-accent text-brand-accent bg-brand-accent/10' : 'border-[#333] text-gray-500 hover:border-gray-400'
                  }`}
                >
                  <Users size={16} /> COLLAB
                </button>
              </div>

              {mode === 'gift' && (
                <div className="mb-6">
                  <label className="block text-[10px] text-gray-500 mb-2 font-mono tracking-[0.2em]">FROM (YOUR NAME)</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full bg-[#111] border border-[#333] p-3 text-white font-mono text-sm outline-none focus:border-[#f1c40f] transition-colors"
                  />
                </div>
              )}

              <p className="font-mono text-xs text-gray-500 mb-6 leading-relaxed">
                {mode === 'gift' 
                  ? "They will receive this tape wrapped as a gift! They'll have to click to unwrap it." 
                  : "Send this link to a friend. When they open it, it will be added to their collection as a collaborative tape."}
              </p>

              <button
                onClick={handleGenerate}
                className={`w-full py-3 text-black font-bold font-mono tracking-widest hover:brightness-110 transition-all ${
                  mode === 'gift' ? 'bg-[#f1c40f]' : 'bg-brand-accent'
                }`}
              >
                CREATE LINK
              </button>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-brand-accent/20 flex items-center justify-center mx-auto mb-4 border border-brand-accent text-brand-accent">
                <Check size={32} />
              </div>
              <h3 className="font-pixel text-sm text-white mb-2">LINK READY!</h3>
              <p className="font-mono text-xs text-gray-400 mb-6">
                Copy this link and send it to your friend.
              </p>

              <div className="flex items-center gap-2 mb-6">
                <input 
                  type="text" 
                  readOnly 
                  value={generatedLink} 
                  className="flex-1 bg-[#111] border border-[#333] p-3 text-gray-400 font-mono text-xs outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className="p-3 bg-brand-accent text-black hover:bg-white transition-colors"
                  title="Copy Link"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>

              <button
                onClick={resetAndClose}
                className="text-gray-500 font-mono text-xs underline hover:text-white"
              >
                DONE
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
