import { create } from "zustand";

interface OptimisticNavState {
  optimisticPath: string | null;
  setOptimisticPath: (path: string | null) => void;
}

export const useOptimisticNav = create<OptimisticNavState>((set) => ({
  optimisticPath: null,
  setOptimisticPath: (path) => set({ optimisticPath: path }),
}));
