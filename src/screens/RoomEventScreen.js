import React, {useState, useEffect, useContext, Component} from 'react';
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
import {dateForHumans, formatDate, formatDateTime} from '../function';

export default class RoomParamScreen extends Component {
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.state = {
            threadInfo: props.route.params,
            currentUser: undefined,
            loading: true,
            show: false,
            step: 0,
            st: 0,
            visible: false,
            display: 'default',
            mode: 'date',
            date: new Date(),
            desc: 'Seriez-vous disponible le $d à $t pour une durée de $p',
            event: [],
            _date: 0,
            _spin: 0,
        };
    }


    componentDidMount() {
        if (!this.state.currentUser) {
            this.state.currentUser = this.context.user;
        }
        const sfRef = database().ref(`/sondage/${this.state.threadInfo._id}`);
        sfRef.on('value', (snapshot => {
                const data = snapshot.val();
                if (data) {
                    let uArray = [];
                    for (const [key, value] of Object.entries(data)) {
                        let uiArray = [];
                        if (value && value.users) {
                            for (const [_uid, _data] of Object.entries(value.users)) {
                                uiArray.push({choice: _data, user: _uid, msgID: key});
                            }
                        }
                        value.users = uiArray;
                        value.text = value.text.replace('$d', formatDate(new Date(value.for)));
                        value.text = value.text.replace('$t', formatDateTime(new Date(value.for)));
                        value.text = value.text.replace('$p', dateForHumans(value.length));
                        uArray.push({...value, msgID: key});
                    }
                    this.setState({event: uArray, loading: false});
                } else {
                    this.setState({event: [], loading: false});
                }
            }),
        );
    }

    onChange(event, selectedDate) {
        if (event.type !== 'dismissed') {
            const currentDate = selectedDate || this.state.date;
            this.setState({
                show: Platform.OS === 'ios',
                date: currentDate,
            });
            this.setState({step: this.state.step + 1});
        } else {
            this.hideDialog();
        }

    };

    showDialog() {
        this.setState({visible: true});
    };

    hideDialog() {
        this.setState({step: 0, visible: false, show: false});
    };

    showMode(currentMode, _display = 'default') {
        if (this.state.display !== _display) {
            this.setState({display: _display});
        }
        this.setState({
            show: true,
            mode: currentMode,
        });
    };

    eventModal() {
        const {step} = this.state;
        switch (step) {
            case 0:
                return <Title>Choisir la Date de l'evenement</Title>;
            case 1:
                return <Title>Choisir l'heure de début</Title>;
            case 2:
                return <Title>Choisir la durée de l'evenement</Title>;
            case 3:
                this.eventMaker();
                return (
                    <>
                        <Title>description</Title>
                        <Text style={{marginTop: 15}}>
                            $d = {formatDate(this.state._date)} |
                            $t = {formatDateTime(this.state._date)} |
                            $p = {dateForHumans(this.state._spin / 1000)}
                        </Text>
                        <TextInput
                            multiline={true}
                            numberOfLines={4}
                            onChangeText={(desc) => this.setState({desc})}
                            value={this.state.desc}
                            style={{
                                borderColor: '#DFE1E5',
                                borderRadius: 5,
                                borderWidth: 1,
                                marginTop: 10,
                                padding: 5,
                                textAlignVertical: 'top',
                            }}
                        />

                        <Text style={{marginTop: 15}}>Text formatter:</Text>
                        <TextInput
                            multiline={true}
                            numberOfLines={4}
                            disabled={true}
                            //onChangeText={(desc) => this.setState({desc})}
                            value={this.state.desc.replace('$d', formatDate(this.state._date))
                                .replace('$t', formatDateTime(this.state._date))
                                .replace('$p', dateForHumans(this.state._spin / 1000))}
                            style={{
                                borderColor: '#DFE1E5',
                                borderRadius: 5,
                                borderWidth: 1,
                                marginTop: 10,
                                padding: 5,
                                textAlignVertical: 'top',
                            }}
                        />
                    </>
                );
        }
    }

    eventMaker() {
        const {step} = this.state;
        switch (step) {
            case 0:
                this.state.date = new Date();
                this.state.date.setSeconds(0, 0);
                this.showMode('date', 'default');
                break;
            case 1:
                this.showMode('time', 'default');
                break;
            case 2:
                this.state._date = this.state.date;
                this.state.date = new Date(0);
                this.showMode('time', 'spinner');
                break;
            case 3:
                this.state._spin = this.state.date.getTime() + Math.abs(this.state.date.getTimezoneOffset()) * 60000;
                break;
        }
    }

    reIcon(item) {
        const {currentUser, threadInfo} = this.state;
        if (currentUser.uid === threadInfo.author) {
            return <IconButton color={Colors.red500} icon="delete" onPress={() => {
                this.deleteEvent(item.msgID);
            }}/>;
        }
    }

    renderMaker() {
        return (
            <>
                <Title style={styles.title}>Créer un Event</Title>
                <Button onPress={() => this.showDialog()}>Show Dialog</Button>
            </>
        );
    }

    saveEvent() {
        const {_spin, _date, desc} = this.state;
        let addm = firestore().collection('THREADS').doc(this.state.threadInfo._id).collection('MESSAGES');
        if (_spin && _date && desc) {
            addm.add({system: true, createdAt: (new Date()).getTime(), event: true}).then(ref => {
                let upData = {};
                upData[`/sondage/${this.state.threadInfo._id}/${ref.id}`] = {
                    text: desc,
                    for: _date.getTime(),
                    length: _spin / 1000,
                };
                database().ref().update(upData);
            });
            this.setState({
                _spin: 0,
                _date: 0,
                desc: 'Seriez-vous disponible le $d pour une durée de $t',
                step: 0,
                visible: false,
            });
        }
    }

    deleteEvent(id) {
        database().ref(`/sondage/${this.state.threadInfo._id}/${id}`).remove();
        firestore().collection('THREADS').doc(this.state.threadInfo._id).collection('MESSAGES').doc(id).delete();
    }

    render() {
        const {loading, currentUser, threadInfo, event, show, date, display, mode, visible, step} = this.state;
        if (loading) {
            return <Loading/>;
        }
        return (
            <View style={styles.container}>

                {currentUser.uid === threadInfo.author && this.renderMaker()}

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
                                <Subheading style={styles.listDescription}>
                                    Pour le {formatDate(new Date(item.for))} à {formatDateTime(new Date(item.for))}
                                </Subheading>
                                <Subheading style={styles.listDescription}>
                                    durée : {dateForHumans(item.length)}
                                </Subheading>
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
                                {this.reIcon(item)}
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
                        onChange={(e, sld) => this.onChange(e, sld)}
                    />
                )}
                <Portal>
                    <Dialog visible={visible} onDismiss={() => this.hideDialog()}>
                        <Dialog.Title>Create Event</Dialog.Title>
                        <Dialog.Content>
                            {this.eventModal()}
                        </Dialog.Content>
                        <Dialog.Actions>
                            {step !== 3 && <Button onPress={() => {
                                this.eventMaker();
                            }}>Suivant</Button>}
                            {step === 3 && <Button onPress={() => {
                                this.saveEvent();
                            }}>Finish</Button>}
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        );
    }
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

