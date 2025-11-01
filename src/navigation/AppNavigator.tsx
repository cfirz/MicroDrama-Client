import React from 'react';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
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
	HomeStack: undefined;
	SurpriseStack: undefined;
	MyListStack: undefined;
	Rewards: undefined;
	Profile: undefined;
};

type HomeStackParamList = {
	Home: undefined;
	ShowList: undefined;
	ShowDetail: { showId: string };
	EpisodePlayer: { showId: string; episodeId: string };
};

type MyListStackParamList = {
	MyList: undefined;
	ShowDetail: { showId: string };
	EpisodePlayer: { showId: string; episodeId: string };
};

type SurpriseStackParamList = {
	Surprise: undefined;
	ShowDetail: { showId: string };
	EpisodePlayer: { showId: string; episodeId: string };
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStackNav = createStackNavigator<HomeStackParamList>();
const MyListStackNav = createStackNavigator<MyListStackParamList>();
const SurpriseStackNav = createStackNavigator<SurpriseStackParamList>();

// Home stack with ShowDetail/ShowList
const HomeStack = () => {
	return (
		<HomeStackNav.Navigator id={undefined} screenOptions={{ headerShown: false }}>
			<HomeStackNav.Screen name="Home" component={HomeScreen} />
			<HomeStackNav.Screen name="ShowList" component={ShowListScreen} />
			<HomeStackNav.Screen name="ShowDetail" component={ShowDetailScreen} />
			<HomeStackNav.Screen name="EpisodePlayer" component={EpisodePlayerScreen} />
		</HomeStackNav.Navigator>
	);
};

// MyList stack with ShowDetail
const MyListStack = () => {
	return (
		<MyListStackNav.Navigator id={undefined} screenOptions={{ headerShown: false }}>
			<MyListStackNav.Screen name="MyList" component={MyListScreen} />
			<MyListStackNav.Screen name="ShowDetail" component={ShowDetailScreen} />
			<MyListStackNav.Screen name="EpisodePlayer" component={EpisodePlayerScreen} />
		</MyListStackNav.Navigator>
	);
};

// Surprise stack with ShowDetail and EpisodePlayer
const SurpriseStack = () => {
	return (
		<SurpriseStackNav.Navigator id={undefined} screenOptions={{ headerShown: false }}>
			<SurpriseStackNav.Screen name="Surprise" component={SurpriseScreen} />
			<SurpriseStackNav.Screen name="ShowDetail" component={ShowDetailScreen} />
			<SurpriseStackNav.Screen name="EpisodePlayer" component={EpisodePlayerScreen} />
		</SurpriseStackNav.Navigator>
	);
};

const MainTabs = () => {
    return (
        <Tab.Navigator
            id={undefined}
            screenOptions={({ route }) => {
                const routeName = getFocusedRouteNameFromRoute(route) ?? route.name;
                return {
                    headerShown: false,
                    tabBarIcon: () => {
                        const icon =
                            route.name === 'HomeStack' ? '🏠' :
                            route.name === 'SurpriseStack' ? '🎲' :
                            route.name === 'MyListStack' ? '📺' :
                            route.name === 'Rewards' ? '🏆' :
                            '👤';
                        return <Text>{icon}</Text>;
                    },
                    tabBarLabel: route.name === 'HomeStack' ? 'Home' : 
                                route.name === 'SurpriseStack' ? 'Surprise' :
                                route.name === 'MyListStack' ? 'MyList' : route.name,
                    // Hide tab bar on EpisodePlayer screens
                    tabBarStyle: routeName === 'EpisodePlayer' ? { display: 'none' } : undefined,
                };
            }}
        >
            <Tab.Screen name="HomeStack" component={HomeStack} />
            <Tab.Screen name="SurpriseStack" component={SurpriseStack} />
            <Tab.Screen name="MyListStack" component={MyListStack} />
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
			<Stack.Navigator 
				id={undefined} 
				screenOptions={{ headerShown: false }}
			>
                <Stack.Screen name="MainTabs" component={MainTabs} />
				<Stack.Screen 
					name="EpisodePlayer" 
					component={EpisodePlayerScreen}
					options={{ 
						gestureEnabled: true,
					}}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default AppNavigator;


