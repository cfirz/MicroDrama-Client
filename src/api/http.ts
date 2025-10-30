import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiBaseUrl(): string {
	// 1) Respect explicit config first
	const extra = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined) || undefined;
	if (extra?.apiBaseUrl) return extra.apiBaseUrl;

	// 2) Then environment
	if (process.env.API_BASE_URL) return process.env.API_BASE_URL;

	// 3) Try to infer from Expo debugger/host when running in Expo Go
	// SDK 49+: Constants.expoGo?.debuggerHost or .hostUri may be available
	const expoGo = (Constants as any).expoGo as { debuggerHost?: string; hostUri?: string } | undefined;
	const hostSource = expoGo?.debuggerHost || expoGo?.hostUri;
	if (hostSource) {
		// hostSource often looks like "192.168.1.50:19000"
		const host = hostSource.split(':')[0];
		if (host && /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
			return `http://${host}:4000`;
		}
	}

	// 4) Platform-specific sane defaults for local dev
	if (Platform.OS === 'android') return 'http://10.0.2.2:4000';
	return 'http://localhost:4000';
}

const baseURL = resolveApiBaseUrl();

export const http = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json',
	},
});


