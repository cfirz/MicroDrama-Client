import React from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function App() {
	const queryClient = new QueryClient();
	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<AppNavigator />
			</QueryClientProvider>
		</ThemeProvider>
	);
}


