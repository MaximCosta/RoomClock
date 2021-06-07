import React, {useState, useEffect, useContext, useRef} from 'react';
import {View, StyleSheet, FlatList, Text, Dimensions, Animated, Switch} from 'react-native';
import {Dialog, Button, Portal, Checkbox, Colors, IconButton} from 'react-native-paper';
import {BlurView} from '@react-native-community/blur';

import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

import RoomParamScreen from './EventScreen';
import Loading from '../components/Loading';
import useStatsBar from '../utils/useStatusBar';
import {AuthContext} from '../navigation/AuthProvider';
import AddRoomScreen from './AddRoomScreen';
import GloCard from '../components/gloCard';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('screen');

export default function HomeScreen({route, navigation}) {
    useStatsBar('light-content');
    const [forceFlip,setForceFlip] = useState(Math.random());

    const [threads, setThreads] = useState([]);
    const [selectThread, setSelectThread] = useState({});
    const [loading, setLoading] = useState(true);
    const [access, setAccess] = useState([]);
    const [visible, setVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [lock, setLock] = useState(false);

    const [animation, setAnimation] = useState(new Animated.Value(height));

    const [evt, setEvt] = useState(false);
    const {user} = useContext(AuthContext);
    const currentUser = user.toJSON();

    const onToggleSwitch = () => {
        navigation.setParams({title: !evt && 'EVENT'});
        setEvt(!evt);
    };

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
    }, []);

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

    const onOpen = (op) => {
        if (lock) {
            return;
        }
        setLock(true);
        if (op === undefined) {
            op = !modalVisible;
        }

        if (op) {
            setModalVisible(op);
            Animated.timing(animation, {
                toValue: 0,
                duration: 1000,
            }).start(() => {
                setLock(false);
                setModalVisible(op);
                animation.setValue(0);
            });
        } else {
            Animated.timing(animation, {
                toValue: height,
                duration: 1000,
            }).start(() => {
                setModalVisible(op);
                animation.setValue(height);
                setLock(false);
            });
        }
    };

    const deleteAsk = (itm) => {
        setVisible(true);
        setSelectThread(itm);
    };

    async function deleteUsers() {
        setVisible(false);
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
    }

    if (loading) {
        return <Loading/>;
    }

    const modalAddJoin = () => {
        if (!modalVisible) {
            return;
        }

        const translate = {
            transform: [{
                translateY: animation,
            }],
        };

        return (
            <Animated.View style={[styles.animatedView, translate]}>
                <BlurView
                    blurType="dark"
                    blurAmount={10}
                    blurRadius={10}
                    style={{flex: 1}}
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)']}
                        start={{x: 0, y: 1}}
                        end={{x: 1, y: 1}}
                        useAngle
                        angle={110}
                        style={styles.card}
                    >
                        <AddRoomScreen route={route} navigation={navigation} close={onOpen}/>
                    </LinearGradient>
                </BlurView>
            </Animated.View>

        );
    };

    const listRoom = () => {
        return (
            <FlatList
                data={threads}
                numColumns={2}
                keyExtractor={item => item._id}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={{fontSize: 18, color: 'white'}}>Vous n'avez créer ou rejoin aucun salon</Text>
                    </View>
                )}
                renderItem={({item, index}) => (
                    <GloCard
                        item={item}
                        navigation={navigation}
                        deleteAsk={deleteAsk}
                        index={index}
                        forceFlip={forceFlip}
                        setForceFlip={setForceFlip}
                    />
                )}
            />
        );
    };

    return (
        <View style={styles.container}>

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', margin: 5}}>
                <Text style={{
                    color: '#ffffff',
                    fontFamily: 'Montserrat',
                    fontWeight: '800',
                    fontSize: 16,
                }}>
                    Event :
                </Text>
                <Switch value={evt} onValueChange={onToggleSwitch}/>
            </View>
            {evt && <RoomParamScreen route={route} navigation={navigation}/>}
            {!evt && listRoom()}
            <Portal>
                <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                    <Dialog.Title>Suppresion</Dialog.Title>
                    <Dialog.Content>
                        <View style={styles.dialAc}>
                            <Text
                                style={styles.textOther}>{selectThread.author === currentUser.uid ?
                                'Etes vous sur de vouloir supprimer le groupe.' :
                                'Etes vous sur de vouloir quitter le groupe.'}
                            </Text>
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setVisible(false)}>Cancel</Button>
                        <Button onPress={() => deleteUsers()}>Confirm</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            {modalAddJoin()}
            {!evt && <IconButton
                icon={modalVisible ? 'close-circle' : 'plus-circle'}
                color={'rgba(255,255,255,0.8)'}
                size={62}
                style={styles.fab}
                //disabled={lock}
                animated={true}
                onPress={() => onOpen(!modalVisible)}
            />}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        margin: 5,
        right: 0,
        bottom: 0,
    },
    listTitle: {
        fontFamily: 'Montserrat',
        fontStyle: 'normal',
        fontWeight: '800',
        fontSize: 24,
        color: 'rgba(255,255,255,0.8)',
    },
    listDescription: {
        fontFamily: 'Montserrat',
        fontStyle: 'normal',
        fontWeight: '500',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    textOther: {
        fontFamily: 'Montserrat',
        fontStyle: 'normal',
        fontWeight: '500',
        fontSize: 18,
        color: 'rgba(26,26,26,0.9)',
    },
    dialAc: {
        fontSize: 16,
        margin: 5,
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    emptyContainer: {
        marginTop: 24,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addRoomBorder: {
        flex: 1,
        marginTop: 5,
    },
    itemRenderContainer: {
        width: (width - 40) / 2,
        height: 105,
        margin: 10,
    },
    animatedView: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    card: {
        height: '100%',
        width: '100%',
        borderColor: 'rgba(255,255,255,0.4)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
    },
});
