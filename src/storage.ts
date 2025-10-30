import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_WATCH_HISTORY = 'watch_history_ids_v1';

export async function saveWatchHistory(episodeId: string, watched: boolean): Promise<void> {
	try {
		const existing = await getAllWatchedEpisodes();
		const next = new Set(existing);
		if (watched) next.add(episodeId);
		else next.delete(episodeId);
		await AsyncStorage.setItem(KEY_WATCH_HISTORY, JSON.stringify(Array.from(next)));
	} catch {}
}

export async function getWatchHistory(episodeId: string): Promise<boolean> {
	try {
		const ids = await getAllWatchedEpisodes();
		return ids.includes(episodeId);
	} catch {
		return false;
	}
}

export async function getAllWatchedEpisodes(): Promise<string[]> {
	try {
		const raw = await AsyncStorage.getItem(KEY_WATCH_HISTORY);
		if (!raw) return [];
		const arr = JSON.parse(raw);
		return Array.isArray(arr) ? (arr.filter((x) => typeof x === 'string') as string[]) : [];
	} catch {
		return [];
	}
}


