import React, {useState, useContext, useEffect} from 'react';
import {GiftedChat, Bubble, Send, Composer} from 'react-native-gifted-chat';
import {ActivityIndicator, View, StyleSheet, Text} from 'react-native';
import {IconButton, ToggleButton} from 'react-native-paper';
import {AuthContext} from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import useStatsBar from '../utils/useStatusBar';
import {formatDate, dateForHumans} from '../function';

export default function RoomScreen({route, navigation}) {
    useStatsBar('light-content');

    const [forceRefresh, setForceRefresh] = useState(0);
    const [messages, setMessages] = useState([]);
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

                    if (firebaseData.event) {
                        let uEventRef = await firestore()
                            .collection('THREADS')
                            .doc(thread._id)
                            .collection('MESSAGES')
                            .doc(doc.id)
                            .collection('USERS')
                            .get();
                        let users = {};
                        if (!uEventRef.empty) {
                            uEventRef.forEach(_doc => {
                                users[_doc.data().user] = {..._doc.data(), _id: _doc.id};
                            });
                        }

                        data.text = data.text.replace('{date}', formatDate(data.for.toDate()));
                        data.text = data.text.replace('{length}', dateForHumans(data.length));
                        data.users = users;
                    }
                    messages.push(data);
                }

                //const messages = querySnapshot.docs.map(doc => {});

                //console.log(messages);

                setMessages(messages);
            });

        return () => messagesListener();
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
                <ActivityIndicator size='large' color='#6646ee'/>
            </View>
        );
    }

    function renderSend(props) {
        return (
            <Send {...props}>
                <View style={styles.sendingContainer}>
                    <IconButton icon='send' size={24} color='#6646ee'/>
                </View>
            </Send>
        );
    }

    function renderComposer(props) {
        return (
            <View style={[styles.sendingContainer, {flex: 1}]}>
                <IconButton
                    icon='calendar'
                    size={24}
                    color='#6646ee'
                    onPress={() => navigation.navigate('Event', route.params.thread)}/>
                <Composer {...props} />
            </View>
        );
    }

    function scrollToBottomComponent() {
        return (
            <View style={styles.bottomComponentContainer}>
                <IconButton icon='chevron-double-down' size={36} color='#6646ee'/>
            </View>
        );
    }

    async function setCheck(choice, _id) {
        await firestore()
            .collection('THREADS')
            .doc(thread._id)
            .collection('MESSAGES')
            .doc(_id)
            .collection('USERS')
            .add({choice: choice, user: currentUser.uid});
        setForceRefresh(Math.random());

    }

    function renderEvent(props) {
        let currentMsg = props.currentMessage;

        if (!currentMsg) {
            return;
        }

        if (!currentMsg.event) {
            return;
        }

        if (currentMsg.users && currentMsg.users.hasOwnProperty(currentUser.uid)) {
            //console.log(currentMsg.users);
            return (
                <ToggleButton
                    icon={currentMsg.users[currentUser.uid].choice ? 'check' : 'close'}
                    value="center"
                />
            );
        }

        if (currentMsg.for.toDate() > new Date()) {
            return (
                <ToggleButton.Row onValueChange={value => setCheck(value, currentMsg._id)}>
                    <ToggleButton icon="check" value={true}/>
                    <ToggleButton icon="close" value={false}/>
                </ToggleButton.Row>
            );
        }

        return <Text>evenement passé</Text>;
    }

    function renderSystemMessage(props) {
        return (
            <View style={styles.systemMessagerContainer}
                  key={props.currentMessage._id}>
                <View style={styles.systemMessageWrapper}>
                    <Text style={styles.systemMessageText}>
                        {props.currentMessage.text}
                    </Text>
                </View>
                {renderEvent(props)}
            </View>
        );
    }

    return (
        <GiftedChat
            messages={messages}
            onSend={handleSend}
            user={{_id: currentUser.uid}}
            placeholder='Type your message here...'
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
    systemMessageText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
    },
});
