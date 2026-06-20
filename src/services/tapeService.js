import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

export const tapeService = {
  async initDB() {
    localforage.config({
      name: 'TapeDeck',
      storeName: 'tapes_db'
    });
  },

  async getTapes() {
    try {
      let saved = await localforage.getItem('tapedeck_tapes');
      let loadedTapes = [];

      if (saved && saved.length > 0) {
        loadedTapes = saved;
      } else {
        // Fallback to localStorage migration
        const oldTapes = localStorage.getItem('tapedeck_tapes');
        if (oldTapes) {
          try {
            loadedTapes = JSON.parse(oldTapes);
            await localforage.setItem('tapedeck_tapes', loadedTapes);
          } catch (e) {
            console.error('Failed to parse old tapes', e);
          }
        }
      }

      // Inject mocks for Phase 1 demo if missing
      const hasGift = loadedTapes.some(t => t.isGift);
      const hasCapsule = loadedTapes.some(t => t.lockedUntil);

      if (!hasGift) {
        loadedTapes.push({
          id: uuidv4(),
          name: "Birthday Mix",
          color: "bg-pink-400",
          createdAt: new Date().toISOString(),
          sideA: [], sideB: [],
          isGift: true,
          giftSender: "@retro_kid",
          giftMessage: "Happy Birthday! Made this just for you. 🎂",
          isUnwrapped: false
        });
      }

      if (!hasCapsule) {
        loadedTapes.push({
          id: uuidv4(),
          name: "Future Memories",
          color: "bg-blue-500",
          createdAt: new Date().toISOString(),
          sideA: [], sideB: [],
          lockedUntil: new Date(Date.now() + 2 * 60 * 1000).toISOString()
        });
      }

      return loadedTapes;
    } catch (err) {
      console.error("Error loading tapes from DB:", err);
      return [];
    }
  },

  async saveTapes(tapes) {
    try {
      await localforage.setItem('tapedeck_tapes', tapes);
    } catch (err) {
      console.error("Error saving tapes to DB:", err);
    }
  }
};
