import React, {useContext, useState} from 'react';
import {View, StyleSheet, TextInput, Dimensions, Text, Keyboard} from 'react-native';
import {IconButton, RadioButton, Title} from 'react-native-paper';

import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import useStatsBar from '../utils/useStatusBar';
import {AuthContext} from '../navigation/AuthProvider';
import {getColorPack, getRandomizer} from '../function';
import {useTheme} from '@react-navigation/native';

const {width, height} = Dimensions.get('screen');

export default function AddRoomScreen({route, navigation, close}) {
    useStatsBar('dark-content');
    const [roomName, setRoomName] = useState('');
    const [roomPin, setRoomPin] = useState('');
    const [colorR, setColorR] = useState(getColorPack(1)[0]);
    const {user} = useContext(AuthContext);
    const {colors} = useTheme();

    const currentUser = user.toJSON();

    function timeout(ms) { //pass a time in milliseconds to this function
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function handleButtonPressCreate() {
        Keyboard.dismiss();
        if (roomName.length > 0) {
            close(false);
            await timeout(1000);
            firestore()
                .collection('THREADS')
                .add({
                    name: roomName,
                    color: colorR,
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
                });
        }
    }

    async function handleJoin(snapchot) {
        close(false);
        await timeout(1000);
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
    }

    function handleButtonPressJoin() {
        Keyboard.dismiss();
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

            <View>
                <Text style={styles.title}>Join Room</Text>
                <View style={{flexDirection: 'row', width: 80 / 100 * width}}>
                    <TextInput
                        placeholder="Room Pin"
                        placeholderTextColor={colors.placeholder}
                        autoCapitalize="none"
                        value={roomPin}
                        onChangeText={text => setRoomPin(text)}
                        clearButtonMode="while-editing"
                        keyboardType="numeric"
                        style={[styles.formInputText, {
                            width: 80 / 100 * width - 75,
                            marginRight: 7,
                            color: colors.text,
                        }]}

                    />
                    <IconButton
                        icon="check"
                        color="#A8A8A8"
                        size={35}
                        style={styles.checkBtn}
                        onPress={() => handleButtonPressJoin()}
                        disabled={roomPin.length === 0}
                    />
                </View>
            </View>
            <View>
                <Text style={styles.title}>Create Room</Text>
                <View style={{flexDirection: 'row', width: 80 / 100 * width}}>
                    <TextInput
                        placeholder="Room Name"
                        placeholderTextColor={colors.placeholder}
                        value={roomName}
                        autoCapitalize="none"
                        onChangeText={text => setRoomName(text)}
                        clearButtonMode="while-editing"
                        style={[styles.formInputText, {
                            width: 80 / 100 * width - 75,
                            marginRight: 7,
                            color: colors.text,
                        }]}

                    />
                    <IconButton
                        icon="check"
                        color="#A8A8A8"
                        size={35}
                        style={styles.checkBtn}
                        onPress={() => handleButtonPressCreate()}
                        disabled={roomName.length === 0}
                    />
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{color: 'rgba(255, 255, 255, 0.5)'}}>Color : </Text>
                    <RadioButton.Group onValueChange={nv => setColorR(nv)} value={colorR}>
                        {getColorPack(1).map(cr => {
                            return (
                                <View key={cr} style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <RadioButton
                                        value={cr}
                                        uncheckedColor={cr}
                                        color={cr}
                                    />
                                </View>
                            );
                        })}
                    </RadioButton.Group>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',

    },
    title: {
        fontFamily: 'Montserrat',
        fontStyle: 'normal',
        fontWeight: '800',
        fontSize: 48,
        color: 'rgba(255,255,255,0.8)',
    },
    loginButtonLabel: {
        fontSize: 22,
    },
    navButtonText: {
        color: '#3DAFB6',
        fontSize: 14,
        fontFamily: 'Montserrat',
        fontWeight: '700',
        marginRight: 15,
    },
    formInputText: {
        marginTop: 30,
        paddingLeft: 15,
        paddingRight: 15,

        height: 60,

        fontSize: 16,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',

        borderRadius: 50,
        borderColor: 'rgba(255,255,255,0.8)',
        borderWidth: 4,
    },
    checkBtn: {
        borderRadius: 50,
        borderColor: 'rgba(255,255,255,0.8)',
        borderWidth: 4,
        height: 60,
        width: 60,
        fontSize: 16,
        marginTop: 30,
        marginLeft: 7,
    },
});
