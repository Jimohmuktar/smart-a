const localStore = {
  get: async (key) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  set: async (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  remove: async (key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {}
  },
};

const sessionStore = {
  get: async (key) => {
    try {
      const val = sessionStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  set: async (key, value) => {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  remove: async (key) => {
    try { sessionStorage.removeItem(key); } catch {}
  },
};

export const storage = {
  get: async (key) => {
    const local = await localStore.get(key);
    if (local !== null) return local;
    return await sessionStore.get(key);
  },
  set: async (key, value) => localStore.set(key, value),
  setSession: async (key, value) => sessionStore.set(key, value),
  setRemember: async (key, value, remember) => {
    if (remember) return localStore.set(key, value);
    return sessionStore.set(key, value);
  },
  remove: async (key) => localStore.remove(key),
};
