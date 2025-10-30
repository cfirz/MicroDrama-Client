import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { EpisodeWithWatchStatus } from '../types/episode';
import { useTheme } from '../theme/useTheme';

interface EpisodeCardProps {
	episode: EpisodeWithWatchStatus;
	onPress: () => void;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, onPress }) => {
	const { colors } = useTheme();
	return (
		<TouchableOpacity onPress={onPress} style={styles.row}>
			{episode.thumbnailUrl ? (
				<Image source={{ uri: episode.thumbnailUrl }} style={styles.thumb} />
			) : (
				<View style={[styles.thumb, styles.thumbFallback]} />
			)}
			<View style={styles.meta}>
				<Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
					{episode.order}. {episode.title}
				</Text>
				<Text style={[styles.subtitle, { color: colors.muted }]}>
					{episode.watched ? 'Watched' : 'Unwatched'} • {Math.round(episode.durationSec / 60)}m
				</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e5e5' },
	thumb: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#ddd' },
	thumbFallback: { backgroundColor: '#e5e5e5' },
	meta: { marginLeft: 12, flex: 1 },
	title: { fontSize: 16, fontWeight: '600' },
	subtitle: { marginTop: 4 },
});

export default EpisodeCard;


