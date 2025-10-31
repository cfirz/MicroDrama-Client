import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getShows, getShowEpisodes } from '../api/shows.api';
import type { Show } from '../types/show';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/useTheme';

type Nav = StackNavigationProp<RootStackParamList>;

interface Props { navigation: Nav }

const SurpriseScreen: React.FC<Props> = ({ navigation }) => {
    const { colors } = useTheme();
    const { data: shows = [] } = useQuery<Show[]>({ queryKey: ['shows'], queryFn: getShows });

    useEffect(() => {
        let mounted = true;
        const go = async () => {
            if (!shows.length) return;
            const idx = Math.floor(Math.random() * shows.length);
            const show = shows[idx];
            try {
                const episodes = await getShowEpisodes(show.id, { sortBy: 'order', orderBy: 'asc' });
                if (!mounted) return;
                const first = episodes[0];
                if (first) {
                    navigation.replace('EpisodePlayer', { showId: show.id, episodeId: first.id });
                } else {
                    navigation.replace('ShowDetail', { showId: show.id });
                }
            } catch {
                if (!mounted) return;
                navigation.replace('ShowDetail', { showId: show.id });
            }
        };
        go();
        return () => {
            mounted = false;
        };
    }, [shows, navigation]);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
            <ActivityIndicator />
            <Text style={{ color: colors.muted, marginTop: 8 }}>Finding something great…</Text>
        </View>
    );
};

export default SurpriseScreen;


