import { create } from 'zustand';

export type Theme = 'light' | 'dark';
const KEY = 'rifas:theme:v1';

function detectInitial(): Theme {
  try {
    const stored = localStorage.getItem(KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export const useTheme = create<{ theme: Theme; setTheme: (t: Theme) => void; toggle: () => void }>((set, get) => ({
  theme: detectInitial(),
  setTheme: (theme) => {
    set({ theme });
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(KEY, theme); } catch {}
  },
  toggle: () => get().setTheme(get().theme === 'light' ? 'dark' : 'light'),
}));

export function applyInitialTheme() {
  document.documentElement.dataset.theme = detectInitial();
}
