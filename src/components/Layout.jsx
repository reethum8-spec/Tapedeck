import { Link, useLocation } from 'react-router-dom';
import { useTape } from '../context/TapeContext';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, SkipForward, SkipBack, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MusicPet } from './MusicPet';

export const Layout = ({ children }) => {
  const {
    currentTape, currentTrackIndex, currentSide,
    isPlaying, progress, duration, nowPlayingVisible,
    togglePlayPause, playNextTrack, playPrevTrack, seekTo, formatTime, stopPlayback
  } = useTape();
  const { logout } = useAuth();
  const location = useLocation();

  const currentTracks = currentTape ? (currentSide === 'A' ? currentTape.sideA : currentTape.sideB) : [];
  const currentTrack = currentTracks[currentTrackIndex];

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    seekTo(x / rect.width);
  };

  const isAuthRoute = location.pathname === '/auth' || location.pathname === '/onboarding';

  return (
    <div className="min-h-screen bg-brand-bg text-white pb-28 font-sans relative">
      {/* Scanline overlay is applied via CSS ::after on body */}

      {/* ── Header ── */}
      {!isAuthRoute && (
      <header className="sticky top-0 z-40 backdrop-blur-md bg-brand-bg/80 border-b border-[#222]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.6)] group-hover:shadow-[0_0_14px_rgba(255,0,0,0.8)] transition-shadow" />
            <span className="text-xl font-pixel tracking-tight">
              <span className="text-brand-accent glow-text">TAPE</span>
              <span className="text-white">DECK</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {[
              { to: '/', label: 'SHELF' },
              { to: '/discover', label: 'DISCOVER' },
              { to: '/journal', label: 'JOURNAL' },
              { to: '/profile', label: 'PROFILE' },
              { to: '/pet-center', label: 'PETS' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-[10px] sm:text-xs font-mono tracking-widest transition-colors duration-200 rounded ${
                  location.pathname === link.to
                    ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/30'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/create"
              className="hidden sm:inline-block ml-2 px-4 py-2 text-xs font-mono tracking-widest border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-black transition-colors duration-200 rounded"
            >
              + NEW TAPE
            </Link>
            <button
              onClick={logout}
              className="ml-2 px-3 py-2 text-xs font-mono tracking-widest text-gray-500 hover:text-red-400 transition-colors"
            >
              LOGOUT
            </button>
          </nav>
        </div>
      </header>
      )}

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        {!isAuthRoute && <MusicPet />}
        {children}
      </main>

      {/* ── Now Playing Bar ── */}
      {!isAuthRoute && (
      <AnimatePresence>
        {nowPlayingVisible && currentTape && currentTrack && (
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#111] border-t border-[#333] backdrop-blur-md"
          >
            {/* Clickable progress bar on top edge */}
            <div
              className="h-1.5 bg-[#222] cursor-pointer group relative"
              onClick={handleProgressClick}
            >
              <motion.div
                className="h-full bg-brand-accent relative"
                style={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.1 }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(93,202,165,0.6)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>

            <div className="px-4 py-3 flex items-center gap-4">
              {/* Track info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {currentTrack.albumArt ? (
                  <motion.img
                    src={currentTrack.albumArt}
                    alt=""
                    className="w-12 h-12 rounded shadow-lg object-cover"
                    animate={isPlaying ? { rotate: [0, 360] } : {}}
                    transition={isPlaying ? { repeat: Infinity, duration: 8, ease: 'linear' } : {}}
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#222] rounded flex items-center justify-center text-lg">🎵</div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate">{currentTrack.title}</div>
                  <div className="text-xs text-gray-500 truncate">{currentTrack.artist}</div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button onClick={playPrevTrack} className="text-gray-500 hover:text-white transition-colors">
                  <SkipBack size={18} />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="w-10 h-10 rounded-full bg-brand-accent text-black flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_12px_rgba(93,202,165,0.4)]"
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>
                <button onClick={playNextTrack} className="text-gray-500 hover:text-white transition-colors">
                  <SkipForward size={18} />
                </button>
              </div>

              {/* Time + Side indicator */}
              <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="text-xs font-mono text-gray-500">
                  {formatTime(progress * duration)} / {formatTime(duration)}
                </span>
                <div className="text-[10px] font-pixel text-brand-accent border border-brand-accent/30 px-2 py-1 rounded bg-brand-accent/5">
                  SIDE {currentSide}
                </div>
                <Link
                  to={`/player/${currentTape.id}`}
                  className="text-[10px] font-mono text-gray-500 hover:text-brand-accent transition-colors uppercase tracking-wider"
                >
                  OPEN DECK →
                </Link>
                <button 
                  onClick={stopPlayback}
                  className="text-gray-500 hover:text-white transition-colors ml-2"
                  title="Close Player"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      )}
    </div>
  );
};
