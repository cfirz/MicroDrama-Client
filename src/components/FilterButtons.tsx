import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

type Filter = 'all' | 'watched' | 'unwatched';

interface FilterButtonsProps {
	active: Filter;
	onChange: (filter: Filter) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ active, onChange }) => {
	const { colors, spacing } = useTheme();
	return (
		<View style={[styles.row, { gap: spacing.sm }]}> 
			{(['all', 'watched', 'unwatched'] as Filter[]).map((f) => {
				const isActive = active === f;
				return (
					<TouchableOpacity
						key={f}
						onPress={() => onChange(f)}
						style={[
							styles.btn,
							{ borderColor: isActive ? colors.primary : '#ccc', backgroundColor: isActive ? colors.primary : 'transparent', paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
						]}
					>
						<Text style={{ color: isActive ? '#fff' : colors.text, fontWeight: '600', textTransform: 'capitalize' }}>{f}</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	row: { flexDirection: 'row' },
	btn: { borderWidth: 1, borderRadius: 999, alignItems: 'center' },
});

export default FilterButtons;


