import React, {useContext} from 'react';
import {Alert} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {IconButton} from 'react-native-paper';

import HomeScreen from '../screens/HomeScreen';
import AddRoomScreen from '../screens/AddRoomScreen';
import RoomScreen from '../screens/RoomScreen';
import RoomParamScreen from '../screens/RoomParamScreen';
import RoomEventScreen from '../screens/RoomEventScreen';

import {AuthContext} from './AuthProvider';


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
                name='Home'
                component={HomeScreen}
                options={({navigation}) => ({
                    headerRight: () => (
                        <IconButton
                            icon='message-plus'
                            size={28}
                            color='#ffffff'
                            onPress={() => navigation.navigate('AddRoom')}
                        />
                    ),
                    headerLeft: () => (
                        <IconButton
                            icon='logout-variant'
                            size={28}
                            color='#ffffff'
                            onPress={() => logout()}
                        />
                    ),
                })}
            />
            <ChatAppStack.Screen
                name='Room'
                component={RoomScreen}
                options={({route, navigation}) => ({
                    title: route.params.thread.name,
                    headerRight: () => (
                        <IconButton
                            icon='cog'
                            size={28}
                            color='#ffffff'
                            onPress={() => navigation.navigate('Params',route.params.thread)}
                        />
                    ),
                })}
            />
            <ChatAppStack.Screen
                name='Params'
                component={RoomParamScreen}
                options={({route, navigation}) => ({
                    title: 'Parameter : '+route.params.name,
                })}
            />
            <ChatAppStack.Screen
                name='Event'
                component={RoomEventScreen}
                options={({route, navigation}) => ({
                    title: 'Event : '+route.params.name,
                })}
            />
        </ChatAppStack.Navigator>
    );
}


export default function HomeStack() {
    return (
        <ModalStack.Navigator mode='modal' headerMode='none'>
            <ModalStack.Screen name='ChatApp' component={ChatApp}/>
            <ModalStack.Screen name='AddRoom' component={AddRoomScreen}/>
        </ModalStack.Navigator>
    );
}

