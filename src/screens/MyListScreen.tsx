import React, { useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useLikesStore } from '../stores/useLikesStore';
import Button from '../components/Button';
import { useQuery } from '@tanstack/react-query';
import { getShows } from '../api/shows.api';
import type { Show } from '../types/show';
import ShowCard from '../components/ShowCard';
import { useTheme } from '../theme/useTheme';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = StackNavigationProp<RootStackParamList>;

interface Props { navigation: Nav }

const MyListScreen: React.FC<Props> = ({ navigation }) => {
    const { colors } = useTheme();
    const { isLiked } = useLikesStore();
    const { data: shows = [] } = useQuery<Show[]>({ queryKey: ['shows'], queryFn: getShows });
    const liked = useMemo(() => shows.filter((s) => isLiked(s.id)), [shows, isLiked]);

    if (!liked.length) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
                <Text style={{ color: colors.muted }}>You haven't liked anything yet.</Text>
                <View style={{ height: 12 }} />
                <Button label="Browse Featured" onPress={() => navigation.navigate('MainTabs')} />
            </View>
        );
    }

    return (
        <FlatList
            data={liked}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <ShowCard show={item} onPress={() => navigation.navigate('ShowDetail', { showId: item.id })} />
            )}
            style={{ backgroundColor: colors.background }}
        />
    );
};

export default MyListScreen;


