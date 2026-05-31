import { create } from "zustand";
import {
  loadSocialCollapsedIds,
  writeSocialCollapsedIds,
} from "../utils/socialCollapsiblePrefs";

type SocialUiState = {
  collapsedSectionIds: string[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSectionCollapsed: (id: string, collapsed: boolean) => void;
};

export const useSocialUiStore = create<SocialUiState>((set, get) => ({
  collapsedSectionIds: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const ids = await loadSocialCollapsedIds();
    set({ collapsedSectionIds: [...ids], hydrated: true });
  },

  setSectionCollapsed: (id, collapsed) => {
    const prev = get().collapsedSectionIds;
    const had = prev.includes(id);
    if (collapsed === had) return;

    const next = collapsed ? [...prev, id] : prev.filter((x) => x !== id);
    set({ collapsedSectionIds: next, hydrated: true });

    void writeSocialCollapsedIds(next).catch(() => {
      set({ collapsedSectionIds: prev });
    });
  },
}));
