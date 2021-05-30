import React, {useState, useEffect, useContext} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Divider, Text, Title, Subheading, IconButton, Switch, Colors} from 'react-native-paper';

import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

import Loading from '../components/Loading';
import useStatsBar from '../utils/useStatusBar';
import {AuthContext} from '../navigation/AuthProvider';
import {getRandomizer} from '../function';


export default function RoomParamScreen({route, navigation}) {
    useStatsBar('light-content');

    const [users, setUsers] = useState([]);
    const [pin, setPin] = useState('');
    const [isSwitchOn, setIsSwitchOn] = React.useState(false);

    //const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);
    const {user} = useContext(AuthContext);
    const currentUser = user.toJSON();
    let threadInfo = route.params;

    //
    // Array.prototype.move = function(from, to) {
    //     this.splice(to, 0, this.splice(from, 1)[0]);
    // };

    useEffect(() => {
        const getUsers = firestore()
            .collection('THREADS')
            .doc(threadInfo._id)
            .collection('USERS')
            .orderBy('email', 'desc')
            .onSnapshot(querySnapshot => {
                if (!querySnapshot || querySnapshot.empty) {
                    return;
                } else {
                    let uArray = [];
                    querySnapshot.forEach(us => {
                        if (us.data().uid === threadInfo.author) {
                            uArray.unshift({...us.data(), msgID: us.id});
                            return;
                        }
                        uArray.push({...us.data(), msgID: us.id});
                    });
                    setUsers(uArray);
                }
            });

        return () => getUsers();
    }, []);

    useEffect(() => {
        const getPin = database().ref(`/pin/${threadInfo._id}/`).on('value', snapshot => {
            if (!snapshot || snapshot.empty || snapshot.length > 1) {
            } else {
                setPin(snapshot.val());
            }
        });
        return () => getPin();
    }, []);

    useEffect(() => {
        const getPin = database().ref(`/pin/${pin || 1}/`).on('value', snapshot => {
            if (!snapshot || snapshot.empty || !snapshot.val()) {
                setIsSwitchOn(false);
            } else if (typeof snapshot.val() === 'object') {
                setIsSwitchOn(false);
            } else {
                setIsSwitchOn(true);
            }
        });
        return () => getPin();
    }, [pin]);

    async function deleteUsers(user) {
        await database().ref(`/users/${user.uid}/threads/${threadInfo._id}`).remove();
        await firestore().collection('THREADS').doc(threadInfo._id).collection('USERS').doc(user.msgID).delete();
    }

    async function onOffPin() {
        if (isSwitchOn) {
            database().ref('/pin/').child(pin).remove();
        } else {
            database().ref('/pin/').child(pin).set(threadInfo._id);
        }
    }

    async function renewPin() {
        await database().ref('/pin/').child(pin).remove();
        await database().ref('/pin/').child(threadInfo._id).remove();
        database().ref(`/pin`).once('value').then(snapchot => {
            var current = [];
            if (snapchot.val()) {
                current.push(...Object.keys(snapchot.val()));
            }
            var rand;
            do {
                rand = getRandomizer(0, 999999).toString().padStart(6, 0);
            } while (current.includes(rand));
            database().ref(`/pin`).child(rand).set(threadInfo._id);
            database().ref(`/pin`).child(threadInfo._id).set(rand);
        });
    }

    function reIcon(item) {

        if (currentUser.uid === threadInfo.author) {
            if (item.uid !== threadInfo.author) {
                return <IconButton onPress={() => deleteUsers(item)} color={Colors.red500} icon="delete"/>;
            }
        }

        if (item.uid === threadInfo.author) {
            return <IconButton icon="crown"/>;
        }
    }


    if (!users.length && pin) {
        return <Loading/>;
    }

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Pin</Title>
            <View style={{marginLeft: 20, marginTop: 20, flexDirection: 'row'}}>
                <Text style={styles.pin}>{pin}</Text>
                {currentUser.uid === threadInfo.author && <IconButton
                    icon="autorenew"
                    onPress={() => renewPin()}
                />}
                {currentUser.uid === threadInfo.author && <Switch value={isSwitchOn} onValueChange={onOffPin}/>}
                {currentUser.uid !== threadInfo.author &&
                <Text style={styles.pinInfo}>{isSwitchOn ? 'public' : 'private'}</Text>}
            </View>

            <Title style={styles.title}>Users</Title>
            <FlatList
                data={users}
                keyExtractor={item => item.uid}
                ItemSeparatorComponent={() => <Divider/>}
                renderItem={({item}) => (
                    <View style={{marginLeft: 20, marginTop: 20, flexDirection: 'row'}}>
                        <View style={{flex: 1}}>
                            <Title style={styles.listTitle}>{item.email}</Title>
                            <Subheading style={styles.listDescription}>{item.uid}</Subheading>
                        </View>
                        <View style={{alignItems: 'center'}}>
                            {reIcon(item)}
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f5f5f5',
        flex: 1,
    },
    pin: {
        flex: 1,
        fontSize: 20,
    },
    title: {
        marginTop: 50,
        alignSelf: 'center',
        fontSize: 26,
    },
    listTitle: {
        fontSize: 22,
    },
    listDescription: {
        fontSize: 16,
    },
    pinInfo: {
        fontSize: 18,
        marginRight: 20,
    },
});
