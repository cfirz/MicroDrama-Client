import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getShowById, getShowEpisodes } from '../api/shows.api';
import { likeShow } from '../api/ratings.api';
import { useShowStore } from '../stores/useShowStore';
import FilterButtons from '../components/FilterButtons';
import SortPicker from '../components/SortPicker';
import EpisodeCard from '../components/EpisodeCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import { useTheme } from '../theme/useTheme';

type Props = StackScreenProps<RootStackParamList, 'ShowDetail'>;

const ShowDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { colors, spacing } = useTheme();
    const { filterBy, sortBy, orderBy, setFilter, setSort } = useShowStore();
    const showId = route.params.showId;
    const queryClient = useQueryClient();

    const showQuery = useQuery({ queryKey: ['show', showId], queryFn: () => getShowById(showId) });
    const episodesQuery = useQuery({
        queryKey: ['episodes', showId, filterBy, sortBy, orderBy],
        queryFn: () => getShowEpisodes(showId, { filterBy, sortBy, orderBy }),
    });

    const rateMutation = useMutation({
        mutationFn: (ratingValue: 0 | 1) => likeShow(showId, ratingValue),
        onMutate: async (ratingValue: 0 | 1) => {
            await queryClient.cancelQueries({ queryKey: ['show', showId] });
            await queryClient.cancelQueries({ queryKey: ['shows'] });

            const prevShow = queryClient.getQueryData<any>(['show', showId]);
            const prevShows = queryClient.getQueryData<any>(['shows']);

            if (prevShow) {
                queryClient.setQueryData(['show', showId], (old: any) => {
                    if (!old) return old;
                    const delta = ratingValue === 1 ? { likes: (old.likes ?? 0) + 1 } : { dislikes: (old.dislikes ?? 0) + 1 };
                    return { ...old, ...delta };
                });
            }
            if (Array.isArray(prevShows)) {
                queryClient.setQueryData(['shows'], (old: any[]) => {
                    return old.map((s) => {
                        if (s.id !== showId) return s;
                        const delta = ratingValue === 1 ? { likes: (s.likes ?? 0) + 1 } : { dislikes: (s.dislikes ?? 0) + 1 };
                        return { ...s, ...delta };
                    });
                });
            }

            return { prevShow, prevShows };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prevShow) queryClient.setQueryData(['show', showId], ctx.prevShow);
            if (ctx?.prevShows) queryClient.setQueryData(['shows'], ctx.prevShows);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['show', showId] });
            queryClient.invalidateQueries({ queryKey: ['shows'] });
        },
    });

    const header = useMemo(() => {
        if (!showQuery.data) return null;
        const show = showQuery.data;
        return (
            <View style={{ padding: spacing.lg }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{show.title}</Text>
                {show.description ? (
                    <Text style={{ color: colors.muted, marginTop: 4 }}>{show.description}</Text>
                ) : null}
                <View style={{ height: spacing.lg }} />
                <FilterButtons active={filterBy} onChange={setFilter} />
                <View style={{ height: spacing.sm }} />
                <SortPicker sortBy={sortBy} orderBy={orderBy} onChange={setSort} />
                <View style={{ height: spacing.md }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => rateMutation.mutate(1)}
                        disabled={rateMutation.isLoading}
                        style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 999,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.xs,
                            backgroundColor: colors.primary,
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700' }}>👍 Like ({show.likes})</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => rateMutation.mutate(0)}
                        disabled={rateMutation.isLoading}
                        style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 999,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.xs,
                        }}
                    >
                        <Text style={{ color: colors.text, fontWeight: '700' }}>👎 Dislike ({show.dislikes})</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }, [showQuery.data, colors.text, colors.muted, colors.primary, spacing.lg, spacing.sm, spacing.md, filterBy, sortBy, orderBy, setFilter, setSort, rateMutation.isLoading]);

    if (showQuery.isLoading || episodesQuery.isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}> 
                <LoadingSkeleton count={6} />
            </View>
        );
    }

    if (showQuery.isError || episodesQuery.isError) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ErrorMessage message="Failed to load show." onRetry={() => { showQuery.refetch(); episodesQuery.refetch(); }} />
            </View>
        );
    }

    const episodes = episodesQuery.data ?? [];

    return (
        <FlatList
            data={episodes}
            keyExtractor={(e) => e.id}
            renderItem={({ item }) => (
                <EpisodeCard episode={item} onPress={() => navigation.navigate('EpisodePlayer', { showId, episodeId: item.id })} />
            )}
            ListHeaderComponent={header}
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        />
    );
};

export default ShowDetailScreen;

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});


