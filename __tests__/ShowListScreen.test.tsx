import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShowListScreen from '../src/screens/ShowListScreen';

jest.mock('../src/api/shows.api', () => ({
	getShows: jest.fn().mockResolvedValue([]),
}));

const queryClient = new QueryClient();

describe('ShowListScreen', () => {
	it('renders empty state', async () => {
		render(
			<QueryClientProvider client={queryClient}>
				<ShowListScreen navigation={{ navigate: jest.fn() } as any} route={{ key: 'key', name: 'ShowList' } as any} />
			</QueryClientProvider>
		);
		const empty = await screen.findByText(/No shows yet/i);
		expect(empty).toBeTruthy();
	});
});


