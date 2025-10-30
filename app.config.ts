import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
	name: 'AppReels',
	slug: 'appreels',
	scheme: 'appreels',
	version: '1.0.0',
	orientation: 'portrait',
	platforms: ['ios', 'android'],
	extra: {
		apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
	},
};

export default config;


