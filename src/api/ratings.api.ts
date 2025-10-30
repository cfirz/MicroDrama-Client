import { http } from './http';
import { RatingSchema } from './schemas';

export async function likeShow(showId: string, ratingValue: 0 | 1) {
	const res = await http.post(`/api/v1/shows/${showId}/like`, { ratingValue });
	return RatingSchema.parse(res.data);
}


