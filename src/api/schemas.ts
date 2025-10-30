import { z } from 'zod';

export const ShowSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	coverUrl: z.string().nullable(),
	likes: z.number(),
	dislikes: z.number(),
	createdAt: z.any(),
	updatedAt: z.any(),
});

export const EpisodeWithWatchSchema = z.object({
	id: z.string(),
	showId: z.string(),
	title: z.string(),
	order: z.number(),
	muxPlaybackId: z.string(),
	durationSec: z.number(),
	thumbnailUrl: z.string().nullable(),
	createdAt: z.any(),
	updatedAt: z.any(),
	watched: z.boolean(),
});

export const ShowWithEpisodesSchema = ShowSchema.extend({
	episodes: z.array(EpisodeWithWatchSchema),
});

export const RatingSchema = z.object({
	id: z.string(),
	showId: z.string(),
	ratingValue: z.union([z.literal(0), z.literal(1)]),
	createdAt: z.any(),
});


