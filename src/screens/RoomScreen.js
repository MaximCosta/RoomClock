import React, {useState, useContext, useEffect} from 'react';
import {GiftedChat, Bubble, Send, Composer} from 'react-native-gifted-chat';
import {ActivityIndicator, View, StyleSheet, Text} from 'react-native';
import {IconButton, ToggleButton} from 'react-native-paper';
import {AuthContext} from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import useStatsBar from '../utils/useStatusBar';
import {formatDate, dateForHumans, formatDateTime, printEventDate} from '../function';
import database from '@react-native-firebase/database';

export default function RoomScreen({route, navigation}) {
    useStatsBar('light-content');

    const allColor = ['Tomate', 'Mandarine', 'Banane', 'Basilic', 'Sauge', 'Paon', 'Myrtille', 'Lavande', 'Raisin', 'Flamant rose', 'Graphite', 'Couleur par défaut'];
    const allColorHex = ['#EA5553', '#F26F45', '#EBC252', '#44946A', '#48B382', '#2FA8E3', '#858EE1', '#7E8BCB', '#C878DB', '#DE857D', '#949493', '#7E8ACB'];

    const [forceRefresh, setForceRefresh] = useState(0);
    const [messages, setMessages] = useState([]);
    const [event, setEvent] = useState([]);
    const {thread} = route.params;
    const {user} = useContext(AuthContext);
    const currentUser = user.toJSON();

    async function handleSend(messages) {
        const text = messages[0].text;

        await firestore()
            .collection('THREADS')
            .doc(thread._id)
            .collection('MESSAGES')
            .add({
                text,
                createdAt: new Date().getTime(),
                user: {
                    _id: currentUser.uid,
                    email: currentUser.email,
                },
            });

        await firestore()
            .collection('THREADS')
            .doc(thread._id)
            .set(
                {
                    latestMessage: {
                        text,
                        createdAt: new Date().getTime(),
                    },
                },
                {merge: true},
            );
    }

    useEffect(() => {
        const messagesListener = firestore()
            .collection('THREADS')
            .doc(thread._id)
            .collection('MESSAGES')
            .orderBy('createdAt', 'desc')
            .onSnapshot(async querySnapshot => {

                let messages = [];

                for (const doc of querySnapshot.docs) {
                    const firebaseData = doc.data();

                    const data = {
                        _id: doc.id,
                        text: '',
                        createdAt: new Date().getTime(),
                        ...firebaseData,
                    };

                    if (!firebaseData.system) {
                        data.user = {
                            ...firebaseData.user,
                            name: firebaseData.user.email,
                        };
                    }

                    messages.push(data);
                }

                setMessages(messages);
            });

        return () => messagesListener();
    }, [forceRefresh]);

    useEffect(() => {
        const sfRef = database().ref(`/sondage/${thread._id}`);
        const eventListener = sfRef.on('value', (snapshot => {
                if (snapshot) {
                    const data = snapshot.val();
                    if (data) {
                        let uArray = [];
                        for (const [key, value] of Object.entries(data)) {
                            // let uiArray = {};
                            // if (value && value.users) {
                            //     for (const [_uid, _data] of Object.entries(value.users)) {
                            //         uiArray[_uid] = {choice: _data, user: _uid};
                            //     }
                            // }
                            // value.users = uiArray;
                            uArray.push({...value, _id: key});
                        }
                        setEvent(uArray);
                    } else {
                        setEvent([]);
                    }
                } else {
                    setEvent([]);
                }
            }),
        );
        return () => eventListener();
    }, [forceRefresh]);

    function renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: '#6646ee',
                    },
                }}
                textStyle={{
                    right: {
                        color: '#fff',
                    },
                }}
            />
        );
    }

    function renderLoading() {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6646ee"/>
            </View>
        );
    }

    function renderSend(props) {
        return (
            <Send {...props}>
                <View style={styles.sendingContainer}>
                    <IconButton icon="send" size={24} color="#6646ee"/>
                </View>
            </Send>
        );
    }

    function renderComposer(props) {
        return (
            <View style={[styles.sendingContainer, {flex: 1}]}>
                <IconButton
                    icon="calendar"
                    size={24}
                    color="#6646ee"
                    onPress={() => navigation.navigate('Event', route.params.thread)}/>
                <Composer {...props} />
            </View>
        );
    }

    function scrollToBottomComponent() {
        return (
            <View style={styles.bottomComponentContainer}>
                <IconButton icon="chevron-double-down" size={36} color="#6646ee"/>
            </View>
        );
    }

    async function setCheck(choice, _id) {
        let upData = {};
        upData[`/sondage/${thread._id}/${_id}/users/${currentUser.uid}`] = choice;
        database().ref().update(upData);

        let currEvent = event.filter(e => e._id === _id)[0];

        if (currEvent.users) {
            delete currEvent.users;
            delete currEvent.user;
            delete currEvent.system;
        }

        if (Object.values(upData)[0] === true) {
            upData = {};
            upData[`/users/${currentUser.uid}/threads/${thread._id}/events/${_id}`] = {
                alarm: false,
                note: '',
                delnot: false,
                ...currEvent,
            };
            database().ref().update(upData);
        }
    }

    function renderEvent(props) {
        ;
        let currentMessage = props.currentMessage;
        //let currentMsg = event.filter(e => e.msgID === currentMessage._id)[0];

        if (!currentMessage.event) {
            return (
                <View style={styles.systemMessageWrapper}>
                    <Text style={styles.systemMessageText}>
                        {currentMessage.text}
                    </Text>
                </View>
            );
        }

        const Utrue = Object.values(currentMessage.users || []).filter(e => e).length;
        const Ufalse = Object.values(currentMessage.users || []).filter(e => !e).length;

        if (currentMessage.users && currentMessage.users.hasOwnProperty(currentUser.uid)) {
            return (
                <>
                    <View
                        style={[styles.systemMessageWrapper, {backgroundColor: allColorHex[allColor.indexOf(currentMessage.color)]}]}>
                        <Text style={styles.systemMessageTextTitle}>
                            {currentMessage.title}
                        </Text>
                        {currentMessage.desc != '' && <Text style={styles.systemMessageTextDesc}>
                            {currentMessage.desc}
                        </Text>}
                        <Text>{printEventDate(currentMessage)}</Text>
                        <View style={styles.fa}>
                            <Text>Stats : </Text>
                            <View style={styles.fa}>
                                <ToggleButton icon="check" size={16}/>
                                <Text>{Utrue}</Text>
                            </View>
                            <View style={styles.fa}>
                                <ToggleButton icon="close" size={16}/>
                                <Text>{Ufalse}</Text>
                            </View>
                        </View>
                    </View>
                    <ToggleButton
                        icon={currentMessage.users[currentUser.uid] ? 'check' : 'close'}
                        value="center"
                    />
                </>
            );
        }

        if (new Date(currentMessage.dateF) > new Date()) {
            return (
                <>
                    <View
                        style={[styles.systemMessageWrapper, {backgroundColor: allColorHex[allColor.indexOf(currentMessage.color)]}]}>
                        <Text style={styles.systemMessageTextTitle}>
                            {currentMessage.title}
                        </Text>
                        {currentMessage.desc != '' && <Text style={styles.systemMessageTextDesc}>
                            {currentMessage.desc}
                        </Text>}
                        <Text>{printEventDate(currentMessage)}</Text>
                        <View style={styles.fa}>
                            <Text>Stats : </Text>
                            <View style={styles.fa}>
                                <ToggleButton icon="check" size={16}/>
                                <Text>{Utrue}</Text>
                            </View>
                            <View style={styles.fa}>
                                <ToggleButton icon="close" size={16}/>
                                <Text>{Ufalse}</Text>
                            </View>
                        </View>
                    </View>
                    <ToggleButton.Row onValueChange={value => setCheck(value, currentMessage._id)}>
                        <ToggleButton icon="check" value={true}/>
                        <ToggleButton icon="close" value={false}/>
                    </ToggleButton.Row>
                </>

            );
        }

        return <Text>evenement passé</Text>;
    }

    function renderSystemMessage(props) {
        return (
            <View style={styles.systemMessagerContainer}
                  key={props.currentMessage._id}>
                {renderEvent(props)}
            </View>
        );
    }

    return (
        <GiftedChat
            messages={[...messages, ...event].sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1)}
            onSend={handleSend}
            user={{_id: currentUser.uid}}
            placeholder="Type your message here..."
            showUserAvatar
            alwaysShowSend
            scrollToBottom
            renderBubble={renderBubble}
            renderLoading={renderLoading}
            renderComposer={renderComposer}
            renderSend={renderSend}
            scrollToBottomComponent={scrollToBottomComponent}
            renderSystemMessage={renderSystemMessage}
        />
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomComponentContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    systemMessagerContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        marginLeft: 20,
        marginRight: 20,
    },
    systemMessageWrapper: {
        alignItems: 'center',
        backgroundColor: '#6646ee',
        borderRadius: 4,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
    },

    systemMessageTextTitle: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    systemMessageText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
    },
    systemMessageTextDesc: {
        fontSize: 12,
        color: '#fff',
    },
    fa: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
