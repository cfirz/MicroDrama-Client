import { create } from 'zustand';
import type { Show } from '../types/show';
import type { EpisodeWithWatchStatus } from '../types/episode';

interface ShowState {
	selectedShow: Show | null;
	currentEpisode: EpisodeWithWatchStatus | null;
	filterBy: 'all' | 'watched' | 'unwatched';
	sortBy: 'title' | 'order' | 'created_at';
	orderBy: 'asc' | 'desc';
	setSelectedShow: (show: Show | null) => void;
	setCurrentEpisode: (episode: EpisodeWithWatchStatus | null) => void;
	setFilter: (filter: 'all' | 'watched' | 'unwatched') => void;
	setSort: (sortBy: 'title' | 'order' | 'created_at', orderBy: 'asc' | 'desc') => void;
}

export const useShowStore = create<ShowState>((set) => ({
	selectedShow: null,
	currentEpisode: null,
	filterBy: 'all',
	sortBy: 'order',
	orderBy: 'asc',
	setSelectedShow: (selectedShow) => set({ selectedShow }),
	setCurrentEpisode: (currentEpisode) => set({ currentEpisode }),
	setFilter: (filterBy) => set({ filterBy }),
	setSort: (sortBy, orderBy) => set({ sortBy, orderBy }),
}));


