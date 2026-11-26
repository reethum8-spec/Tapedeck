import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

localforage.config({
  name: 'TapeDeck',
  storeName: 'tapes_db'
});

const API_URL = import.meta.env.VITE_API_URL || 'https://tapedeck.onrender.com/api';

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

const syncingTapes = new Set();
let pendingWrite = Promise.resolve();

const writeTapes = (update) => {
  const write = pendingWrite.then(async () => {
    const tapes = (await localforage.getItem('tapedeck_tapes')) || [];
    const result = update(tapes);
    await localforage.setItem('tapedeck_tapes', tapes);
    return result;
  });
  pendingWrite = write.catch(() => {});
  return write;
};

const updateRemoteTape = (tape, updates) => {
  const serverId = tape._id || (!tape.isLocalOnly && tape.id);
  const headers = getAuthHeaders();
  if (!serverId || !headers.Authorization || headers.Authorization === 'Bearer local-offline-token') return;
  fetch(`${API_URL}/playlists/${serverId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  }).catch(err => console.warn('Backend update failed, saved locally.', err));
};

export const tapeService = {
  async initDB() {},

  async getTapes() {
    let localTapes = [];
    try {
      localTapes = (await localforage.getItem('tapedeck_tapes')) || [];
    } catch (err) {}

    // If no authenticated server user token, return local tapes immediately
    const userStr = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
    let user = null;
    try {
      if (userStr) user = JSON.parse(userStr);
    } catch (e) {}

    if (!user || !user.token || user.token === 'local-offline-token' || (user.id && String(user.id).startsWith('local-'))) {
      return localTapes;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${API_URL}/playlists`, { 
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("API not ok");
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) throw new Error("Not JSON");
      
      const json = await res.json();
      if (json.success) {
        const serverTapes = json.data;
        
        const { merged, unsyncedLocals } = await writeTapes(tapes => {
          const unsyncedLocals = tapes.filter(tape => tape.isLocalOnly);
          const merged = serverTapes.map(serverTape => {
            const serverId = serverTape.id || serverTape._id;
            const cached = tapes.find(tape => !tape.isLocalOnly && (tape._id || tape.id) === serverId);
            return cached ? {
              ...serverTape,
              id: cached.id,
              _id: serverId,
              journalEntry: cached.journalEntry,
              lockedUntil: cached.lockedUntil,
              sideA: cached.sideA ?? serverTape.sideA,
              sideB: cached.sideB ?? serverTape.sideB,
            } : { ...serverTape, id: serverId };
          }).concat(unsyncedLocals);
          tapes.splice(0, tapes.length, ...merged);
          return { merged, unsyncedLocals };
        });
        for (const tape of unsyncedLocals) {
          this.createTape(tape, true).catch(err => console.warn('Backend sync failed.', err));
        }
        return merged;
      }
    } catch (err) {
      console.warn("Backend fetch failed or timed out, using local offline cache.", err);
    }
    return localTapes;
  },

  async createTape(tapeData, skipLocal = false) {
    const newTape = {
      ...tapeData,
      sideA: (tapeData.sideA || []).map(song => ({ ...song, _id: uuidv4() })),
      sideB: (tapeData.sideB || []).map(song => ({ ...song, _id: uuidv4() })),
      id: tapeData.id || uuidv4(),
      isLocalOnly: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!skipLocal) {
      await writeTapes(tapes => tapes.push(newTape));
    }

    const headers = getAuthHeaders();
    if (!headers.Authorization || headers.Authorization === 'Bearer local-offline-token') return newTape;

    if (syncingTapes.has(newTape.id)) return newTape;
    syncingTapes.add(newTape.id);
    const metadata = { ...tapeData };
    delete metadata.sideA;
    delete metadata.sideB;
    fetch(`${API_URL}/playlists`, {
      method: 'POST',
      headers,
      body: JSON.stringify(metadata),
    }).then(async res => {
      if (!res.ok) return;
      const json = await res.json();
      const serverId = json.data?._id || json.data?.id;
      if (!json.success || !serverId) return;

      const linked = await writeTapes(tapes => {
        const tape = tapes.find(item => item.id === newTape.id);
        if (!tape) return false;
        tape._id = serverId;
        tape.isLocalOnly = false;
        return true;
      });
      if (!linked) {
        await fetch(`${API_URL}/playlists/${serverId}`, { method: 'DELETE', headers });
      }
    }).catch(err => console.warn('Backend create failed, saved locally.', err))
      .finally(() => syncingTapes.delete(newTape.id));

    return newTape;
  },

  async updateTape(id, updates) {
    const tape = await writeTapes(tapes => {
      const index = tapes.findIndex(item => item.id === id || item._id === id);
      if (index === -1) throw new Error('Tape not found locally');
      tapes[index] = { ...tapes[index], ...updates, updatedAt: new Date().toISOString() };
      return tapes[index];
    });
    updateRemoteTape(tape, updates);
    return tape;
  },

  async deleteTape(id) {
    const tape = await writeTapes(tapes => {
      const index = tapes.findIndex(item => item.id === id || item._id === id);
      return index === -1 ? null : tapes.splice(index, 1)[0];
    });
    const serverId = tape?._id || (tape && !tape.isLocalOnly && tape.id);
    const headers = getAuthHeaders();
    if (serverId && headers.Authorization && headers.Authorization !== 'Bearer local-offline-token') {
      fetch(`${API_URL}/playlists/${serverId}`, {
        method: 'DELETE',
        headers,
      }).catch(err => console.warn('Backend delete failed.', err));
    }
    return { success: true };
  },

  async addSong(songData) {
    return writeTapes(tapes => {
      const tape = tapes.find(item => item.id === songData.playlistId || item._id === songData.playlistId);
      if (!tape) throw new Error('Tape not found locally');

      const side = songData.side === 'A' ? 'sideA' : 'sideB';
      const songs = tape[side] ?? [];
      if (songs.length >= 5) throw new Error('This side of the tape is full');
      const id = uuidv4();
      const song = { ...songData, _id: id, id };
      tape[side] = [...songs, song];
      tape.updatedAt = new Date().toISOString();
      return song;
    });
  },

  async updateSong(id, updates) {
    return writeTapes(tapes => {
      for (const tape of tapes) {
        for (const side of ['sideA', 'sideB']) {
          const songs = tape[side] ?? [];
          const index = songs.findIndex(song => song._id === id || song.id === id);
          if (index === -1) continue;
          songs[index] = { ...songs[index], ...updates };
          tape.updatedAt = new Date().toISOString();
          return songs[index];
        }
      }
      return null;
    });
  },

  async deleteSong(id) {
    return writeTapes(tapes => {
      for (const tape of tapes) {
        for (const side of ['sideA', 'sideB']) {
          const songs = tape[side] ?? [];
          const index = songs.findIndex(song => song._id === id || song.id === id);
          if (index === -1) continue;
          songs.splice(index, 1);
          tape.updatedAt = new Date().toISOString();
          return true;
        }
      }
      return false;
    });
  },
};
