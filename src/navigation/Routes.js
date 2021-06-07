import React, {useContext, useState, useEffect} from 'react';
import {Appearance, AppearanceProvider, useColorScheme} from 'react-native-appearance';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

import AuthStack from './AuthStack';
import HomeStack from './HomeStack';
import {AuthContext} from './AuthProvider';
import Loading from '../components/Loading';

export default function Routes() {
    const {user, setUser} = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(true);

    // Handle user state changes
    function onAuthStateChanged(user) {
        setUser(user);
        if (initializing) {
            setInitializing(false);
        }
        setLoading(false);
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    if (loading) {
        return <Loading/>;
    }

    const MyTheme = {
        colors: {
            primary: 'rgb(255, 45, 85)',
            background: 'rgb(27, 27, 27)',
            card: 'rgb(27, 27, 27)',
            text: 'rgb(255,255,255)',
            border: 'rgb(207,0,0)',
            notification: 'rgb(255, 69, 58)',
            placeholder: '#808080',
        },
    };

    return (
        <AppearanceProvider>
            <NavigationContainer theme={MyTheme}>
                {user ? <HomeStack/> : <AuthStack/>}
            </NavigationContainer>
        </AppearanceProvider>
    );
}
