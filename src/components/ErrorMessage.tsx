import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { useTheme } from '../theme/useTheme';

interface ErrorMessageProps {
	message: string;
	onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
	const { colors, spacing } = useTheme();
	return (
		<View style={styles.container}>
			<Text style={[styles.text, { color: colors.text }]}>{message}</Text>
			{onRetry ? (
				<View style={{ marginTop: spacing.md }}>
					<Button label="Retry" onPress={onRetry} />
				</View>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	container: { alignItems: 'center', justifyContent: 'center' },
	text: { fontSize: 16 },
});

export default ErrorMessage;


