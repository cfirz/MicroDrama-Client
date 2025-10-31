import { http } from './http';
import { ShowSchema, ShowWithEpisodesSchema, EpisodeWithWatchSchema } from './schemas';
import type { Show } from '../types/show';

export async function getShows(): Promise<Show[]> {
	const res = await http.get('/api/v1/shows');
	return ShowSchema.array().parse(res.data) as Show[];
}

export async function getShowById(id: string) {
	const res = await http.get(`/api/v1/shows/${id}`);
	return ShowWithEpisodesSchema.parse(res.data);
}

export async function getShowEpisodes(
	showId: string,
	options?: { filterBy?: 'all' | 'watched' | 'unwatched'; sortBy?: 'title' | 'order' | 'created_at'; orderBy?: 'asc' | 'desc' }
) {
	const res = await http.get(`/api/v1/shows/${showId}/episodes`, { params: options });
	return EpisodeWithWatchSchema.array().parse(res.data);
}


