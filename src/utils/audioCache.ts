/**
 * IndexedDB audio cache for native Spanish TTS
 * Caches generated audio blobs by hash(text + voice + dialect + speed)
 * to ensure instant playback without network delay or repetitive API quota usage.
 */

const DB_NAME = 'FluentoAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'tts_cache';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

export function generateAudioCacheKey(
  text: string,
  voiceName: string,
  dialect: string,
  speed: number
): string {
  // Normalize text
  const clean = text
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[\u0600-\u06FF]/g, '')
    .trim()
    .toLowerCase();

  // Simple, fast string hash
  let hash = 0;
  const str = `${clean}_${voiceName}_${dialect}_${speed.toFixed(2)}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  return `tts_${Math.abs(hash)}_${voiceName}_${dialect.includes('Spain') ? 'es' : 'la'}`;
}

export async function getCachedAudioBlob(cacheKey: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(cacheKey);

      request.onsuccess = () => {
        if (request.result && request.result.blob) {
          resolve(request.result.blob);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch (e) {
    console.warn('Error reading from audio cache:', e);
    return null;
  }
}

export async function saveAudioBlobToCache(cacheKey: string, blob: Blob): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({
        key: cacheKey,
        blob,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('Error saving to audio cache:', e);
  }
}
