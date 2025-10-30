export interface Show {
	id: string;
	title: string;
	description: string | null;
	coverUrl: string | null;
	likes: number;
	dislikes: number;
	createdAt: unknown;
	updatedAt: unknown;
}

export interface ShowWithEpisodes extends Show {
	episodes: import('./episode').EpisodeWithWatchStatus[];
}


