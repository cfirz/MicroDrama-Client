import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface ButtonProps {
	label: string;
	onPress: () => void;
	style?: ViewStyle;
	textStyle?: TextStyle;
	disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onPress, style, textStyle, disabled }) => {
	const { colors, spacing } = useTheme();
	return (
		<TouchableOpacity
			accessibilityRole="button"
			onPress={onPress}
			disabled={disabled}
			style={[
				styles.base,
				{ backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
				disabled ? { opacity: 0.6 } : null,
				style,
			]}
		>
			<Text style={[styles.label, { color: '#fff' }, textStyle]}>{label}</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	base: {
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	label: {
		fontWeight: '600',
	},
});

export default Button;


