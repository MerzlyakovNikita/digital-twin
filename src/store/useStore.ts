import { create } from 'zustand';
import { trainNodes } from '../model/trainModel';
import { substituteDeep, evaluate } from '../engine/ast';
import { getRange } from '../config/ranges';

type Store = {
  values: Record<string, number>;
  setValue: (key: string, value: number) => void;
  recalc: () => void;
};

export const useStore = create<Store>((set, get) => ({
  values: {
    c: 4,
    v: 20,
    m: 200000,
    T: 300000,
    alpha: 0.01,
    c_r: 0.002,
    g: 9.81,

    F_d: 0,
    F_r: 0,
    F_s: 0,
    F: 0,
    a: 0,
  },

  setValue: (key, value) => {
    const range = getRange(key);

    const safeValue = range
      ? Math.min(range.max, Math.max(range.min, value))
      : value;

    set((s) => ({
      values: { ...s.values, [key]: safeValue },
    }));

    get().recalc();
  },

  recalc: () => {
    const values = { ...get().values };

    for (const node of trainNodes) {
      if (node.type === 'compute') {
        const substituted = substituteDeep(node.expr, values);
        const result = evaluate(substituted);
        values[node.id] = result;
      }
    }

    set({ values });
  },
}));