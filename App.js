import React, {Fragment, useEffect} from 'react';
import Providers from './src/navigation';

import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Alert,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';


export default function App() {
    // const requestUserPermission = async () => {
    //     const authStatus = await messaging().requestPermission();
    //     const enabled =
    //         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //         authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    //     if (enabled) {
    //         getFcmToken(); //<---- Add this
    //         console.log('Authorization status:', authStatus);
    //     }
    // };
    //
    // const getFcmToken = async () => {
    //     const fcmToken = await messaging().getToken();
    //     if (fcmToken) {
    //         console.log(fcmToken);
    //         console.log('Your Firebase Token is:', fcmToken);
    //     } else {
    //         console.log('Failed', 'No token received');
    //     }
    // };
    //
    // useEffect(() => {
    //     requestUserPermission();
    //     const unsubscribe = messaging().onMessage(async remoteMessage => {
    //         Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    //     });
    //     return unsubscribe;
    // }, []);

    return <Providers/>;
}
