import { create } from 'zustand';
import { Slot } from '../pdf/coords';
import { saveConfig, loadConfig } from '../utils/storage';

export type AppConfig = {
  templateName: string;
  templatePageIndex: number;
  templateW: number;
  templateH: number;

  slots: Slot[];
  selectedSlotId: string | null;

  rows: number;
  cols: number;
  a4Orientation: 'portrait' | 'landscape';
  rifaOrientation: 0 | 90;
  marginsMM: { top: number; right: number; bottom: number; left: number };
  gapMM: { x: number; y: number };

  pagesPerSet: number;
  total: number;
  startNumber: number;
  padding: number;
  fillOrder: 'horizontal' | 'vertical';

  headerFormat: string;
  headerSize: number;
  fontFamily: 'HelveticaBold' | 'Helvetica';
  drawCutLines: boolean;
  /** 0 = keep template vectors; >0 = flatten to a raster at this DPI. */
  flattenDpi: number;
};

type AppState = AppConfig & {
  templateBytes: ArrayBuffer | null;
  setTemplate: (bytes: ArrayBuffer, name: string, w: number, h: number) => void;
  patch: (p: Partial<AppConfig>) => void;
  addSlot: (slot: Slot) => void;
  updateSlot: (id: string, patch: Partial<Slot>) => void;
  removeSlot: (id: string) => void;
  selectSlot: (id: string | null) => void;
  reset: () => void;
};

const defaultConfig: AppConfig = {
  templateName: '',
  templatePageIndex: 0,
  templateW: 0,
  templateH: 0,

  slots: [],
  selectedSlotId: null,

  rows: 4,
  cols: 2,
  a4Orientation: 'portrait',
  rifaOrientation: 0,
  marginsMM: { top: 8, right: 8, bottom: 8, left: 8 },
  gapMM: { x: 2, y: 2 },

  pagesPerSet: 10,
  total: 1000,
  startNumber: 1,
  padding: 4,
  fillOrder: 'horizontal',

  headerFormat: 'Set {setIndex}: {first} a {last}',
  headerSize: 10,
  fontFamily: 'HelveticaBold',
  drawCutLines: false,
  flattenDpi: 300,
};

export const useStore = create<AppState>((set, get) => ({
  ...defaultConfig,
  ...(loadConfig<Partial<AppConfig>>() ?? {}),
  templateBytes: null,
  selectedSlotId: null,

  setTemplate: (bytes, name, w, h) => {
    set({ templateBytes: bytes, templateName: name, templateW: w, templateH: h });
    persist(get());
  },
  patch: (p) => {
    set(p);
    persist(get());
  },
  addSlot: (slot) => {
    set({ slots: [...get().slots, slot], selectedSlotId: slot.id });
    persist(get());
  },
  updateSlot: (id, patch) => {
    set({ slots: get().slots.map(s => (s.id === id ? { ...s, ...patch } : s)) });
    persist(get());
  },
  removeSlot: (id) => {
    set({
      slots: get().slots.filter(s => s.id !== id),
      selectedSlotId: get().selectedSlotId === id ? null : get().selectedSlotId,
    });
    persist(get());
  },
  selectSlot: (id) => set({ selectedSlotId: id }),
  reset: () => {
    set({ ...defaultConfig, templateBytes: null });
    persist(get());
  },
}));

function persist(s: AppState) {
  const { templateBytes, setTemplate, patch, addSlot, updateSlot, removeSlot, selectSlot, reset, ...config } = s;
  saveConfig(config);
}
