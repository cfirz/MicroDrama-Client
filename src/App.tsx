import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWatchHistoryStore } from './stores/useWatchHistoryStore';

export default function App() {
	const queryClient = new QueryClient();
	const hydrate = useWatchHistoryStore((s) => s.hydrate);

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<AppNavigator />
			</QueryClientProvider>
		</ThemeProvider>
	);
}


