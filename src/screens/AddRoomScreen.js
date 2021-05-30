import React, {useContext, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {IconButton, Title} from 'react-native-paper';

import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import useStatsBar from '../utils/useStatusBar';
import {AuthContext} from '../navigation/AuthProvider';
import {getRandomizer} from '../function';

export default function AddRoomScreen({navigation}) {
    useStatsBar('dark-content');
    const [roomName, setRoomName] = useState('');
    const [roomPin, setRoomPin] = useState('');

    const {user} = useContext(AuthContext);
    const currentUser = user.toJSON();

    /**

     * Create a new Firestore collection to save threads
     */
    function handleButtonPressCreate() {
        if (roomName.length > 0) {
            firestore()
                .collection('THREADS')
                .add({
                    name: roomName,
                    author: currentUser.uid,
                    latestMessage: {
                        text: `You have joined the room ${roomName}.`,
                        createdAt: new Date().getTime(),
                    },
                })
                .then(docRef => {
                    let data = {};
                    data[`/users/${currentUser.uid}/threads/${docRef.id}`] = {
                        uid: docRef.id,
                        mute: false,
                    };
                    database().ref().update(data);

                    database().ref(`/pin`).once('value').then(snapchot => {
                        let current = [];
                        if (snapchot.val()) {
                            current.push(...Object.keys(snapchot.val()));
                        }
                        let rand;
                        do {
                            rand = getRandomizer(0, 999999).toString().padStart(6, 0);
                        } while (current.includes(rand));
                        database().ref(`/pin`).child(rand).set(docRef.id);
                        database().ref(`/pin`).child(docRef.id).set(rand);
                    });


                    docRef.collection('MESSAGES').add({
                        text: `${currentUser.email} have created the room ${roomName}.`,
                        createdAt: new Date().getTime(),
                        system: true,
                    });
                    docRef.collection('USERS').add({
                        uid: currentUser.uid,
                        email: currentUser.email,
                    });
                    navigation.navigate('Home');
                });
        }
    }

    function handleJoin(snapchot) {
        //database().ref(`/users/${currentUser.uid}/threads`).push(snapchot.val());
        let data = {};
        data[`/users/${currentUser.uid}/threads/${snapchot.val()}`] = {
            uid: snapchot.val(),
            mute: false,
        };
        database().ref().update(data);
        firestore().collection('THREADS').doc(snapchot.val()).collection('USERS').add({
            uid: currentUser.uid,
            email: currentUser.email,
        });
        firestore().collection('THREADS').doc(snapchot.val()).collection('MESSAGES').add({
            text: `${currentUser.email} have joined the room ${roomName}.`,
            createdAt: new Date().getTime(),
            system: true,
        });
        navigation.navigate('Home');
    }

    function handleButtonPressJoin() {
        if (roomPin.length > 0) {
            database().ref(`/pin/${roomPin}`).once('value').then(snapchot => {
                if (snapchot.val()) {
                    database().ref(`/users/${currentUser.uid}/threads`).once('value').then(snapshot_user => {
                        if (snapshot_user.val()) {
                            if (!Object.values(snapshot_user.val()).includes(snapchot.val())) {
                                handleJoin(snapchot);
                            }
                        } else {
                            handleJoin(snapchot);
                        }
                    });
                }
            });
        }
    }

    return (
        <View style={styles.rootContainer}>
            <View style={styles.closeButtonContainer}>
                <IconButton
                    icon="close-circle"
                    size={36}
                    color="#6646ee"
                    onPress={() => navigation.goBack()}
                />
            </View>
            <View style={styles.innerContainer}>
                <Title style={styles.title}>Create a new chat room</Title>
                <FormInput
                    labelName="Room Name"
                    value={roomName}
                    onChangeText={text => setRoomName(text)}
                    clearButtonMode="while-editing"
                />
                <FormButton
                    title="Create"
                    modeValue="contained"
                    labelStyle={styles.buttonLabel}
                    onPress={() => handleButtonPressCreate()}
                    disabled={roomName.length === 0}
                />
            </View>

            <View style={styles.innerContainer}>
                <Title style={styles.title}>Join a chat room</Title>
                <FormInput
                    labelName="Room Pin"
                    value={roomPin}
                    onChangeText={text => setRoomPin(text)}
                    clearButtonMode="while-editing"
                    keyboardType="numeric"
                />
                <FormButton
                    title="Join"
                    modeValue="contained"
                    labelStyle={styles.buttonLabel}
                    onPress={() => handleButtonPressJoin()}
                    disabled={roomPin.length === 0}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
    },
    closeButtonContainer: {
        position: 'absolute',
        top: 30,
        right: 0,
        zIndex: 1,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
    },
    buttonLabel: {
        fontSize: 22,
    },
});
