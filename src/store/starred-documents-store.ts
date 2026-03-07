import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StarredDocumentsState {
  starredPaths: string[];
  toggleStar: (path: string) => void;
  isStarred: (path: string) => boolean;
}

export const useStarredDocumentsStore = create<StarredDocumentsState>()(
  persist(
    (set, get) => ({
      starredPaths: [],
      toggleStar: (path: string): void => {
        const current = get().starredPaths;
        if (current.includes(path)) {
          set({ starredPaths: current.filter((p) => p !== path) });
        } else {
          set({ starredPaths: [...current, path] });
        }
      },
      isStarred: (path: string): boolean => {
        return get().starredPaths.includes(path);
      },
    }),
    {
      name: "starred-documents",
    }
  )
);
