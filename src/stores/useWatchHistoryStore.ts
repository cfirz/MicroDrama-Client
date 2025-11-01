import { create } from 'zustand';
import { getAllWatchedEpisodes, saveWatchHistory } from '../storage';

interface WatchHistoryState {
	watchedEpisodes: Set<string>;
	markAsWatched: (episodeId: string) => void;
	markAsUnwatched: (episodeId: string) => void;
	isWatched: (episodeId: string) => boolean;
	clearWatchHistory: () => void;
	hydrate: () => Promise<void>;
}

export const useWatchHistoryStore = create<WatchHistoryState>((set, get) => ({
	watchedEpisodes: new Set<string>(),
	markAsWatched: (episodeId: string) => {
		const next = new Set(get().watchedEpisodes);
		next.add(episodeId);
		set({ watchedEpisodes: next });
		saveWatchHistory(episodeId, true).catch(() => {});
	},
	markAsUnwatched: (episodeId: string) => {
		const next = new Set(get().watchedEpisodes);
		next.delete(episodeId);
		set({ watchedEpisodes: next });
		saveWatchHistory(episodeId, false).catch(() => {});
	},
	isWatched: (episodeId: string) => get().watchedEpisodes.has(episodeId),
	clearWatchHistory: () => set({ watchedEpisodes: new Set<string>() }),
	hydrate: async () => {
		const ids = await getAllWatchedEpisodes();
		set({ watchedEpisodes: new Set(ids) });
	},
}));


