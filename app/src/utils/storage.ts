const CONFIG_KEY = 'rifas:config:v1';
const TEMPLATE_DB = 'rifas-templates';
const TEMPLATE_STORE = 'pdfs';
const TEMPLATE_KEY = 'current';

export function saveConfig(config: unknown): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('saveConfig failed', e);
  }
}

export function loadConfig<T>(): T | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(TEMPLATE_DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(TEMPLATE_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveTemplate(bytes: ArrayBuffer, name: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TEMPLATE_STORE, 'readwrite');
    tx.objectStore(TEMPLATE_STORE).put({ bytes, name, savedAt: Date.now() }, TEMPLATE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadTemplateFromDb(): Promise<{ bytes: ArrayBuffer; name: string } | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(TEMPLATE_STORE, 'readonly');
      const req = tx.objectStore(TEMPLATE_STORE).get(TEMPLATE_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function clearTemplate(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(TEMPLATE_STORE, 'readwrite');
      tx.objectStore(TEMPLATE_STORE).delete(TEMPLATE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
}
