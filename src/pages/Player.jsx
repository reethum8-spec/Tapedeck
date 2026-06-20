import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTape } from '../context/TapeContext';
import { CassetteCanvas } from '../components/CassetteCanvas';
import { AnimatedPage } from '../components/AnimatedPage';
import { Play, Pause, SkipBack, SkipForward, FastForward, Rewind, Trash2, Repeat, Pen, Lock, Image as ImageIcon, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Visualizer } from '../components/Visualizer';
import { MemoryEditorModal } from '../components/MemoryEditorModal';
import { MemoryCard } from '../components/MemoryCard';
import { ShareModal } from '../components/ShareModal';

export const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    tapes, currentTape, currentTrackIndex, currentSide,
    isPlaying, progress, duration, isLooping,
    playTrack, togglePlayPause, toggleLoop, playNextTrack, playPrevTrack,
    seekTo, deleteTape, updateTape, updateTrackMemory, formatTime,
  } = useTape();

  const [activeSide, setActiveSide] = useState('A');
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [editingTrackIndex, setEditingTrackIndex] = useState(null);
  const tape = tapes.find(t => t.id === id);

  const handleDeleteTrack = (e, trackIndex) => {
    e.stopPropagation();
    if (window.confirm('Delete this track from the tape?')) {
      const sideKey = activeSide === 'A' ? 'sideA' : 'sideB';
      const newTracks = tape[sideKey].filter((_, idx) => idx !== trackIndex);
      updateTape(tape.id, { [sideKey]: newTracks });
    }
  };

  useEffect(() => {
    if (currentTape?.id === id) {
      setActiveSide(currentSide);
    }
  }, [currentTape, currentSide, id]);

  if (!tape) {
    return (
      <AnimatedPage>
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📼</div>
          <div className="text-xl font-pixel text-gray-500">TAPE NOT FOUND</div>
          <button onClick={() => navigate('/')} className="mt-6 text-brand-accent font-mono text-sm underline hover:text-white">
            BACK TO SHELF
          </button>
        </div>
      </AnimatedPage>
    );
  }

  if (tape.lockedUntil && new Date(tape.lockedUntil) > new Date()) {
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

  const tracks = activeSide === 'A' ? tape.sideA : tape.sideB;
  const isThisTape = currentTape?.id === id && currentSide === activeSide;

  const handleTrackClick = (index) => playTrack(tape, index, activeSide);

  const handleSeek = (dir) => {
    if (isThisTape) {
      seekTo(dir === 'fwd' ? Math.min(progress + 0.05, 1) : Math.max(progress - 0.05, 0));
    }
  };

  const handleDelete = () => {
    if (confirm('Erase this tape permanently?')) {
      deleteTape(tape.id);
      navigate('/');
    }
  };

  const handleProgressClick = (e) => {
    if (!isThisTape) return;
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
  };

  return (
    <AnimatedPage>
      <div className="max-w-6xl mx-auto pt-4 flex flex-col lg:flex-row gap-10 items-start px-4">
        {/* ── Tape Deck Left Column ── */}
        <div className="flex-1 w-full max-w-3xl">
        <div className="retro-border p-1 md:p-2 relative overflow-hidden">
          {/* Deck chrome strip */}
          <div className="chrome-strip mb-2" />

          {/* Deck label */}
          <div className="flex items-center justify-between px-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="led-dot" />
              <span className="text-[10px] font-mono text-gray-600 tracking-[0.3em]">STEREO CASSETTE DECK</span>
            </div>
            <span className="text-[10px] font-pixel text-gray-600">TAPEDECK™</span>
          </div>

          {/* Cassette Slot with Visualizer */}
          <div id="cassette-slot" className="bg-[#080808] rounded-xl p-6 md:p-10 mx-2 border border-[#222] shadow-[inset_0_8px_24px_rgba(0,0,0,0.9)] flex justify-center mb-6 relative overflow-hidden">
            <Visualizer isPlaying={isThisTape && isPlaying} />
            <motion.div layoutId={`cassette-${tape.id}`} className="w-full max-w-[420px] relative z-10">
              <CassetteCanvas
                tape={tape}
                isPlaying={isThisTape && isPlaying}
                progress={isThisTape ? progress : 0}
              />
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="mx-4 mb-6">
            <div
              className="h-2 bg-[#111] rounded-full cursor-pointer group relative border border-[#222]"
              onClick={handleProgressClick}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-brand-accent/80 to-brand-accent rounded-full relative"
                style={{ width: `${(isThisTape ? progress : 0) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-brand-accent shadow-[0_0_10px_rgba(93,202,165,0.6)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] font-mono text-gray-600">{formatTime(isThisTape ? progress * duration : 0)}</span>
              <span className="text-[10px] font-mono text-gray-600">{formatTime(isThisTape ? duration : 0)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={toggleLoop} 
                className={`deck-btn ${isLooping ? '!text-brand-accent !border-brand-accent bg-[#1a1a1a]' : ''}`}
                title="Toggle Loop"
              >
                <Repeat size={18} />
              </button>
              <button onClick={playPrevTrack} className="deck-btn"><SkipBack size={20} /></button>
              <button onClick={() => handleSeek('rev')} className="deck-btn"><Rewind size={20} /></button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (isThisTape) togglePlayPause();
                  else if (tracks.length > 0) playTrack(tape, 0, activeSide);
                }}
                className="deck-btn !w-14 !h-14 !bg-brand-accent !text-black !border-brand-accent hover:!bg-white hover:shadow-[0_0_20px_rgba(93,202,165,0.5)]"
              >
                {isThisTape && isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
              </motion.button>
              <button onClick={() => handleSeek('fwd')} className="deck-btn"><FastForward size={20} /></button>
              <button onClick={playNextTrack} className="deck-btn"><SkipForward size={20} /></button>
            </div>

            {/* Side Toggle */}
            <div className="flex items-center gap-1 border border-[#333] rounded-lg p-1 bg-[#0a0a0a]">
              {['A', 'B'].map(side => (
                <motion.button
                  key={side}
                  onClick={() => setActiveSide(side)}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-1.5 rounded-md font-mono text-xs transition-all duration-200 ${
                    activeSide === side
                      ? 'bg-brand-accent text-black font-bold shadow-[0_0_8px_rgba(93,202,165,0.3)]'
                      : 'text-gray-600 hover:text-white'
                  }`}
                >
                  SIDE {side}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="chrome-strip mt-2" />
        </div>

        {/* ── Track List ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="retro-border p-6 mt-6"
        >
          <div className="flex justify-between items-center mb-6 border-b border-[#222] pb-4">
            <div>
              <h2 className="text-xl font-bold">{tape.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="led-dot" />
                <span className="text-[10px] font-mono text-brand-accent tracking-[0.2em]">
                  SIDE {activeSide} • {tracks.length} TRACK{tracks.length !== 1 ? 'S' : ''}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShareModalOpen(true)}
                className="text-gray-600 hover:text-[#f1c40f] transition-colors p-2 rounded hover:bg-[#f1c40f]/10"
                title="Share Tape"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={() => navigate(`/edit/${tape.id}`)}
                className="text-gray-600 hover:text-brand-accent transition-colors p-2 rounded hover:bg-brand-accent/10"
                title="Edit Tape"
              >
                <Pen size={18} />
              </button>
              <button
                onClick={handleDelete}
                className="text-gray-600 hover:text-red-500 transition-colors p-2 rounded hover:bg-red-500/10"
                title="Erase Tape"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {tracks.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📼</div>
              <p className="text-gray-600 font-mono text-sm mb-2">THIS SIDE IS BLANK</p>
              <button
                onClick={() => navigate('/discover')}
                className="text-brand-accent font-mono text-xs underline hover:text-white transition-colors"
              >
                ADD TRACKS →
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {tracks.map((track, i) => {
                const isActive = isThisTape && currentTrackIndex === i;
                return (
                  <motion.div
                    key={`${track.jamendoId}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
                    onClick={() => handleTrackClick(i)}
                    whileHover={{ x: 4 }}
                    className={`group flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 border-l-4 ${
                      isActive
                        ? 'bg-brand-accent/5 border-brand-accent'
                        : 'hover:bg-white/[0.02] border-transparent'
                    }`}
                  >
                    {/* Track number or album art */}
                    {track.albumArt ? (
                      <img src={track.albumArt} alt="" className="w-10 h-10 rounded object-cover shadow" />
                    ) : (
                      <div className="w-10 h-10 bg-[#111] rounded flex items-center justify-center font-mono text-gray-600 text-xs">
                        {i + 1}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate transition-colors ${isActive ? 'text-brand-accent' : 'text-white'}`}>
                        {track.title}
                      </div>
                      <div className="text-xs text-gray-600 truncate">{track.artist}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-gray-600">
                        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTrackIndex(i);
                          setMemoryModalOpen(true);
                        }}
                        className={`transition-colors p-1 opacity-0 group-hover:opacity-100 ${track.memory ? 'text-brand-accent' : 'text-gray-600 hover:text-white'}`}
                        title={track.memory ? "Edit Memory" : "Add Memory"}
                      >
                        <ImageIcon size={14} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteTrack(e, i)}
                        className="text-gray-600 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        title="Delete Track"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Equalizer animation */}
                    {isActive && isPlaying && (
                      <div className="flex gap-[2px] items-end h-4">
                        {[0.6, 0.2, 0.4].map((delay, j) => (
                          <motion.div
                            key={j}
                            animate={{ height: ['30%', '100%', '30%'] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay }}
                            className="w-[3px] bg-brand-accent rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
        </div>

        {/* ── Scrapbook Right Column ── */}
        <div className="flex-1 w-full lg:sticky lg:top-24 mt-10 lg:mt-0 lg:max-w-md min-h-[400px]">
          <div className="retro-border p-6 h-full flex flex-col items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] to-brand-bg">
            <h3 className="absolute top-6 left-6 text-sm font-pixel text-gray-600 tracking-widest">SCRAPBOOK</h3>
            <div className="absolute top-6 right-6 text-sm font-mono text-brand-accent opacity-50">
              {isThisTape && isPlaying ? "PLAYING" : "STANDBY"}
            </div>
            
            <AnimatePresence mode="wait">
              {isThisTape && currentTape[currentSide][currentTrackIndex]?.memory ? (
                <motion.div
                  key={`${currentSide}-${currentTrackIndex}`}
                  initial={{ opacity: 0, scale: 0.8, rotate: Math.random() * 20 - 10 }}
                  animate={{ opacity: 1, scale: 1, rotate: Math.random() * 6 - 3 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="mt-10"
                >
                  <MemoryCard memory={currentTape[currentSide][currentTrackIndex].memory} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty-scrapbook"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-gray-600 mt-10"
                >
                  <div className="text-4xl mb-4 opacity-30">📸</div>
                  <p className="font-mono text-xs">NO MEMORY ATTACHED</p>
                  <p className="font-mono text-[10px] mt-2 opacity-50">Click the photo icon next to a track</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <MemoryEditorModal 
        isOpen={memoryModalOpen}
        onClose={() => setMemoryModalOpen(false)}
        initialMemory={editingTrackIndex !== null ? tracks[editingTrackIndex]?.memory : null}
        onSave={(memory) => {
          updateTrackMemory(tape.id, activeSide, editingTrackIndex, memory);
        }}
      />
      
      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
        tape={tape} 
      />
    </AnimatedPage>
  );
};
