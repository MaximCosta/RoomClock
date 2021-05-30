import React, {useState, useEffect, useContext} from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity, Text, Alert} from 'react-native';
import {List, Divider, Dialog, Button, Portal, Title, Checkbox, Colors, IconButton} from 'react-native-paper';

import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';


import Loading from '../components/Loading';
import useStatsBar from '../utils/useStatusBar';
import {AuthContext} from '../navigation/AuthProvider';

export default function HomeScreen({navigation}) {
    useStatsBar('light-content');
    const [forceReload, setForceReload] = useState(Math.random());
    const [threads, setThreads] = useState([]);
    const [selectThread, setSelectThread] = useState({});
    const [loading, setLoading] = useState(true);
    const [access, setAccess] = useState([]);
    const [visible, setVisible] = useState(false);
    const {user} = useContext(AuthContext);
    const currentUser = user.toJSON();

    useEffect(() => {
        const accesT = database().ref(`/users/${currentUser.uid}/threads`).on('value', snapshot => {
            if (snapshot) {
                if (snapshot.val()) {
                    setAccess(Object.keys(snapshot.val()));
                } else {
                    setAccess([]);
                }
            }
        });
        return () => accesT();
    }, [forceReload]);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('THREADS')
            .orderBy('latestMessage.createdAt', 'desc')
            .onSnapshot(querySnapshot => {
                if (querySnapshot && !querySnapshot.empty) {
                    let filter = querySnapshot.docs.filter(v => access.includes(v.id));
                    const threads = filter.map(documentSnapshot => {
                        return {
                            _id: documentSnapshot.id,
                            // give defaults
                            name: '',

                            latestMessage: {
                                text: '',
                            },
                            ...documentSnapshot.data(),
                        };
                    });

                    setThreads(threads);
                }
                if (loading) {
                    setLoading(false);
                }
            });

        /**
         * unsubscribe listener
         */
        return () => unsubscribe();
    }, [access]);

    async function deleteUsers() {
        let uData, pin;
        if (selectThread.author === currentUser.uid) {
            uData = await firestore().collection('THREADS').doc(selectThread._id);
            uData.collection('USERS').get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    database().ref(`/users/${doc.data().uid}/threads/${selectThread._id}`).remove();
                });
            });
            pin = await database().ref('/pin/').child(selectThread._id).once('value');
            uData.delete();
            database().ref('/pin/').child(selectThread._id).remove();
            database().ref('/pin/').child(pin.val()).remove();
            database().ref('/sondage/').child(selectThread._id).remove();


        } else {
            database().ref(`/users/${currentUser.uid}/threads/${selecThread._id}`).remove();
            uData = await firestore().collection('THREADS').doc(selectThread._id).collection('USERS').where('uid', '==', user.uid);
            uData.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    doc.ref.delete();
                });
            });
        }
        setForceReload(Math.random());
        setVisible(false);
    }

    if (loading) {
        return <Loading/>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={threads}
                keyExtractor={item => item._id}
                ItemSeparatorComponent={() => <Divider/>}
                renderItem={({item}) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Room', {thread: item})}
                        onLongPress={() => {
                            setVisible(true);
                            setSelectThread(item);
                        }}
                    >
                        <List.Item
                            title={item.name}
                            description={item.latestMessage.text}
                            titleNumberOfLines={1}
                            titleStyle={styles.listTitle}
                            descriptionStyle={styles.listDescription}
                            descriptionNumberOfLines={1}
                        />
                    </TouchableOpacity>
                )}
            />
            <Portal>
                <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                    <Dialog.Title>Manage</Dialog.Title>
                    <Dialog.Content>
                        <View style={styles.dialAc}>
                            <Title style={styles.listDescription}>Muter le groupe</Title>
                            <Checkbox status={true}/>
                        </View>
                        <View style={styles.dialAc}>
                            <Title
                                style={styles.listDescription}>{selectThread.author === currentUser.uid ? 'Supprimer le groupe' : 'Quitter le groupe'}</Title>
                            <IconButton
                                icon="delete"
                                color={Colors.red500}
                                size={20}
                                onPress={() => deleteUsers()}
                            />
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setVisible(false)}>Finish</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f5f5f5',
        flex: 1,
    },
    listTitle: {
        fontSize: 22,
    },
    listDescription: {
        fontSize: 16,
    },
    dialAc: {
        fontSize: 16,
        margin: 5,
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
