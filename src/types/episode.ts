export interface Episode {
	id: string;
	showId: string;
	title: string;
	order: number;
	muxPlaybackId: string;
	muxPlaybackUrl?: string; // Signed playback URL from server
	durationSec: number;
	thumbnailUrl: string | null;
	createdAt: unknown;
	updatedAt: unknown;
}

export interface EpisodeWithWatchStatus extends Episode {
	watched: boolean;
}


