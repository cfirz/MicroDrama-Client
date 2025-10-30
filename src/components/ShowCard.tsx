import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { Show } from '../types/show';
import { useTheme } from '../theme/useTheme';

interface ShowCardProps {
	show: Show;
	onPress: () => void;
}

const ShowCard: React.FC<ShowCardProps> = ({ show, onPress }) => {
	const { colors, spacing } = useTheme();
	return (
		<TouchableOpacity onPress={onPress} style={[styles.card, { padding: spacing.lg }]}> 
			<View style={styles.row}>
				{show.coverUrl ? (
					<Image source={{ uri: show.coverUrl }} style={styles.cover} resizeMode="cover" />
				) : (
					<View style={[styles.cover, styles.coverFallback]} />
				)}
				<View style={styles.meta}>
					<Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
						{show.title}
					</Text>
					<Text style={[styles.subtitle, { color: colors.muted }]}>👍 {show.likes}  👎 {show.dislikes}</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#e5e5e5',
	},
	row: { flexDirection: 'row', alignItems: 'center' },
	cover: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#ddd' },
	coverFallback: { backgroundColor: '#e5e5e5' },
	meta: { marginLeft: 12, flex: 1 },
	title: { fontSize: 16, fontWeight: '600' },
	subtitle: { marginTop: 4 },
});

export default ShowCard;


