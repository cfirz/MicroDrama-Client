import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useQuery } from '@tanstack/react-query';
import { getShows } from '../api/shows.api';
import type { Show } from '../types/show';

type Props = StackScreenProps<RootStackParamList, 'ShowList'>;

const ShowListScreen: React.FC<Props> = ({ navigation }) => {
	const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['shows'], queryFn: getShows });

	if (isLoading) {
		return (
			<View style={styles.center}> 
				<ActivityIndicator />
				<Text style={styles.muted}>Loading shows…</Text>
			</View>
		);
	}

	if (isError) {
		return (
			<View style={styles.center}>
				<Text style={styles.error}>Failed to load shows.</Text>
				<TouchableOpacity onPress={() => refetch()} style={styles.retry}>
					<Text style={styles.retryText}>Retry</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<FlatList
			data={data as Show[]}
			keyExtractor={(item) => item.id}
			renderItem={({ item }) => (
				<TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ShowDetail', { showId: item.id })}>
					<Text style={styles.title}>{item.title}</Text>
					<Text style={styles.subtitle}>👍 {item.likes}  👎 {item.dislikes}</Text>
				</TouchableOpacity>
			)}
			contentContainerStyle={data && (data as Show[]).length === 0 ? styles.center : undefined}
			ListEmptyComponent={<Text style={styles.muted}>No shows yet.</Text>}
		/>
	);
};

export default ShowListScreen;

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	item: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e5e5' },
	title: { fontSize: 16, fontWeight: '600' },
	subtitle: { color: '#666', marginTop: 4 },
	muted: { color: '#888', marginTop: 8 },
	error: { color: '#b91c1c', marginBottom: 12 },
	retry: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#111', borderRadius: 6 },
	retryText: { color: '#fff' },
});


