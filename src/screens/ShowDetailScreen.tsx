import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = StackScreenProps<RootStackParamList, 'ShowDetail'>;

const ShowDetailScreen: React.FC<Props> = ({ route, navigation }) => {
	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Text>Show Detail: {route.params.showId}</Text>
			<TouchableOpacity onPress={() => navigation.navigate('EpisodePlayer', { showId: route.params.showId, episodeId: 'ep1' })}>
				<Text>Play Episode</Text>
			</TouchableOpacity>
		</View>
	);
};

export default ShowDetailScreen;


