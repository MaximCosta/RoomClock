import React, {useContext, useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {IconButton, Appbar, Menu, Provider, Divider, Portal, Dialog, Paragraph, Button} from 'react-native-paper';

import jjj from '../screens/EventScreen';
import HomeScreen from '../screens/HomeScreen';
import AddRoomScreen from '../screens/AddRoomScreen';
import RoomScreen from '../screens/RoomScreen';
import RoomParamScreen from '../screens/RoomParamScreen';
import RoomEventScreen from '../screens/RoomEventScreen';

import {AuthContext} from './AuthProvider';

const Tab = createMaterialBottomTabNavigator();
const ChatAppStack = createStackNavigator();
const ModalStack = createStackNavigator();

import {getFocusedRouteNameFromRoute, useTheme} from '@react-navigation/native';
import {Dimensions, View} from 'react-native';

const {width, height} = Dimensions.get('screen');

/**
 * All chat app related screens
 */

const Header = ({scene, previous, navigation}) => {
    const {logout} = useContext(AuthContext);
    const {options} = scene.descriptor;
    const title =
        options.headerTitle !== undefined
            ? options.headerTitle
            : options.title !== undefined
            ? options.title
            : scene.route.name;

    const [visible, setVisible] = useState(false);

    const closeMenu = () => setVisible(false);

    const openMenu = () => setVisible(true);

    const toggleMenu = () => setVisible(!visible);

    const havePreHead = options.headerRight && options.headerRight();

    return (
        <>
            <Appbar.Header style={{backgroundColor: '#1B1B1BFF'}}>
                {scene.route.name !== 'Home' && <Appbar.BackAction onPress={navigation.goBack}/>}
                <Appbar.Content title={title} titleStyle={{
                    color: '#ffffff',
                    fontFamily: 'Montserrat',
                    fontWeight: '900',
                    fontSize: 36,
                    lineHeight: 46,
                }}/>
                {havePreHead}
                {!havePreHead && <Appbar.Action icon="magnify" onPress={() => console.log('test')}/>}
                {!havePreHead && <Appbar.Action icon="dots-vertical" onPress={toggleMenu}/>}


            </Appbar.Header>
            <Portal>
                <Provider>
                    <View>
                        <Menu
                            visible={visible}
                            onDismiss={closeMenu}
                            anchor={{x: width, y: 50}}
                        >
                            <Menu.Item title="Users"/>
                            <Menu.Item title="Parametre"/>
                            <Divider/>
                            <Menu.Item onPress={() => logout()} title="Logout"/>
                        </Menu>
                    </View>
                </Provider>
            </Portal>

        </>
    );
};

export default function HomeStack() {

    return (
        <ChatAppStack.Navigator
            screenOptions={{
                header: ({scene, previous, navigation}) => (
                    <Header scene={scene} previous={previous} navigation={navigation}/>
                ),
            }}
        >
            <ChatAppStack.Screen
                name="Home"
                component={HomeScreen}
                options={({route, navigation}) => ({
                    title: route.params?.title || 'ROOMS',
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
                component={jjj}
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
