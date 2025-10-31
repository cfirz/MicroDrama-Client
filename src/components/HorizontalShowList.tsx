import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import type { Show } from '../types/show';
import { useTheme } from '../theme/useTheme';

interface HorizontalShowListProps {
    title: string;
    shows: Show[];
    onPressShow: (show: Show) => void;
    variant?: 'tile' | 'card';
    thumbnailSize?: 'large' | 'small';
}

const { width } = Dimensions.get('window');
const LARGE_TILE_WIDTH = Math.min(180, Math.floor(width * 0.48));
const LARGE_TILE_HEIGHT = Math.floor(LARGE_TILE_WIDTH * 1.4);
const SMALL_TILE_WIDTH = Math.floor(LARGE_TILE_WIDTH * 0.8);
const SMALL_TILE_HEIGHT = Math.floor(SMALL_TILE_WIDTH * 1.4);

const HorizontalShowList: React.FC<HorizontalShowListProps> = ({ title, shows, onPressShow, variant = 'tile', thumbnailSize = 'large' }) => {
    const { colors, spacing } = useTheme();
    const isSmall = thumbnailSize === 'small';
    const tileWidth = isSmall ? SMALL_TILE_WIDTH : LARGE_TILE_WIDTH;
    const tileHeight = isSmall ? SMALL_TILE_HEIGHT : LARGE_TILE_HEIGHT;

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
                                    <Image source={{ uri: item.coverUrl }} style={[styles.tile, { width: tileWidth, height: tileHeight }]} />
                                ) : (
                                    <View style={[styles.tile, styles.tileFallback, { width: tileWidth, height: tileHeight }]} />
                                )}
                                <Text numberOfLines={1} style={{ color: colors.text, marginTop: spacing.xs, width: tileWidth }}>
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


