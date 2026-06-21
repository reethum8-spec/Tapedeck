import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

localforage.config({
  name: 'TapeDeck',
  storeName: 'tapes_db'
});

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://tapedeck.onrender.com/api' : 'http://localhost:5000/api');

const getAuthHeaders = () => {
  const userStr = localStorage.getItem('user');
  let user = null;
  try {
    if (userStr) user = JSON.parse(userStr);
  } catch(e) {}
  return {
    'Content-Type': 'application/json',
    Authorization: user?.token ? `Bearer ${user.token}` : '',
  };
};

export const tapeService = {
  async initDB() {},

  async getTapes() {
    let localTapes = [];
    try {
      localTapes = (await localforage.getItem('tapedeck_tapes')) || [];
    } catch (err) {}

    try {
      const res = await fetch(`${API_URL}/playlists`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("API not ok");
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) throw new Error("Not JSON");
      
      const json = await res.json();
      if (json.success) {
        // Sync logic: Keep local tapes that don't have an _id or are flagged isLocalOnly
        const serverTapes = json.data;
        const unsyncedLocals = localTapes.filter(lt => lt.isLocalOnly);
        
        // Push unsynced locals to server asynchronously
        unsyncedLocals.forEach(async (tape) => {
          try {
            await this.createTape(tape, true); // true = skip local push
          } catch(e) {}
        });

        // Clean up server tapes to ensure they have an `id` property
        const cleanServerTapes = serverTapes.map(t => ({...t, id: t.id || t._id}));

        // The authoritative list is serverTapes + any remaining unsynced locals
        const merged = [...cleanServerTapes, ...unsyncedLocals];
        await localforage.setItem('tapedeck_tapes', merged);
        return merged;
      }
    } catch (err) {
      console.warn("Backend fetch failed, using local offline cache.", err);
    }
    return localTapes;
  },

  async createTape(tapeData, skipLocal = false) {
    const newTape = {
      ...tapeData,
      id: tapeData.id || uuidv4(),
      isLocalOnly: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!skipLocal) {
      const tapes = (await localforage.getItem('tapedeck_tapes')) || [];
      tapes.push(newTape);
      await localforage.setItem('tapedeck_tapes', tapes);
    }

    // Fire and forget
    fetch(`${API_URL}/playlists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tapeData)
    }).then(async res => {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const json = await res.json();
        if (json.success) {
          const tapes = (await localforage.getItem('tapedeck_tapes')) || [];
          const index = tapes.findIndex(t => t.id === newTape.id);
          if (index !== -1) {
            tapes[index] = { ...json.data, id: json.data.id || json.data._id };
            await localforage.setItem('tapedeck_tapes', tapes);
          }
        }
      }
    }).catch(err => console.warn("Backend create failed, saved locally.", err));

    return newTape;
  },

  async updateTape(id, updates) {
    const tapes = (await localforage.getItem('tapedeck_tapes')) || [];
    const index = tapes.findIndex(t => t.id === id || t._id === id);
    if (index !== -1) {
      tapes[index] = { ...tapes[index], ...updates, updatedAt: new Date().toISOString() };
      await localforage.setItem('tapedeck_tapes', tapes);
    }

    // Fire and forget
    fetch(`${API_URL}/playlists/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    }).catch(err => console.warn("Backend update failed, saved locally.", err));

    return tapes[index];
  },

  async deleteTape(id) {
    const tapes = (await localforage.getItem('tapedeck_tapes')) || [];
    const filtered = tapes.filter(t => t.id !== id && t._id !== id);
    await localforage.setItem('tapedeck_tapes', filtered);

    // Fire and forget
    fetch(`${API_URL}/playlists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).catch(err => {});
    
    return { success: true };
  },

  async addSong(songData) {
    const tapes = (await localforage.getItem('tapedeck_tapes')) || [];
    const tapeIndex = tapes.findIndex(t => t.id === songData.playlistId || t._id === songData.playlistId);
    if (tapeIndex === -1) throw new Error("Tape not found locally");
    
    const newSong = { ...songData, _id: uuidv4(), id: uuidv4() };
    const side = songData.side === 'A' ? 'sideA' : 'sideB';
    tapes[tapeIndex][side].push(newSong);
    tapes[tapeIndex].updatedAt = new Date().toISOString();
    await localforage.setItem('tapedeck_tapes', tapes);

    // Sync whole tape to backend
    this.updateTape(tapes[tapeIndex].id || tapes[tapeIndex]._id, { [side]: tapes[tapeIndex][side] });

    return newSong;
  },

  async updateSong(id, updates) {
    const tapes = (await localforage.getItem('tapedeck_tapes')) || [];
    let foundSong = null;
    let foundTape = null;
    let foundSide = null;
    
    for (const tape of tapes) {
      for (const side of ['sideA', 'sideB']) {
        const songIndex = tape[side].findIndex(s => s._id === id || s.id === id);
        if (songIndex !== -1) {
          tape[side][songIndex] = { ...tape[side][songIndex], ...updates };
          foundSong = tape[side][songIndex];
          foundTape = tape;
          foundSide = side;
          break;
        }
      }
      if (foundSong) break;
    }
    
    if (foundSong) {
      foundTape.updatedAt = new Date().toISOString();
      await localforage.setItem('tapedeck_tapes', tapes);
      this.updateTape(foundTape.id || foundTape._id, { [foundSide]: foundTape[foundSide] });
    }
    return foundSong;
  },

  async deleteSong(id) {
    const tapes = (await localforage.getItem('tapedeck_tapes')) || [];
    let found = false;
    
    for (const tape of tapes) {
      for (const side of ['sideA', 'sideB']) {
        const initialLen = tape[side].length;
        tape[side] = tape[side].filter(s => s._id !== id && s.id !== id);
        if (tape[side].length < initialLen) {
          found = true;
          tape.updatedAt = new Date().toISOString();
          this.updateTape(tape.id || tape._id, { [side]: tape[side] });
        }
      }
    }
    
    await localforage.setItem('tapedeck_tapes', tapes);
    return { success: true };
  },

  async getCollaborativeLink(id) {
    return `${window.location.origin}/#/collab/${id}`;
  }
};
