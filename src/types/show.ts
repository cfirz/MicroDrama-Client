export interface Show {
	id: string;
	title: string;
	description: string | null;
	coverUrl: string | null;
	likes: number;
	dislikes: number;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
}

export interface ShowWithEpisodes extends Show {
	episodes: import('./episode').EpisodeWithWatchStatus[];
}


