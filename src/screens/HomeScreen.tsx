import React, { useMemo, useState } from 'react';
import { View, TextInput, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getShows } from '../api/shows.api';
import type { Show } from '../types/show';
import HorizontalShowList from '../components/HorizontalShowList';
import { useTheme } from '../theme/useTheme';
import { useLikesStore } from '../stores/useLikesStore';
import { useSessionStore } from '../stores/useSessionStore';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';

type Nav = StackNavigationProp<RootStackParamList>;

interface HomeScreenProps {
    navigation: Nav;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);
    const likeState = useLikesStore();
    const sessionState = useSessionStore();

    const { data, isLoading, isError, refetch } = useQuery<Show[]>({ queryKey: ['shows'], queryFn: getShows });
    const shows: Show[] = (data ?? []) as Show[];

    const onPressShow = (show: Show) => navigation.navigate('ShowDetail', { showId: show.id });

    const featured = useMemo(() => [...shows].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 3), [shows]);
    const newReleases = useMemo(() => {
        return [...shows]
            .sort((a, b) => {
                const ad = new Date(a.createdAt as any).getTime();
                const bd = new Date(b.createdAt as any).getTime();
                return bd - ad;
            })
            .slice(0, 10);
    }, [shows]);
    const trending = useMemo(() => [...shows].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 10), [shows]);
    const liked = useMemo(() => shows.filter((s) => likeState.isLiked(s.id)), [shows, likeState]);
    const continueWatching = useMemo(() => shows.filter((s) => sessionState.hasStarted(s.id)), [shows, sessionState]);

    const searched = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [] as Show[];
        return shows.filter((s) => s.title.toLowerCase().includes(q)).slice(0, 8);
    }, [shows, query]);

    if (isLoading) {
        return (
            <View style={[styles.center, { flex: 1, backgroundColor: colors.background }]}>
                <ActivityIndicator />
                <Text style={[styles.muted, { color: colors.muted, marginTop: spacing.md }]}>Loading shows…</Text>
                <View style={{ marginTop: spacing.lg, width: '100%' }}>
                    <LoadingSkeleton count={6} />
                </View>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={[styles.center, { flex: 1, backgroundColor: colors.background }]}>
                <ErrorMessage message="Failed to load shows." onRetry={() => refetch()} />
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
            <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg + insets.top }}>
                <TextInput
                    placeholder="Search shows…"
                    placeholderTextColor={colors.muted}
                    value={query}
                    onChangeText={setQuery}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={[styles.search, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                />
                {focused && searched.length > 0 ? (
                    <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                        {searched.map((s) => (
                            <TouchableOpacity
                                key={s.id}
                                accessibilityRole="button"
                                onPress={() => {
                                    onPressShow(s);
                                    setFocused(false);
                                }}
                                style={{ paddingVertical: spacing.xs }}
                            >
                                <Text style={{ color: colors.text }}>{s.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : null}
            </View>

            {featured.length > 0 && (
                <HorizontalShowList title="Featured" shows={featured} onPressShow={onPressShow} variant="tile" thumbnailSize="large" />
            )}
            {continueWatching.length > 0 && (
                <HorizontalShowList title="Continue Watching" shows={continueWatching} onPressShow={onPressShow} variant="tile" thumbnailSize="small" />
            )}
            {newReleases.length > 0 && (
                <HorizontalShowList title="New Releases" shows={newReleases} onPressShow={onPressShow} variant="tile" thumbnailSize="small" />
            )}
            {trending.length > 0 && (
                <HorizontalShowList title="Trending" shows={trending} onPressShow={onPressShow} variant="tile" thumbnailSize="small" />
            )}
            {liked.length > 0 && (
                <HorizontalShowList title="Liked" shows={liked} onPressShow={onPressShow} variant="tile" thumbnailSize="small" />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    search: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
    dropdown: { marginTop: 8, borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    muted: { color: '#888', marginTop: 8 },
});

export default HomeScreen;


