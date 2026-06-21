import React, { useEffect } from 'react';
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
import { AnimatePresence } from 'framer-motion';
import { useTape } from './context/TapeContext';
import LZString from 'lz-string';

const API_URL = import.meta.env.VITE_API_URL || 'https://tapedeck.onrender.com/api';

const ImportHandler = () => {
  const { addTape } = useTape();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
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
          
          const msg = tapeData.isGift 
            ? `🎁 You received a gift tape from ${tapeData.giftSender}! Add it to your shelf?`
            : `📼 Add collaborative tape "${tapeData.name}" to your shelf?`;

          if (window.confirm(msg)) {
            addTape(tapeData);
          }
        }
      } catch (err) {
        console.error("Failed to parse imported tape:", err);
        alert("This tape link is invalid or corrupted.");
      }
      navigate(location.pathname, { replace: true });
    } else if (shareId) {
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
            
            if (shareMode === 'gift') {
              tapeData.isGift = true;
              tapeData.isUnwrapped = false;
              tapeData.giftSender = shareSender;
            } else {
              tapeData.isCollaborative = true;
            }

            const msg = shareMode === 'gift' 
              ? `🎁 You received a gift tape from ${shareSender}! Add it to your shelf?`
              : `📼 Add collaborative tape "${tapeData.name}" to your shelf?`;

            if (window.confirm(msg)) {
              await addTape(tapeData);
            }
          } else {
            alert("Mixtape not found. It may have been deleted.");
          }
        } catch (err) {
          console.error("Failed to fetch shared tape:", err);
          alert("Could not load the shared tape. Please check your connection or if it was deleted.");
        }
        navigate(location.pathname, { replace: true });
      };
      fetchSharedTape();
    }
  }, [location.search, location.pathname, navigate, addTape]);

  return null;
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
