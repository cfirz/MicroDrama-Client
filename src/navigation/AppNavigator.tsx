import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import ShowListScreen from '../screens/ShowListScreen';
import ShowDetailScreen from '../screens/ShowDetailScreen';
import EpisodePlayerScreen from '../screens/EpisodePlayerScreen';
import HomeScreen from '../screens/HomeScreen';
import SurpriseScreen from '../screens/SurpriseScreen';
import MyListScreen from '../screens/MyListScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';


export type RootStackParamList = {
	ShowList: undefined;
	ShowDetail: { showId: string };
	EpisodePlayer: { showId: string; episodeId: string };
    MainTabs: undefined;
};

type MainTabParamList = {
	Home: undefined;
	Surprise: undefined;
	MyList: undefined;
	Rewards: undefined;
	Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
    return (
        <Tab.Navigator
            id={undefined}
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: () => {
                    const icon =
                        route.name === 'Home' ? '🏠' :
                        route.name === 'Surprise' ? '🎲' :
                        route.name === 'MyList' ? '📺' :
                        route.name === 'Rewards' ? '🏆' :
                        '👤';
                    return <Text>{icon}</Text>;
                },
                tabBarLabel: route.name,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Surprise" component={SurpriseScreen} />
            <Tab.Screen name="MyList" component={MyListScreen} />
            <Tab.Screen name="Rewards">
                {() => <PlaceholderScreen title="Rewards" />}
            </Tab.Screen>
            <Tab.Screen name="Profile">
                {() => <PlaceholderScreen title="Profile" />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

const AppNavigator: React.FC = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="ShowList" component={ShowListScreen} />
				<Stack.Screen name="ShowDetail" component={ShowDetailScreen} />
				<Stack.Screen name="EpisodePlayer" component={EpisodePlayerScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default AppNavigator;


