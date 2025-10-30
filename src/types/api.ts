export interface ApiResponse<T> {
	data: T;
}

export type FilterOptions = 'all' | 'watched' | 'unwatched';
export type SortOptions = 'title' | 'order' | 'created_at';


