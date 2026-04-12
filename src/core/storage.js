import { STORAGE_KEYS } from "./constants.js";

export function createBrowserStorageAdapter(storage = globalThis.localStorage) {
  return {
    readJson(key, fallback) {
      try {
        const raw = storage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    writeJson(key, value) {
      storage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
      storage.removeItem(key);
    },
  };
}

export function createWrongBookStore(adapter) {
  return {
    load() {
      return adapter.readJson(STORAGE_KEYS.wrongBook, []);
    },
    save(entries) {
      adapter.writeJson(STORAGE_KEYS.wrongBook, entries);
    },
    clear() {
      adapter.remove(STORAGE_KEYS.wrongBook);
    },
  };
}

export function createFavoritesStore(adapter) {
  return {
    load() {
      return adapter.readJson(STORAGE_KEYS.favorites, []);
    },
    save(entries) {
      adapter.writeJson(STORAGE_KEYS.favorites, entries);
    },
    clear() {
      adapter.remove(STORAGE_KEYS.favorites);
    },
  };
}
