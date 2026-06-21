import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { TapeProvider } from './context/TapeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { CreateTape } from './pages/CreateTape';
import { EditTape } from './pages/EditTape';
import { Discover } from './pages/Discover';
import { Player } from './pages/Player';
import { Journal } from './pages/Journal';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { Profile } from './pages/Profile';
import { PetCenter } from './pages/PetCenter';
import { Layout } from './components/Layout';
import { AnimatePresence, motion } from 'framer-motion';
import { useTape } from './context/TapeContext';
import { CassetteCanvas } from './components/CassetteCanvas';
import { Gift, Sparkles, X, Check } from 'lucide-react';
import LZString from 'lz-string';

const API_URL = import.meta.env.VITE_API_URL || 'https://tapedeck.onrender.com/api';

const ImportHandler = () => {
  const { addTape } = useTape();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [pendingTape, setPendingTape] = useState(null);
  const [importMode, setImportMode] = useState(''); // 'gift' or 'collab'
  const [sender, setSender] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Unwrapping animation states
  const [isUnwrapping, setIsUnwrapping] = useState(false);
  const [unwrapped, setUnwrapped] = useState(false);

  // 1. Capture pending import from URL immediately and save to sessionStorage to avoid losing it during auth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const importData = params.get('import');
    const shareId = params.get('share');
    
    if (importData || shareId) {
      sessionStorage.setItem('pending_import_query', location.search);
      // Clean URL immediately so redirects don't wipe it
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  // 2. Process the captured import once the user is authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const pendingQuery = sessionStorage.getItem('pending_import_query');
    if (!pendingQuery) return;

    // Clear it so we don't double-process
    sessionStorage.removeItem('pending_import_query');

    const params = new URLSearchParams(pendingQuery);
    const importData = params.get('import');
    const shareId = params.get('share');
    const shareMode = params.get('mode') || 'collab';
    const shareSender = params.get('sender') || 'A Friend';

    if (importData) {
      try {
        const jsonString = LZString.decompressFromEncodedURIComponent(importData);
        if (jsonString) {
          const tapeData = JSON.parse(jsonString);
          tapeData.id = crypto.randomUUID();
          
          setPendingTape(tapeData);
          setImportMode(tapeData.isGift ? 'gift' : 'collab');
          setSender(tapeData.giftSender || 'A Friend');
          setUnwrapped(false);
          setIsUnwrapping(false);
        }
      } catch (err) {
        console.error("Failed to parse imported tape:", err);
        alert("This tape link is invalid or corrupted.");
      }
    } else if (shareId) {
      setIsLoading(true);
      const fetchSharedTape = async () => {
        try {
          const response = await fetch(`${API_URL}/playlists/share/${shareId}`);
          if (!response.ok) throw new Error("Could not fetch shared tape");
          const json = await response.json();
          if (json.success && json.data) {
            const tapeData = json.data;
            
            // Remove database-specific identifiers so they get generated cleanly on receiver
            delete tapeData._id;
            delete tapeData.userId;
            
            if (tapeData.sideA) tapeData.sideA = tapeData.sideA.map(s => { delete s._id; delete s.playlistId; return s; });
            if (tapeData.sideB) tapeData.sideB = tapeData.sideB.map(s => { delete s._id; delete s.playlistId; return s; });
            
            tapeData.id = crypto.randomUUID();
            
            setPendingTape(tapeData);
            setImportMode(shareMode);
            setSender(shareSender);
            setUnwrapped(false);
            setIsUnwrapping(false);
          } else {
            alert("Mixtape not found. It may have been deleted.");
          }
        } catch (err) {
          console.error("Failed to fetch shared tape:", err);
          alert("Could not load the shared tape. Please check your connection.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchSharedTape();
    }
  }, [isAuthenticated, addTape]);

  const handleClaim = async () => {
    if (!pendingTape) return;
    const finalTape = { ...pendingTape };
    if (importMode === 'gift') {
      finalTape.isGift = true;
      finalTape.isUnwrapped = true; // Mark as unwrapped since they just unwrapped it!
      finalTape.giftSender = sender;
    } else {
      finalTape.isCollaborative = true;
    }
    
    const saved = await addTape(finalTape);
    setPendingTape(null);
    if (saved && saved.id) {
      navigate(`/player/${saved.id}`);
    } else {
      navigate('/');
    }
  };

  const handleUnwrap = () => {
    setIsUnwrapping(true);
    setTimeout(() => {
      setUnwrapped(true);
      setIsUnwrapping(false);
    }, 1000); // 1s animation duration
  };

  const handleDecline = () => {
    setPendingTape(null);
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <div className="text-4xl mb-4 animate-spin text-brand-accent">📼</div>
          <div className="font-pixel text-xs text-brand-accent glow-text tracking-widest uppercase animate-pulse">
            RETRIEVING MIXTAPE...
          </div>
          <div className="font-mono text-[9px] text-gray-500 mt-2 text-center max-w-xs">
            Render server is warming up, this might take a moment.
          </div>
        </motion.div>
      )}
      {pendingTape && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          {importMode === 'gift' && !unwrapped ? (
            /* --- Wrapped Gift Unboxing Screen --- */
            <motion.div
              className="w-full max-w-sm flex flex-col items-center"
              exit={{ scale: 0.8, opacity: 0 }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <span className="text-brand-accent font-pixel text-xs tracking-widest uppercase">YOU RECEIVED A GIFT!</span>
              </div>

              {/* Interactive Gift Card / Box */}
              <motion.div
                onClick={handleUnwrap}
                whileHover={{ y: -8, scale: 1.02 }}
                animate={isUnwrapping ? { 
                  scale: [1, 1.1, 0.9, 1.2, 0],
                  rotate: [0, 10, -10, 15, 0],
                  filter: ["blur(0px)", "blur(0px)", "blur(2px)", "blur(10px)", "blur(20px)"]
                } : { 
                  y: [0, -6, 0] 
                }}
                transition={isUnwrapping ? { duration: 1, times: [0, 0.2, 0.4, 0.7, 1] } : {
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }}
                className="w-64 h-64 rounded-2xl overflow-hidden cursor-pointer relative shadow-[0_0_40px_rgba(231,76,60,0.3)] border-2 border-[#e74c3c]/20"
              >
                {/* Wrapping paper pattern */}
                <div className="absolute inset-0 bg-[#e74c3c]" style={{ 
                  backgroundImage: 'radial-gradient(#c0392b 15%, transparent 16%), radial-gradient(#c0392b 15%, transparent 16%)', 
                  backgroundSize: '20px 20px', 
                  backgroundPosition: '0 0, 10px 10px' 
                }} />

                {/* Ribbons */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-[#f1c40f] shadow-md" />
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 bg-[#f1c40f] shadow-md" />

                {/* Bow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#f39c12] rounded-full border-4 border-[#f1c40f] flex items-center justify-center shadow-lg">
                  <Gift className="text-white animate-pulse" size={28} />
                </div>

                {/* Gift Tag */}
                <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-sm shadow-md border border-gray-300 transform -rotate-6 max-w-[150px]">
                  <p className="font-mono text-[8px] text-gray-400 leading-none">FROM:</p>
                  <p className="font-mono text-xs text-black font-bold truncate mt-0.5">{sender}</p>
                </div>

                {/* Sparkles glow */}
                <div className="absolute top-2 right-2 text-[#f1c40f] opacity-80">
                  <Sparkles size={16} />
                </div>
              </motion.div>

              <p className="font-mono text-[10px] text-gray-500 mt-6 tracking-wider animate-pulse">
                CLICK THE GIFT BOX TO UNWRAP IT
              </p>

              <button
                onClick={handleDecline}
                className="mt-8 text-gray-600 hover:text-white font-mono text-xs underline"
              >
                Decline Gift
              </button>
            </motion.div>
          ) : (
            /* --- Mixtape Reveal Screen --- */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-full max-w-sm flex flex-col items-center bg-[#111] retro-border p-8 text-center relative"
            >
              {/* Confetti or sparkles behind */}
              <div className="absolute -top-10 text-brand-accent animate-bounce">
                <Sparkles size={32} />
              </div>

              <h3 className="font-pixel glow-text text-sm mb-2">
                {importMode === 'gift' ? "🎁 GIFT UNWRAPPED!" : "📼 INCOMING MIXTAPE!"}
              </h3>
              <p className="font-mono text-xs text-gray-500 mb-6">
                Sent to you by <span className="text-brand-accent font-bold">@{sender}</span>
              </p>

              {/* Revealed Cassette */}
              <div className="w-full max-w-[280px] mb-8 relative group">
                <CassetteCanvas tape={pendingTape} isPlaying={false} progress={0} />
                <div className="absolute inset-0 rounded-xl opacity-80 pointer-events-none" style={{
                  boxShadow: `0 0 25px ${pendingTape.color || '#5DCAA5'}44`
                }} />
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <button
                  onClick={handleClaim}
                  className="w-full py-3 bg-brand-accent text-black font-bold font-pixel text-xs tracking-wider hover:shadow-[0_0_15px_rgba(93,202,165,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <Check size={14} /> ADD TO SHELF
                </button>
                <button
                  onClick={handleDecline}
                  className="w-full py-3 border border-[#333] hover:border-red-500 text-gray-500 hover:text-red-500 font-mono text-xs transition-colors"
                >
                  DECLINE
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, hasOnboarded, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="h-screen bg-brand-bg flex items-center justify-center font-pixel text-brand-accent">LOADING...</div>;

  if (!isAuthenticated && location.pathname !== '/auth') {
    return <Navigate to="/auth" replace />;
  }

  if (isAuthenticated && !hasOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If authenticated and onboarded, but trying to go to auth or onboarding, redirect to home
  if (isAuthenticated && hasOnboarded && (location.pathname === '/auth' || location.pathname === '/onboarding')) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/auth" element={<ProtectedRoute><Auth /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><CreateTape /></ProtectedRoute>} />
      <Route path="/edit/:id" element={<ProtectedRoute><EditTape /></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/pet-center" element={<ProtectedRoute><PetCenter /></ProtectedRoute>} />
      <Route path="/player/:id" element={<ProtectedRoute><Player /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <TapeProvider>

        <Router>
          <ImportHandler />
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </Router>
      </TapeProvider>
    </AuthProvider>
  );
}

export default App;
