import React, {useContext} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {IconButton} from 'react-native-paper';

import HomeScreen from '../screens/HomeScreen';
import AddRoomScreen from '../screens/AddRoomScreen';
import RoomScreen from '../screens/RoomScreen';
import RoomParamScreen from '../screens/RoomParamScreen';
import RoomEventScreen from '../screens/RoomEventScreen';

import {AuthContext} from './AuthProvider';

const Tab = createMaterialBottomTabNavigator();
const ChatAppStack = createStackNavigator();
const ModalStack = createStackNavigator();

/**
 * All chat app related screens
 */

function ChatApp() {
    const {logout} = useContext(AuthContext);

    return (
        <ChatAppStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#6646ee',
                },
                headerTintColor: '#ffffff',
                headerTitleStyle: {
                    fontSize: 22,
                },
            }}
        >
            <ChatAppStack.Screen
                name="Home"
                component={HomeBottom}
                options={({navigation}) => ({
                    headerRight: () => (
                        <IconButton
                            icon="message-plus"
                            size={28}
                            color="#ffffff"
                            onPress={() => navigation.navigate('AddRoom')}
                        />
                    ),
                    headerLeft: () => (
                        <IconButton
                            icon="logout-variant"
                            size={28}
                            color="#ffffff"
                            onPress={() => logout()}
                        />
                    ),
                })}
            />
            <ChatAppStack.Screen
                name="Room"
                component={RoomScreen}
                options={({route, navigation}) => ({
                    title: route.params.thread.name,
                    headerRight: () => (
                        <IconButton
                            icon="cog"
                            size={28}
                            color="#ffffff"
                            onPress={() => navigation.navigate('Params', route.params.thread)}
                        />
                    ),
                })}
            />
            <ChatAppStack.Screen
                name="Params"
                component={RoomParamScreen}
                options={({route, navigation}) => ({
                    title: 'Parameter : ' + route.params.name,
                })}
            />
            <ChatAppStack.Screen
                name="Event"
                component={RoomEventScreen}
                options={({route, navigation}) => ({
                    title: 'Event : ' + route.params.name,
                })}
            />
        </ChatAppStack.Navigator>
    );
}


export default function HomeStack() {
    return (
        <ModalStack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: 'transparent' },
                cardOverlayEnabled: true,
                cardStyleInterpolator: ({ current: { progress } }) => ({
                    cardStyle: {
                        opacity: progress.interpolate({
                            inputRange: [0, 0.5, 0.9, 1],
                            outputRange: [0, 0.25, 0.7, 1],
                        }),
                    },
                    overlayStyle: {
                        opacity: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.5],
                            extrapolate: 'clamp',
                        }),
                    },
                }),
            }}
            mode="modal"
        >
            <ModalStack.Screen name="ChatApp" component={ChatApp}/>
            <ModalStack.Screen name="AddRoom" component={AddRoomScreen}/>
        </ModalStack.Navigator>
    );
}

function HomeBottom() {
    return (
        <Tab.Navigator
            initialRouteName="Chat"
            activeColor="#D11927"
            inactiveColor="white"
            barStyle={{backgroundColor: '#6646EE'}}
        >
            <Tab.Screen
                name="Chat"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Chat',
                    tabBarIcon: ({color}) => (
                        <MaterialCommunityIcons name="chat" color={color} size={26}/>
                    ),
                }}
            />
            <Tab.Screen
                name="Calendar"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Calendar',
                    tabBarIcon: ({color}) => (
                        <MaterialCommunityIcons name="calendar" color={color} size={26}/>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
