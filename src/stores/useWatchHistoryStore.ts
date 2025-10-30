import { create } from 'zustand';

interface WatchHistoryState {
\twatchedEpisodes: Set<string>;
	markAsWatched: (episodeId: string) => void;
	isWatched: (episodeId: string) => boolean;
	clearWatchHistory: () => void;
}

export const useWatchHistoryStore = create<WatchHistoryState>((set, get) => ({
	watchedEpisodes: new Set<string>(),
	markAsWatched: (episodeId: string) => {
		const next = new Set(get().watchedEpisodes);
		next.add(episodeId);
		set({ watchedEpisodes: next });
	},
	isWatched: (episodeId: string) => get().watchedEpisodes.has(episodeId),
	clearWatchHistory: () => set({ watchedEpisodes: new Set<string>() }),
}));


