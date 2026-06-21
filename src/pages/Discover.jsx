import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTape } from '../context/TapeContext';
import { AnimatedPage } from '../components/AnimatedPage';
import { Search, Loader2, Plus, Music, Check, Play, Square, Upload, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';

const COLORS = [
  { name: 'Forest', bg: '#1a472a', label: '#5DCAA5' },
  { name: 'Purple', bg: '#3d2a99', label: '#CECBF6' },
  { name: 'Coral', bg: '#7a2e15', label: '#F5C4B3' },
  { name: 'Ocean', bg: '#0f4a85', label: '#B5D4F4' },
  { name: 'Amber', bg: '#633806', label: '#FAC775' },
  { name: 'Pink', bg: '#72243E', label: '#F4C0D1' },
  { name: 'Slate', bg: '#444441', label: '#D3D1C7' },
];

const MOODS = [
  { name: 'Study', emoji: '📚', tags: 'lofi', colorIdx: 1, sticker: '🌙', gradient: 'from-purple-900/20 to-blue-900/20' },
  { name: 'Chill', emoji: '🌊', tags: 'chillout', colorIdx: 3, sticker: '🌊', gradient: 'from-cyan-900/20 to-teal-900/20' },
  { name: 'Gym', emoji: '🔥', tags: 'workout', colorIdx: 2, sticker: '🔥', gradient: 'from-red-900/20 to-orange-900/20' },
  { name: 'Travel', emoji: '✨', tags: 'indie folk', colorIdx: 4, sticker: '✨', gradient: 'from-amber-900/20 to-yellow-900/20' },
];

export const Discover = () => {
  const { tapes, addSongToTape, searchTracks: itunesSearch, audiusSearch, searchByTags, stopPlayback, addTape } = useTape();
  const navigate = useNavigate();

  const [provider, setProvider] = useState('audius'); // 'audius', 'itunes', 'local'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [moodLoading, setMoodLoading] = useState(null);
  const [selectedTape, setSelectedTape] = useState('');
  const [addedTracks, setAddedTracks] = useState(new Set());
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  
  // Local Upload State
  const [localFile, setLocalFile] = useState(null);
  const [localTitle, setLocalTitle] = useState('');
  const [localArtist, setLocalArtist] = useState('');
  const fileInputRef = useRef(null);

  // Preview state
  const [previewingId, setPreviewingId] = useState(null);
  const previewSound = useRef(null);

  useEffect(() => {
    return () => {
      if (previewSound.current) {
        previewSound.current.unload();
      }
    };
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Auto-select the first available tape if none is selected
  useEffect(() => {
    if (tapes && tapes.length > 0 && !selectedTape) {
      setSelectedTape(tapes[0].id || tapes[0]._id);
    }
  }, [tapes, selectedTape]);

  const togglePreview = (track) => {
    stopPlayback();

    if (previewingId === track.jamendoId) {
      if (previewSound.current) {
        previewSound.current.stop();
        previewSound.current.unload();
        previewSound.current = null;
      }
      setPreviewingId(null);
      return;
    }

    if (previewSound.current) {
      previewSound.current.stop();
      previewSound.current.unload();
    }

    setPreviewingId(track.jamendoId);
    previewSound.current = new Howl({
      src: [track.audioUrl],
      html5: true,
      format: ['mp3', 'm4a', 'aac', 'wav'],
      onend: () => setPreviewingId(null),
      onloaderror: () => {
        showNotification("Preview unavailable for this track");
        setPreviewingId(null);
      }
    });
    previewSound.current.play();
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      let tracks = [];
      if (provider === 'itunes') {
        tracks = await itunesSearch(query);
      } else if (provider === 'audius') {
        tracks = await audiusSearch(query);
      }
      setResults(tracks);
      if (tracks.length === 0) setError('No tracks found. Try a different search.');
    } catch (err) {
      console.error(err);
      setError('Search failed. Check your connection.');
    }
    setLoading(false);
  };

  const handleMoodClick = async (mood) => {
    setMoodLoading(mood.name);
    setError('');
    try {
      const tracks = await searchByTags(mood.tags, 10);
      if (tracks.length > 0) {
        const mid = Math.ceil(tracks.length / 2);
        addTape({
          name: `${mood.name} Vibes`,
          color: COLORS[mood.colorIdx].bg,
          labelColor: COLORS[mood.colorIdx].label,
          sticker: mood.sticker,
          sideA: tracks.slice(0, mid),
          sideB: tracks.slice(mid),
        });
        navigate('/');
      } else {
        setError(`No tracks found for "${mood.name}" mood.`);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate mood tape.');
    }
    setMoodLoading(null);
  };

  const handleLocalFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLocalFile(file);
      // Try to clean up filename for title
      let name = file.name.replace(/\.[^/.]+$/, "");
      setLocalTitle(name);
      setLocalArtist('Unknown Artist');
    }
  };

  const handleAddLocalTrack = (e) => {
    e.preventDefault();
    if (!localFile || !localTitle) return;

    const newTrack = {
      jamendoId: `local-${Date.now()}`,
      title: localTitle,
      artist: localArtist || 'Unknown Artist',
      duration: 0, // We'd need to parse the audio to get actual duration, default to 0
      audioUrl: '', // URL will be generated from blob on play
      blob: localFile,
      albumArt: '', 
    };

    addToTape(newTrack, e);
    
    // Reset form
    setLocalFile(null);
    setLocalTitle('');
    setLocalArtist('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addToTape = (track, e) => {
    e?.stopPropagation(); 
    
    if (!selectedTape) {
      showNotification("Please select a target tape first!");
      return;
    }
    
    const tape = tapes.find(t => t.id === selectedTape);
    if (!tape) return;

    if (tape.sideA.length < 5) {
      addSongToTape(tape.id, 'A', track);
      showNotification(`Added to ${tape.name} (Side A)`);
    } else if (tape.sideB.length < 5) {
      addSongToTape(tape.id, 'B', track);
      showNotification(`Added to ${tape.name} (Side B)`);
    } else {
      showNotification(`Tape "${tape.name}" is full (10 tracks max)!`);
      return;
    }
    setAddedTracks(prev => new Set(prev).add(track.jamendoId));
  };

  return (
    <AnimatedPage>
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-20 left-1/2 z-50 bg-brand-accent text-black px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(93,202,165,0.4)] tracking-wide font-mono text-sm"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-10 pt-4">
        <h1 className="text-2xl font-pixel glow-text mb-2">DISCOVER</h1>
        <p className="text-gray-500 font-mono text-xs tracking-widest">FIND MUSIC • BUILD MIXTAPES</p>
      </div>

      {/* ── Mood Generator ── */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="led-dot" />
          <h2 className="text-sm font-mono text-brand-accent tracking-[0.2em]">AI MOOD GENERATOR</h2>
          <div className="flex-1 h-px bg-[#222]" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MOODS.map((mood, i) => (
            <motion.button
              key={mood.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleMoodClick(mood)}
              disabled={moodLoading !== null}
              className={`relative p-8 bg-gradient-to-br ${mood.gradient} border border-[#333] hover:border-brand-accent/50 rounded-xl flex flex-col items-center justify-center gap-3 group transition-all duration-300 overflow-hidden`}
            >
              {moodLoading === mood.name ? (
                <Loader2 className="animate-spin text-brand-accent" size={32} />
              ) : (
                <>
                  <span className="text-4xl group-hover:scale-125 transition-transform duration-300">{mood.emoji}</span>
                  <span className="text-xs font-mono font-bold text-gray-300 group-hover:text-white tracking-[0.2em]">{mood.name.toUpperCase()}</span>
                </>
              )}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-brand-accent/5" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── Search Section ── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="led-dot" />
          <h2 className="text-sm font-mono text-brand-accent tracking-[0.2em]">ADD TRACKS</h2>
          <div className="flex-1 h-px bg-[#222]" />

          {tapes.length > 0 && (
            <select
              value={selectedTape}
              onChange={(e) => setSelectedTape(e.target.value)}
              className="bg-[#111] border border-[#333] text-xs p-2 rounded text-gray-400 outline-none focus:border-brand-accent font-mono transition-colors"
            >
              <option value="" disabled>TARGET TAPE...</option>
              {tapes.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.sideA.length + t.sideB.length}/10)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Source Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#222] pb-2">
          {[
            { id: 'audius', label: 'AUDIUS (FREE FULL SONGS)' },
            { id: 'itunes', label: 'ITUNES (PREVIEWS)' },
            { id: 'local', label: 'LOCAL MP3' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setProvider(tab.id);
                setResults([]);
                setQuery('');
              }}
              className={`px-4 py-2 text-xs font-mono tracking-wider transition-colors border-b-2 ${
                provider === tab.id 
                ? 'text-brand-accent border-brand-accent' 
                : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {provider === 'local' ? (
          // ── Local Upload Form ──
          <div className="bg-[#111] border border-dashed border-[#444] rounded-xl p-8">
            <form onSubmit={handleAddLocalTrack} className="max-w-md mx-auto flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center p-8 bg-[#0a0a0a] rounded-lg border border-[#333] mb-4">
                <Upload className="text-gray-500 mb-2" size={32} />
                <label className="text-sm font-mono text-brand-accent cursor-pointer hover:underline mb-2">
                  Browse Files
                  <input 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleLocalFileChange} 
                  />
                </label>
                <span className="text-xs text-gray-600 font-mono">
                  {localFile ? localFile.name : 'No file selected (.mp3, .wav)'}
                </span>
              </div>

              {localFile && (
                <>
                  <div>
                    <label className="text-xs font-mono text-gray-500 mb-1 block">TRACK TITLE</label>
                    <input
                      type="text"
                      required
                      value={localTitle}
                      onChange={(e) => setLocalTitle(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#333] p-3 rounded-lg text-white focus:border-brand-accent outline-none text-sm font-mono transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-gray-500 mb-1 block">ARTIST</label>
                    <input
                      type="text"
                      value={localArtist}
                      onChange={(e) => setLocalArtist(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#333] p-3 rounded-lg text-white focus:border-brand-accent outline-none text-sm font-mono transition-colors"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 bg-brand-accent text-black p-4 rounded-lg font-bold text-sm tracking-wider hover:shadow-[0_0_16px_rgba(93,202,165,0.4)] transition-shadow w-full flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    ADD TO TAPE
                  </motion.button>
                </>
              )}
            </form>
          </div>
        ) : (
          // ── API Search Form ──
          <>
            <form onSubmit={handleSearch} className="flex gap-2 mb-8">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={provider === 'audius' ? "Search independent artists on Audius..." : "Search iTunes catalog..."}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] p-4 pl-12 rounded-lg text-white focus:border-brand-accent outline-none text-sm font-mono transition-colors"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-brand-accent text-black px-8 rounded-lg font-bold text-sm tracking-wider hover:shadow-[0_0_16px_rgba(93,202,165,0.4)] transition-shadow"
              >
                SEARCH
              </motion.button>
            </form>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 border border-red-900/50 bg-red-900/10 rounded-lg text-red-400 text-sm font-mono text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="animate-spin text-brand-accent" size={40} />
                <span className="text-xs font-mono text-gray-500 tracking-widest">SEARCHING {provider.toUpperCase()}...</span>
              </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-gray-600 mb-4 tracking-widest">{results.length} RESULTS</div>
                {results.map((track, i) => {
                  const isAdded = addedTracks.has(track.jamendoId);
                  const isPreviewing = previewingId === track.jamendoId;
                  
                  return (
                    <motion.div
                      key={track.jamendoId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => togglePreview(track)}
                      className={`bg-[#111] p-3 rounded-lg border flex items-center gap-4 cursor-pointer transition-all duration-200 group ${
                        isPreviewing ? 'border-brand-accent bg-brand-accent/5' : 'border-[#222] hover:border-[#444]'
                      }`}
                    >
                      {/* Album Art with Play Overlay */}
                      <div className="relative w-14 h-14 rounded overflow-hidden shadow-lg flex-shrink-0">
                        {track.albumArt ? (
                          <img src={track.albumArt} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                            <Music className="text-gray-600" size={20} />
                          </div>
                        )}
                        
                        {/* Play/Pause Overlay */}
                        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${isPreviewing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {isPreviewing ? (
                            <Square className="text-brand-accent" fill="currentColor" size={24} />
                          ) : (
                            <Play className="text-white ml-1" fill="currentColor" size={24} />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm truncate transition-colors ${isPreviewing ? 'text-brand-accent' : 'group-hover:text-brand-accent'}`}>
                          {track.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{track.artist}</div>
                      </div>
                      
                      {/* Equalizer animation when previewing */}
                      {isPreviewing && (
                        <div className="flex gap-[2px] items-end h-4 mr-2">
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

                      <div className="text-[10px] font-mono text-gray-600 mr-2">
                        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                      </div>
                      
                      {provider === 'itunes' && (
                        <motion.a
                          href={`https://www.google.com/search?q=${encodeURIComponent(track.artist + ' ' + track.title + ' download mp3')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-9 h-9 rounded-full border border-[#444] text-gray-500 hover:text-brand-accent hover:border-brand-accent flex items-center justify-center transition-all duration-200 bg-[#111]"
                          title="Search for full MP3"
                        >
                          <Download size={14} />
                        </motion.a>
                      )}

                      <motion.button
                        onClick={(e) => addToTape(track, e)}
                        disabled={isAdded}
                        whileHover={!isAdded ? { scale: 1.1 } : {}}
                        whileTap={!isAdded ? { scale: 0.9 } : {}}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${
                          isAdded
                            ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
                            : 'border-[#444] text-gray-500 hover:text-brand-accent hover:border-brand-accent hover:shadow-[0_0_8px_rgba(93,202,165,0.3)] bg-[#111]'
                        }`}
                        title={isAdded ? 'Added!' : 'Add to tape'}
                      >
                        {isAdded ? <Check size={16} /> : <Plus size={16} />}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* No tapes hint */}
        {tapes.length === 0 && (
          <div className="text-center mt-8 p-6 border border-dashed border-[#333] rounded-xl">
            <p className="text-gray-500 text-sm font-mono">
              💡 Create a tape first, then come back here to fill it with music!
            </p>
            <button
              onClick={() => navigate('/create')}
              className="mt-4 px-6 py-2 border border-brand-accent text-brand-accent text-xs font-mono tracking-wider rounded hover:bg-brand-accent hover:text-black transition-colors"
            >
              CREATE TAPE →
            </button>
          </div>
        )}
      </section>
    </AnimatedPage>
  );
};
