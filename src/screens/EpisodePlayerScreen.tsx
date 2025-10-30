import React from 'react';
import { View, Text } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = StackScreenProps<RootStackParamList, 'EpisodePlayer'>;

const EpisodePlayerScreen: React.FC<Props> = ({ route }) => {
	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Text>Episode Player - Show {route.params.showId} - Episode {route.params.episodeId}</Text>
		</View>
	);
};

export default EpisodePlayerScreen;


