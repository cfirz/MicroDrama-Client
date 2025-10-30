import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface LoadingSkeletonProps {
	count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 6 }) => {
	const { spacing } = useTheme();
	return (
		<View>
			{Array.from({ length: count }).map((_, idx) => (
				<View key={idx} style={[styles.row, { padding: spacing.lg }]}> 
					<View style={styles.cover} />
					<View style={styles.meta}>
						<View style={styles.line} />
						<View style={[styles.line, styles.lineShort]} />
					</View>
				</View>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center' },
	cover: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#eee' },
	meta: { marginLeft: 12, flex: 1 },
	line: { height: 12, backgroundColor: '#eee', borderRadius: 6, marginBottom: 8 },
	lineShort: { width: '40%' },
});

export default LoadingSkeleton;


