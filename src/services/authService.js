const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://tapedeck.onrender.com/api/auth' : 'http://localhost:5000/api/auth');

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(`Server returned non-JSON response.`);
  }

  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Failed to login');
  
  localStorage.setItem('user', JSON.stringify(data.data));
  return data.data;
};

export const register = async (name, email, password, tapeTag) => {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, tapeTag }),
  });
  
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(`Server returned non-JSON response.`);
  }

  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Failed to register');
  
  localStorage.setItem('user', JSON.stringify(data.data));
  return data.data;
};

export const logout = async () => {
  localStorage.removeItem('user');
  localStorage.removeItem('hasOnboarded');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const updateUserProfile = async (userData) => {
    // For now we just update local storage. In a real app, this would hit a PUT /api/auth/profile
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
  updateUserProfile
};
