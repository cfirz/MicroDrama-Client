import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import type { Show } from '../types/show';
import { useTheme } from '../theme/useTheme';

interface HorizontalShowListProps {
    title: string;
    shows: Show[];
    onPressShow: (show: Show) => void;
    variant?: 'tile' | 'card';
}

const { width } = Dimensions.get('window');
const TILE_WIDTH = Math.min(180, Math.floor(width * 0.48));
const TILE_HEIGHT = Math.floor(TILE_WIDTH * 1.4);

const HorizontalShowList: React.FC<HorizontalShowListProps> = ({ title, shows, onPressShow, variant = 'tile' }) => {
    const { colors, spacing } = useTheme();

    return (
        <View style={{ marginBottom: spacing.xl }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginHorizontal: spacing.lg, marginBottom: spacing.md }}>{title}</Text>
            <FlatList
                horizontal
                data={shows}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => onPressShow(item)} style={{ marginLeft: spacing.lg }}>
                        {variant === 'tile' ? (
                            <View>
                                {item.coverUrl ? (
                                    <Image source={{ uri: item.coverUrl }} style={[styles.tile, { width: TILE_WIDTH, height: TILE_HEIGHT }]} />
                                ) : (
                                    <View style={[styles.tile, styles.tileFallback, { width: TILE_WIDTH, height: TILE_HEIGHT }]} />
                                )}
                                <Text numberOfLines={1} style={{ color: colors.text, marginTop: spacing.xs, width: TILE_WIDTH }}>
                                    {item.title}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.card}>
                                <Text style={{ color: colors.text }}>{item.title}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
                ListFooterComponent={<View style={{ width: spacing.lg }} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    tile: { borderRadius: 12, backgroundColor: '#ddd' },
    tileFallback: { backgroundColor: '#e5e5e5' },
    card: { padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e5e5', borderRadius: 8 },
});

export default HorizontalShowList;


