import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { v4 as uuidv4 } from 'uuid';
import { tapeService } from '../services/tapeService';

const TapeContext = createContext();

export const useTape = () => useContext(TapeContext);

export const TapeProvider = ({ children }) => {
  const [tapes, setTapes] = useState([]);
  const [dbLoaded, setDbLoaded] = useState(false);

  const [currentTape, setCurrentTape] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSide, setCurrentSide] = useState('A');
  const [nowPlayingVisible, setNowPlayingVisible] = useState(false);
  
  const [isLooping, setIsLooping] = useState(false);
  const isLoopingRef = useRef(isLooping);

  const toggleLoop = () => {
    setIsLooping(prev => {
      const next = !prev;
      isLoopingRef.current = next;
      return next;
    });
  };
  
  const soundRef = useRef(null);
  const activeBlobUrlRef = useRef(null); // Track active object URL to revoke it later

  // 1. Initialize DB and load tapes
  useEffect(() => {
    const loadTapes = async () => {
      try {
        await tapeService.initDB();
        const loadedTapes = await tapeService.getTapes();
        setTapes(loadedTapes);
      } catch (err) {
        console.error("Error loading tapes:", err);
      } finally {
        setDbLoaded(true);
      }
    };
    loadTapes();
  }, []);

  // 2. Save tapes whenever they change (only after initial load)
  useEffect(() => {
    if (dbLoaded) {
      tapeService.saveTapes(tapes);
    }
  }, [tapes, dbLoaded]);

  // Audio Progress Loop
  useEffect(() => {
    let animationFrame;
    const updateProgress = () => {
      if (soundRef.current && isPlaying) {
        const seek = soundRef.current.seek();
        const dur = soundRef.current.duration();
        if (dur > 0) {
          setProgress(seek / dur);
          setDuration(dur);
        }
      }
      animationFrame = requestAnimationFrame(updateProgress);
    };

    if (isPlaying) {
      animationFrame = requestAnimationFrame(updateProgress);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  const addTape = async (tape) => {
    try {
      const savedTape = await tapeService.createTape(tape);
      setTapes(prev => [...prev, savedTape]);
      return savedTape;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const updateTape = async (id, updates) => {
    setTapes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    try {
      await tapeService.updateTape(id, updates);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTape = async (id) => {
    setTapes(prev => prev.filter(t => t.id !== id));
    if (currentTape?.id === id) {
      stopPlayback();
    }
    try {
      await tapeService.deleteTape(id);
    } catch (err) {
      console.error(err);
    }
  };

  const addSongToTape = async (tapeId, side, track) => {
    try {
      const songData = {
        playlistId: tapeId,
        side,
        jamendoId: track.jamendoId,
        title: track.title,
        artist: track.artist,
        duration: track.duration || 0,
        audioUrl: track.audioUrl || '',
        coverUrl: track.albumArt || '',
      };
      const savedSong = await tapeService.addSong(songData);
      
      setTapes(prev => prev.map(t => {
        if (t.id === tapeId) {
          return { ...t, [side === 'A' ? 'sideA' : 'sideB']: [...t[side === 'A' ? 'sideA' : 'sideB'], savedSong] };
        }
        return t;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const removeSongFromTape = async (tapeId, side, trackIndex) => {
    let songId = null;
    setTapes(prev => prev.map(t => {
      if (t.id === tapeId) {
        const targetSide = side === 'A' ? 'sideA' : 'sideB';
        const updatedSide = [...t[targetSide]];
        songId = updatedSide[trackIndex]._id || updatedSide[trackIndex].id;
        updatedSide.splice(trackIndex, 1);
        return { ...t, [targetSide]: updatedSide };
      }
      return t;
    }));
    
    if (songId) {
      try {
        await tapeService.deleteSong(songId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const updateTrackMemory = async (tapeId, side, trackIndex, memory) => {
    let songId = null;
    setTapes(prev => prev.map(t => {
      if (t.id === tapeId) {
        const updatedSide = [...t[side]];
        songId = updatedSide[trackIndex]._id || updatedSide[trackIndex].id;
        updatedSide[trackIndex] = { ...updatedSide[trackIndex], memory };
        return { ...t, [side]: updatedSide };
      }
      return t;
    }));
    if (songId) {
      try {
        await tapeService.updateSong(songId, { memory });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const stopPlayback = () => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.unload();
      soundRef.current = null;
    }
    
    // Revoke temporary blob URL if it exists to free memory
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setNowPlayingVisible(false);
    setCurrentTape(null);
  };

  const playTrack = useCallback((tape, trackIndex, side = 'A') => {
    const tracks = side === 'A' ? tape.sideA : tape.sideB;
    const track = tracks[trackIndex];
    
    if (!track) return;

    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.unload();
    }

    // Revoke old blob URL
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }

    setCurrentTape(tape);
    setCurrentTrackIndex(trackIndex);
    setCurrentSide(side);
    setProgress(0);
    setNowPlayingVisible(true);

    // If it's a local file blob, create an Object URL
    let finalAudioUrl = track.audioUrl;
    if (track.blob) {
      finalAudioUrl = URL.createObjectURL(track.blob);
      activeBlobUrlRef.current = finalAudioUrl;
    }

    // Use a ref so the callback always sees the latest value
    const currentLooping = isLoopingRef.current;

    const sound = new Howl({
      src: [finalAudioUrl],
      html5: true,
      format: ['mp3', 'm4a', 'aac', 'wav'],
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onend: () => {
        if (isLoopingRef.current) {
          // Replay the exact same track
          playTrack(tape, trackIndex, side);
        } else {
          const nextIdx = trackIndex + 1;
          if (nextIdx < tracks.length) {
            playTrack(tape, nextIdx, side);
          } else {
            setIsPlaying(false);
            setProgress(0);
          }
        }
      },
      onloaderror: (id, err) => {
        console.error("Error loading track:", err);
        setIsPlaying(false);
      },
      onplayerror: () => {
        sound.once('unlock', () => sound.play());
      }
    });

    soundRef.current = sound;
    sound.play();
  }, []);

  const togglePlayPause = () => {
    if (!soundRef.current) {
      if (currentTape && currentTrackIndex !== null) {
        playTrack(currentTape, currentTrackIndex, currentSide);
      }
      return;
    }
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const playNextTrack = useCallback(() => {
    if (!currentTape) return;
    const tracks = currentSide === 'A' ? currentTape.sideA : currentTape.sideB;
    if (currentTrackIndex < tracks.length - 1) {
      playTrack(currentTape, currentTrackIndex + 1, currentSide);
    }
  }, [currentTape, currentTrackIndex, currentSide, playTrack]);

  const playPrevTrack = useCallback(() => {
    if (!currentTape) return;
    if (soundRef.current && soundRef.current.seek() > 3) {
      soundRef.current.seek(0);
      setProgress(0);
    } else if (currentTrackIndex > 0) {
      playTrack(currentTape, currentTrackIndex - 1, currentSide);
    }
  }, [currentTape, currentTrackIndex, currentSide, playTrack]);

  const seekTo = (percent) => {
    if (soundRef.current) {
      const dur = soundRef.current.duration();
      soundRef.current.seek(dur * percent);
      setProgress(percent);
    }
  };

  const getFrequencyData = () => {
    // Generate an aesthetic pseudo-random frequency array
    // This avoids cross-origin Web Audio API taint issues while still looking great
    const data = new Uint8Array(32);
    if (!isPlaying) return data;
    
    for (let i = 0; i < data.length; i++) {
      const time = Date.now() / 1000;
      // Create a nice rhythmic pulse
      const beat = Math.sin(time * Math.PI * 2) > 0.8 ? 100 : 0;
      const base = Math.sin(time * 4 + i) * 50 + 50; 
      const noise = Math.random() * 80;
      
      // Bass frequencies (lower index) bounce higher
      const multiplier = i < 8 ? 1.5 : 0.8;
      data[i] = Math.min(255, (base + noise + beat) * multiplier);
    }
    return data;
  };

  // ═══════════════════════════════════════════════════════
  // iTUNES API
  // ═══════════════════════════════════════════════════════
  const searchTracks = async (query) => {
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=20`);
      if (!res.ok) throw new Error(`iTunes API error: ${res.status}`);
      const data = await res.json();
      if (!data.results) return [];
      
      return data.results.map(t => ({
        jamendoId: String(t.trackId),
        title: t.trackName,
        artist: t.artistName,
        duration: Math.floor((t.trackTimeMillis || 30000) / 1000),
        audioUrl: t.previewUrl,
        albumArt: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '300x300bb') : '',
      }));
    } catch (err) {
      console.error("Search failed:", err);
      throw err;
    }
  };

  const searchByTags = async (genre, limit = 10) => {
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(genre)}&entity=song&limit=${limit}`);
      if (!res.ok) throw new Error(`iTunes API error: ${res.status}`);
      const data = await res.json();
      if (!data.results) return [];
      
      return data.results.map(t => ({
        jamendoId: String(t.trackId),
        title: t.trackName,
        artist: t.artistName,
        duration: Math.floor((t.trackTimeMillis || 30000) / 1000),
        audioUrl: t.previewUrl,
        albumArt: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '300x300bb') : '',
      }));
    } catch (err) {
      console.error("Genre search failed:", err);
      throw err;
    }
  };

  // ═══════════════════════════════════════════════════════
  // AUDIUS API (Full Free Songs)
  // ═══════════════════════════════════════════════════════
  const audiusSearch = async (query) => {
    try {
      const res = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=tapedeck`);
      if (!res.ok) throw new Error(`Audius API error: ${res.status}`);
      const data = await res.json();
      if (!data.data) return [];
      
      return data.data.map(t => ({
        jamendoId: `audius-${t.id}`,
        title: t.title,
        artist: t.user?.name || 'Unknown',
        duration: t.duration || 0,
        audioUrl: `https://discoveryprovider.audius.co/v1/tracks/${t.id}/stream?app_name=tapedeck`,
        albumArt: t.artwork ? (t.artwork['480x480'] || t.artwork['150x150']) : '',
      }));
    } catch (err) {
      console.error("Audius search failed:", err);
      throw err;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Only render children when DB has successfully loaded old tapes
  if (!dbLoaded) return null;

  return (
    <TapeContext.Provider value={{
      tapes,
      currentTape,
      currentTrackIndex,
      currentSide,
      isPlaying,
      progress,
      duration,
      nowPlayingVisible,
      isLooping,
      addTape,
      updateTape,
      deleteTape,
      updateTrackMemory,
      addSongToTape,
      removeSongFromTape,
      playTrack,
      togglePlayPause,
      toggleLoop,
      playNextTrack,
      playPrevTrack,
      seekTo,
      stopPlayback,
      getFrequencyData,
      searchTracks,
      searchByTags,
      audiusSearch,
      formatTime,
    }}>
      {children}
    </TapeContext.Provider>
  );
};
