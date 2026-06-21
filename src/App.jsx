import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
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

const ImportHandler = () => {
  const { addTape } = useTape();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const importData = params.get('import');
    
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
    <AnimatePresence mode="wait">
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
        {/* Fallback route for unknown paths under the repo base */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <TapeProvider>
        {/* Set basename so BrowserRouter works when the app is served from a subpath (GitHub Pages repo URL) */}
        <Router basename="/Tapedeck">
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
