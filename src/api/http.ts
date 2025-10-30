import axios from 'axios';
import Constants from 'expo-constants';

const baseURL = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ||
	process.env.API_BASE_URL ||
	'http://localhost:4000';

export const http = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json',
	},
});


