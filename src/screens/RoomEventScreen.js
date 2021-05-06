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
import {dateForHumans, formatDate} from '../function';

export default class RoomParamScreen extends Component {
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        //useStatsBar('light-content');
        //const {user} = useContext(AuthContext);
        //const currentUser = user.toJSON();
        console.log('\n\n');
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
            desc: 'Seriez-vous disponible le $d pour une durée de $t',
            event: [],
            _date: 0,
            _spin: 0,
        };
    }


    componentDidMount() {
        if (!this.state.currentUser) {
            this.state.currentUser = this.context.user;
        }

        const sfRef = firestore().collection('THREADS').doc(this.state.threadInfo._id).collection('MESSAGES');
        sfRef.orderBy('createdAt', 'asc')
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
                                uiArray.push({..._us.data(), msgID: _us.id});
                            }
                        }

                        data.users = uiArray;
                        data.text = data.text.replace('{date}', formatDate(data.for.toDate()));
                        data.text = data.text.replace('{length}', dateForHumans(data.length));
                        //console.log(us.id, '=>', {...data, msgID: us.id});
                        uArray.push({...data, msgID: us.id});
                    }

                    this.setState({event: uArray});
                }
                this.setState({loading: false});
            });
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
            this.hideDialog()
        }

    };

    showDialog() {
        this.setState({visible: true});
    };

    hideDialog() {
        this.setState({step: 0, visible: false});
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
                            $d = {formatDate(this.state._date)} | $t = {dateForHumans(this.state._spin / 1000)}
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
                            value={this.state.desc.replace('$d', formatDate(this.state._date)).replace('$t', dateForHumans(this.state._spin / 1000))}
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
                console.log(this.state._spin, this.state._date);
                break;
        }
    }

    reIcon() {
        const {currentUser, threadInfo} = this.state;
        if (currentUser.uid === threadInfo.author) {
            return <IconButton color={Colors.red500} icon="delete"/>;
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

    render() {
        const {loading, currentUser, threadInfo, event, show, date, display, mode, visible} = this.state;
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
                                    Pour le {formatDate(item.for.toDate())}
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
                                {this.reIcon()}
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

                            <Button onPress={() => {
                                this.eventMaker();
                            }}>Suivant</Button>
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

