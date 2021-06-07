import React, {createContext, useState} from 'react';
import {View, StyleSheet, Button, Alert} from 'react-native';
import auth from '@react-native-firebase/auth';

/**
 * This provider is created
 * to access user in whole app
 */

export const AuthContext = createContext({});

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login: async (email, password) => {
                    try {
                        await auth().signInWithEmailAndPassword(email, password);
                    } catch (e) {
                        console.log(e);
                        Alert.alert('Error Login', e.toString(), [{
                            text: 'OK',
                            onPress: () => console.log('OK Pressed'),
                        }]);
                    }
                },
                register: async (email, password) => {
                    try {
                        await auth().createUserWithEmailAndPassword(email, password);
                    } catch (e) {
                        Alert.alert('Error Register', e.toString(), [{
                            text: 'OK',
                            onPress: () => console.log('OK Pressed'),
                        }]);
                    }
                },
                logout: async () => {
                    try {
                        await auth().signOut();
                    } catch (e) {
                        Alert.alert('Error Logout', e.toString(), [{
                            text: 'OK',
                            onPress: () => console.log('OK Pressed'),
                        }]);
                    }
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
