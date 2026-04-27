import { create } from 'zustand';
import { dict, Lang, DictKey } from './strings';

const KEY = 'rifas:lang:v1';

function detectInitial(): Lang {
  try {
    const stored = localStorage.getItem(KEY) as Lang | null;
    if (stored === 'pt' || stored === 'en') return stored;
  } catch {}
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('pt')) return 'pt';
  return 'en';
}

type LangStore = {
  lang: Lang;
  setLang: (l: Lang) => void;
};

export const useLang = create<LangStore>((set) => ({
  lang: detectInitial(),
  setLang: (lang) => {
    set({ lang });
    try { localStorage.setItem(KEY, lang); } catch {}
  },
}));

export function useT() {
  const lang = useLang(s => s.lang);
  return function t<K extends DictKey>(key: K): typeof dict[K][Lang] {
    return dict[key][lang] as typeof dict[K][Lang];
  };
}

export type { Lang };
