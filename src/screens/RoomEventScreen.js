import React, {useState, useEffect, useContext} from 'react';
import {View, StyleSheet, FlatList, TextInput} from 'react-native';
import {
    Dialog,
    Portal,
    Paragraph,
    Divider,
    Text,
    Title,
    Subheading,
    IconButton,
    Colors,
    ToggleButton,
    Button,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';


import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

import Loading from '../components/Loading';
import useStatsBar from '../utils/useStatusBar';
import {AuthContext} from '../navigation/AuthProvider';
import {dateForHumans, formatDate} from '../function';


export default function RoomParamScreen({route, navigation}) {
    useStatsBar('light-content');

    const [event, setEvent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date(1598051730000));
    const [mode, setMode] = useState('date');
    const [display, setDisplay] = useState('default');
    const [show, setShow] = useState(false);
    const [step, setStep] = useState(0);

    const [visible, setVisible] = React.useState(false);

    const showDialog = () => setVisible(true);

    const hideDialog = () => setVisible(false);


    const {user} = useContext(AuthContext);
    const currentUser = user.toJSON();
    let threadInfo = route.params;

    useEffect(() => {
        const sfRef = firestore().collection('THREADS').doc(threadInfo._id).collection('MESSAGES');
        const getUsers = sfRef
            .orderBy('createdAt', 'asc')
            .where('event', '==', true)
            .onSnapshot(async querySnapshot => {
                if (!querySnapshot || querySnapshot.empty) {
                    console.log('Erreur pas d\'évenement prévus');
                } else {
                    let uArray = [];
                    for (const us of querySnapshot.docs) {
                        let data = us.data();
                        let usersVote = await sfRef.doc(us.id).collection('USERS').get();
                        let uiArray = [];

                        if (usersVote && !usersVote.empty) {
                            for (const _us of usersVote.docs) {
                                //console.log((_us.id), '=>', {..._us.data(), msgID: _us.id, parent: us.id});
                                uiArray.push({..._us.data(), msgID: _us.id});
                            }
                        }

                        data.users = uiArray;
                        data.text = data.text.replace('{date}', formatDate(data.for.toDate()));
                        data.text = data.text.replace('{length}', dateForHumans(data.length));
                        //console.log(us.id, '=>', {...data, msgID: us.id});
                        uArray.push({...data, msgID: us.id});
                    }

                    setEvent(uArray);
                }
                setLoading(false);
            });

        return () => getUsers();
    }, []);

    const onChange = (event, selectedDate) => {
        console.log(selectedDate)
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const showMode = (currentMode, _display = 'default') => {
        if (display !== _display) {
            setDisplay(_display);
        }
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date', 'default');
    };

    const showTimepicker = () => {
        showMode('time', 'default');
    };

    const showSpinnerpicker = () => {
        showMode('time', 'spinner');
    };


    // async function deleteUsers(user) {
    //     let uData = await database().ref(`/users/${user.uid}/threads`).once('value');
    //     const key = Object.keys(uData.val()).find(key => uData.val()[key] === threadInfo._id);
    //     database().ref(`/users/${user.uid}/threads`).child(key).remove();
    //     uData = await firestore().collection('THREADS').doc(threadInfo._id).collection('USERS').doc(user.msgID);
    //     uData.delete();
    // }


    function reIcon(item) {
        // onPress={() => deleteUsers(item)}
        if (currentUser.uid === threadInfo.author) {
            return <IconButton color={Colors.red500} icon="delete"/>;
        }

    }

    function renderMaker() {
        return (
            <>
                <Title style={styles.title}>Créer un Event</Title>

                <Button onPress={showDialog}>Show Dialog</Button>
                {/*<View style={[styles.statsContainer, {justifyContent: 'space-around'}]}>*/}
                {/*    <View>*/}
                {/*        <Text>la date</Text>*/}
                {/*        <IconButton onPress={showDatepicker} color={Colors.blue500} icon="calendar-outline"/>*/}
                {/*    </View>*/}
                {/*    <View>*/}
                {/*        <Text>l'heure</Text>*/}
                {/*        <IconButton onPress={showTimepicker} color={Colors.blue500} icon="clock-outline"/>*/}
                {/*    </View>*/}
                {/*    <View>*/}
                {/*        <Text>durée</Text>*/}
                {/*        <IconButton onPress={showSpinnerpicker} color={Colors.blue500} icon="timer-outline"/>*/}
                {/*    </View>*/}
                {/*</View>*/}
            </>
        );
    }

    function renderModal() {
        switch (step) {
            case 0:
                return (
                    <View>
                        <Text>la date : {date.toDateString()}</Text>
                        <IconButton onPress={showDatepicker} color={Colors.blue500} icon="calendar-outline"/>
                    </View>
                );
            case 1:
                return (
                    <View>
                        <Text>l'heure : {date.toDateString()}</Text>
                        <IconButton onPress={showTimepicker} color={Colors.blue500} icon="clock-outline"/>
                    </View>
                );
            case 2:
                return (
                    <View>
                        <Text>durée : {date.toDateString()}</Text>
                        <IconButton onPress={showSpinnerpicker} color={Colors.blue500} icon="timer-outline"/>
                    </View>
                );
            case 3:
                return (
                    <View>
                        <Text>{'{date} = date  {heure} = heure  {duree} = duree'}</Text>
                        <View style={styles.textAreaContainer}>
                            <TextInput
                                style={styles.textArea}
                                underlineColorAndroid="transparent"
                                placeholder="Type something"
                                placeholderTextColor="grey"
                                multiline={true}
                                numberOfLines={10}
                                // onChangeText={(text) => this.setState({text})}
                                // value={this.state.text}
                            />
                        </View>
                    </View>
                );
        }
    }

    if (loading) {
        return <Loading/>;
    }

    return (
        <View style={styles.container}>

            {currentUser.uid === threadInfo.author && renderMaker()}

            <Title style={styles.title}>Events</Title>
            <FlatList
                data={event}
                keyExtractor={item => item.msgID}
                ItemSeparatorComponent={() => <Divider/>}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text>Pas d'evenement</Text>
                    </View>
                )}
                renderItem={({item}) => (
                    <View style={{marginLeft: 20, marginTop: 20, flexDirection: 'row'}}>
                        <View style={{flex: 1}}>
                            <Title style={styles.listTitle}>{item.text}</Title>
                            <Subheading style={styles.listDescription}>Pour
                                le {formatDate(item.for.toDate())}</Subheading>
                            <Subheading style={styles.listDescription}>durée : {dateForHumans(item.length)}</Subheading>
                            <View style={styles.statsContainer}>
                                <Text>Stats : </Text>
                                <View style={styles.statsContainer}>
                                    <ToggleButton icon="check"/>
                                    <Text>{item.users.filter(e => e.choice).length}</Text>
                                </View>
                                <View style={styles.statsContainer}>
                                    <ToggleButton icon="close"/>
                                    <Text>{item.users.filter(e => !e.choice).length}</Text>
                                </View>
                            </View>

                        </View>
                        <View style={{alignItems: 'center'}}>
                            {reIcon(item)}
                        </View>
                    </View>
                )}
            />
            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    minimumDate={new Date()}
                    value={date}
                    mode={mode}
                    is24Hour={true}
                    display={display}
                    onChange={onChange}
                />
            )}
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Alert</Dialog.Title>
                    <Dialog.Content>
                        {renderModal()}
                    </Dialog.Content>
                    <Dialog.Actions>
                        {step > 0 && <Button onPress={() => {
                            setStep(step - 1);
                        }}>Precedent</Button>}
                        {step < 3 && <Button onPress={() => {
                            setStep(step + 1);
                        }}>Suivant</Button>}
                        {step == 3 && <Button onPress={hideDialog}>Fini</Button>}
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
    emptyContainer: {
        marginTop: 24,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textAreaContainer: {
        marginTop: 20,
        borderColor: Colors.grey500,
        borderWidth: 3,
        borderRadius: 15,
        padding: 5,
    },
    textArea: {
        height: 150,
        justifyContent: 'flex-start',
    },
});



