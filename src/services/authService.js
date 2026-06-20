export const authService = {
  async getUser() {
    try {
      const storedUser = localStorage.getItem('tapedeck_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('Failed to get user from storage', e);
      return null;
    }
  },

  async saveUser(user) {
    try {
      localStorage.setItem('tapedeck_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user to storage', e);
    }
  },

  async clearUser() {
    try {
      localStorage.removeItem('tapedeck_user');
      localStorage.removeItem('tapedeck_onboarded');
    } catch (e) {
      console.error('Failed to clear user from storage', e);
    }
  },

  async getOnboardedStatus() {
    try {
      return localStorage.getItem('tapedeck_onboarded') === 'true';
    } catch (e) {
      console.error('Failed to get onboarded status', e);
      return false;
    }
  },

  async setOnboardedStatus(status) {
    try {
      localStorage.setItem('tapedeck_onboarded', status ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to set onboarded status', e);
    }
  }
};
