const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    'Content-Type': 'application/json',
    Authorization: user?.token ? `Bearer ${user.token}` : '',
  };
};

export const tapeService = {
  async initDB() {
    // No longer needed for backend
  },

  async getTapes() {
    try {
      const res = await fetch(`${API_URL}/playlists`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    } catch (err) {
      console.error("Error loading tapes from backend:", err);
      return [];
    }
  },

  async createTape(tapeData) {
    const res = await fetch(`${API_URL}/playlists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tapeData)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async updateTape(id, updates) {
    const res = await fetch(`${API_URL}/playlists/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async deleteTape(id) {
    const res = await fetch(`${API_URL}/playlists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async addSong(songData) {
    const res = await fetch(`${API_URL}/songs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(songData)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async deleteSong(id) {
    const res = await fetch(`${API_URL}/songs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async updateSong(id, updates) {
    const res = await fetch(`${API_URL}/songs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  }
};
