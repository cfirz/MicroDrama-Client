import { http } from './http';
import { ShowSchema, ShowWithEpisodesSchema, EpisodeWithWatchSchema } from './schemas';

export async function getShows() {
	const res = await http.get('/api/v1/shows');
	return ShowSchema.array().parse(res.data);
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


