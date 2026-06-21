const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://tapedeck.onrender.com/api/auth' : 'http://localhost:5000/api/auth');

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (response.ok && data.success) {
        // Cache for offline
        localStorage.setItem('tapedeck_local_user', JSON.stringify({ ...data.data, password }));
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to login to server');
      }
    } else {
       throw new Error("Server asleep");
    }
  } catch (err) {
    // Fallback to offline cache
    const stored = localStorage.getItem('tapedeck_local_user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user.email === email && user.password === password) {
        const localUser = { ...user, token: user.token || 'local-offline-token' };
        localStorage.setItem('user', JSON.stringify(localUser));
        return localUser;
      }
    }
    throw new Error(err.message === "Server asleep" ? "Backend is offline and no local account matched." : err.message);
  }
};

export const register = async (name, email, password, tapeTag) => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, tapeTag }),
    });
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (response.ok && data.success) {
        // Cache for offline
        localStorage.setItem('tapedeck_local_user', JSON.stringify({ ...data.data, password }));
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to register on server');
      }
    } else {
      throw new Error("Server asleep");
    }
  } catch (err) {
    // Offline registration fallback
    if (err.message === "Server asleep" || err.message === "Failed to fetch" || err.message.includes("network")) {
      const user = { name, email, password, tapeTag, id: 'local-' + Date.now(), token: 'local-offline-token' };
      localStorage.setItem('tapedeck_local_user', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    throw err;
  }
};

export const logout = async () => {
  localStorage.removeItem('user');
  localStorage.removeItem('hasOnboarded');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try { return JSON.parse(userStr); } catch { return null; }
};

export const updateUserProfile = async (userData) => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const updated = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
    }
    return userData;
};

export const getOnboardedStatus = async () => {
  return localStorage.getItem('hasOnboarded') === 'true';
};

export const setOnboardedStatus = async (status) => {
  localStorage.setItem('hasOnboarded', status.toString());
};

export const authService = {
  login,
  register,
  logout,
  getUser: async () => getCurrentUser(),
  getOnboardedStatus,
  setOnboardedStatus,
  updateUserProfile,
  saveUser: async (user) => localStorage.setItem('user', JSON.stringify(user)),
  clearUser: async () => logout()
};
