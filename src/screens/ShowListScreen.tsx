import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useQuery } from '@tanstack/react-query';
import { getShows } from '../api/shows.api';
import type { Show } from '../types/show';
import ShowCard from '../components/ShowCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import { useTheme } from '../theme/useTheme';

type Props = StackScreenProps<RootStackParamList, 'ShowList'>;

const ShowListScreen: React.FC<Props> = ({ navigation }) => {
    const { colors } = useTheme();
    const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['shows'], queryFn: getShows });

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}> 
                <ActivityIndicator />
                <Text style={[styles.muted, { color: colors.muted }]}>Loading shows…</Text>
                <View style={{ marginTop: 12, width: '100%' }}>
                    <LoadingSkeleton count={6} />
                </View>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ErrorMessage message="Failed to load shows." onRetry={() => refetch()} />
            </View>
        );
    }

    return (
        <FlatList
            data={data as Show[]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <ShowCard show={item} onPress={() => navigation.navigate('ShowDetail', { showId: item.id })} />
            )}
            contentContainerStyle={data && (data as Show[]).length === 0 ? styles.center : undefined}
            ListEmptyComponent={<Text style={[styles.muted, { color: colors.muted }]}>No shows yet.</Text>}
            style={{ backgroundColor: colors.background }}
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


