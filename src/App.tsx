import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
		<SafeAreaProvider>
			<ThemeProvider>
				<QueryClientProvider client={queryClient}>
					<AppNavigator />
				</QueryClientProvider>
			</ThemeProvider>
		</SafeAreaProvider>
	);
}


