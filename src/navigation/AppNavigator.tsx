import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ShowListScreen from '../screens/ShowListScreen';
import ShowDetailScreen from '../screens/ShowDetailScreen';
import EpisodePlayerScreen from '../screens/EpisodePlayerScreen';

export type RootStackParamList = {
	ShowList: undefined;
	ShowDetail: { showId: string };
	EpisodePlayer: { showId: string; episodeId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen name="ShowList" component={ShowListScreen} />
				<Stack.Screen name="ShowDetail" component={ShowDetailScreen} />
				<Stack.Screen name="EpisodePlayer" component={EpisodePlayerScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default AppNavigator;


