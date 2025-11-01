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

// Request interceptor for logging
http.interceptors.request.use(
	(config) => {
		console.log('[API] Request:', {
			method: config.method?.toUpperCase(),
			url: config.url,
			baseURL: config.baseURL,
			data: config.data ? JSON.stringify(config.data, null, 2) : undefined,
		});
		return config;
	},
	(error) => {
		console.error('[API] Request error:', error);
		return Promise.reject(error);
	}
);

// Response interceptor for logging
http.interceptors.response.use(
	(response) => {
		console.log('[API] Response:', {
			status: response.status,
			url: response.config.url,
			data: response.data ? JSON.stringify(response.data, null, 2) : undefined,
		});
		return response;
	},
	(error) => {
		console.error('[API] Response error:', {
			url: error.config?.url,
			method: error.config?.method,
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data ? JSON.stringify(error.response.data, null, 2) : undefined,
			message: error.message,
			baseURL: error.config?.baseURL,
		});
		return Promise.reject(error);
	}
);


