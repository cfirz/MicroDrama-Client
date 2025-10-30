import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/useTheme';

type SortBy = 'title' | 'order' | 'created_at';

type OrderBy = 'asc' | 'desc';

interface SortPickerProps {
	sortBy: SortBy;
	orderBy: OrderBy;
	onChange: (sortBy: SortBy, orderBy: OrderBy) => void;
}

const SortPicker: React.FC<SortPickerProps> = ({ sortBy, orderBy, onChange }) => {
	const { colors, spacing } = useTheme();
	const toggleOrder = () => onChange(sortBy, orderBy === 'asc' ? 'desc' : 'asc');
	return (
		<View style={[styles.row, { gap: spacing.sm }]}> 
			<View style={[styles.pill, { borderColor: '#ccc', paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]}> 
				<Text style={{ color: colors.text, fontWeight: '600' }}>Sort: {sortBy}</Text>
			</View>
			<TouchableOpacity onPress={toggleOrder} style={[styles.pill, { borderColor: '#ccc', paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]}> 
				<Text style={{ color: colors.text, fontWeight: '600' }}>{orderBy === 'asc' ? '↑ Asc' : '↓ Desc'}</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center' },
	pill: { borderWidth: 1, borderRadius: 999 },
});

export default SortPicker;


