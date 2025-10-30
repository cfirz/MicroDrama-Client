export interface Rating {
	id: string;
	showId: string;
	ratingValue: 0 | 1;
	createdAt: unknown;
}

export interface CreateRatingRequest {
	ratingValue: 0 | 1;
}


