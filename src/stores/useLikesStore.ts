import { create } from 'zustand';

interface LikesState {
    likedShowIds: Set<string>;
    likeShowLocal: (showId: string) => void;
    unlikeShowLocal: (showId: string) => void;
    isLiked: (showId: string) => boolean;
    clearLikes: () => void;
}

export const useLikesStore = create<LikesState>((set, get) => ({
    likedShowIds: new Set<string>(),
    likeShowLocal: (showId: string) => {
        const next = new Set(get().likedShowIds);
        next.add(showId);
        set({ likedShowIds: next });
    },
    unlikeShowLocal: (showId: string) => {
        const next = new Set(get().likedShowIds);
        next.delete(showId);
        set({ likedShowIds: next });
    },
    isLiked: (showId: string) => get().likedShowIds.has(showId),
    clearLikes: () => set({ likedShowIds: new Set<string>() }),
}));


