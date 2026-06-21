const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/auth` : 'http://localhost:5000/api/auth';

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const json = await response.json();
  if (!json.success) throw new Error(json.error);
  
  localStorage.setItem('user', JSON.stringify(json.data));
  return json.data;
};

export const register = async (name, email, password) => {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  
  const json = await response.json();
  if (!json.success) throw new Error(json.error);
  
  localStorage.setItem('user', JSON.stringify(json.data));
  return json.data;
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
