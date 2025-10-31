import { create } from 'zustand';

interface SessionState {
    startedShowIds: Set<string>;
    markShowStarted: (showId: string) => void;
    hasStarted: (showId: string) => boolean;
    clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    startedShowIds: new Set<string>(),
    markShowStarted: (showId: string) => {
        const next = new Set(get().startedShowIds);
        next.add(showId);
        set({ startedShowIds: next });
    },
    hasStarted: (showId: string) => get().startedShowIds.has(showId),
    clearSession: () => set({ startedShowIds: new Set<string>() }),
}));


