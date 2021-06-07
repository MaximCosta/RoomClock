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
    Button, Switch, Badge, RadioButton,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';


import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

import Loading from '../components/Loading';
import useStatsBar from '../utils/useStatusBar';
import {AuthContext} from '../navigation/AuthProvider';
import {dateForHumans, formatDate, formatDateTime, humanDate, printEventDate} from '../function';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MCI = MaterialCommunityIcons;

export default class RoomParamScreen extends Component {
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.state = {
            threadInfo: props.route.params,
            currentUser: undefined,
            loading: true,
            show: false,
            st: 0,
            visible: false,
            display: 'default',
            mode: 'date',
            date: new Date(),
            event: [],

            fullday: false,

            allColor: ['Tomate', 'Mandarine', 'Banane', 'Basilic', 'Sauge', 'Paon', 'Myrtille', 'Lavande', 'Raisin', 'Flamant rose', 'Graphite', 'Couleur par défaut'],
            allColorHex: ['#EA5553', '#F26F45', '#EBC252', '#44946A', '#48B382', '#2FA8E3', '#858EE1', '#7E8BCB', '#C878DB', '#DE857D', '#949493', '#7E8ACB'],
            colorModal: false,

            up: 1,
            error: false,

            _dateD: new Date(),
            _dateF: new Date(),
            _color: 'Couleur par défaut',
            _title: '',
            _desc: '',
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

            this.setState({
                show: Platform.OS === 'ios',
            });
            let currentDate;
            switch (this.state.up) {
                case 1:
                    currentDate = selectedDate || this.state.date;
                    this.setState({_dateD: currentDate});
                    break;
                case 2:
                    currentDate = selectedDate || this.state.date;
                    this.setState({_dateF: currentDate});
                    break;
            }

        } else {
            this.hideDialog();
        }

    };

    showDialog() {
        this.setState({visible: true});
    };

    hideDialog() {
        this.setState({visible: false, show: false});
    };

    showMode(currentMode, up = 1) {
        this.setState({show: true, mode: currentMode, up: up});
        let currentDate;
        switch (up) {
            case 1:
                currentDate = this.state._dateD;
                this.setState({date: currentDate});
                break;
            case 2:
                currentDate = this.state._dateF;
                this.setState({date: currentDate});
                break;
        }
    }

    erreurMakeRender() {
        return (
            <Portal>
                <Dialog visible={this.state.error} onDismiss={() => this.setState({error: false})}>
                    <Dialog.Title>Erreur</Dialog.Title>
                    <Dialog.Content>
                        <Text>{this.state.error}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button color="#E9EBED" onPress={() => this.setState({error: false})}>Done</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        );
    }

    colorChoseRender() {
        const {colorModal, _color, allColor, allColorHex} = this.state;
        return (
            <Portal>
                <Dialog visible={colorModal} onDismiss={() => this.setState({colorModal: false})}>
                    <Dialog.Title>Alert</Dialog.Title>
                    <Dialog.Content>
                        <RadioButton.Group onValueChange={nv => this.setState({_color: nv})} value={_color}>
                            {allColor.map(cr => {
                                return (
                                    <View key={cr} style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <RadioButton
                                            value={cr}
                                            uncheckedColor={allColorHex[allColor.indexOf(cr)]}
                                            color={allColorHex[allColor.indexOf(cr)]}
                                        />
                                        <Text style={{marginLeft: 15}}>{cr}</Text>
                                    </View>
                                );
                            })}
                        </RadioButton.Group>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button color="#E9EBED" onPress={() => this.setState({colorModal: false})}>Done</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        );
    }

    eventModal() {
        const {_dateD, _dateF, _color, fullday, _title, _desc, allColorHex, allColor} = this.state;
        return <View style={styles.mp0}>
            <TextInput
                value={_title}
                onChangeText={(e) => this.setState({_title: e})}
                placeholder="Ajouter un titre*"
                style={styles.etitle}

            />
            <Divider style={styles.divider}/>
            <View style={{marginLeft: 10}}>
                <View style={styles.econtainer}>
                    <View style={styles.fa}>
                        <MCI name="clock-outline" color="#9BA0A7" size={26}
                             style={{marginRight: 10}}/>
                        <Text>Toute la journée</Text>
                    </View>
                    <Switch value={fullday} onValueChange={() => this.setState({fullday: !fullday})}/>
                </View>
                <View style={{marginLeft: 25}}>
                    <View style={styles.econtainer}>
                        <Button onPress={() => this.showMode('date', 1)} color="#E9EBED" uppercase={false}
                                mode="text">{humanDate(_dateD)}</Button>
                        {!fullday &&
                        <Button onPress={() => this.showMode('time', 1)} color="#E9EBED" uppercase={false}
                                mode="text">{formatDateTime(_dateD)}</Button>}
                    </View>
                    <View style={styles.econtainer}>
                        <Button onPress={() => this.showMode('date', 2)} color="#E9EBED" uppercase={false}
                                mode="text">{humanDate(_dateF)}</Button>
                        {!fullday &&
                        <Button onPress={() => this.showMode('time', 2)} color="#E9EBED" uppercase={false}
                                mode="text">{formatDateTime(_dateF)}</Button>}
                    </View>
                </View>
            </View>
            <Divider style={styles.divider}/>
            <View style={{marginLeft: 13}}>
                <View style={styles.fa}>
                    <View
                        onPress={() => this.setState({colorModal: true})}
                        style={{
                            borderRadius: 5,
                            backgroundColor: allColorHex[allColor.indexOf(_color)],
                            height: 20,
                            width: 20,
                            marginRight: 0,
                        }}/>
                    <Button uppercase={false} color="#E9EBED" onPress={() => this.setState({colorModal: true})}
                            mode="text">
                        {_color}
                    </Button>
                </View>
            </View>
            <Divider style={styles.divider}/>
            <View style={{marginLeft: 10, marginBottom: 20}}>
                <View style={styles.fa}>
                    <MCI name="text" color="#9BA0A7" size={26} style={{marginRight: 10}}/>
                    <TextInput
                        value={_desc}
                        onChangeText={(e) => this.setState({_desc: e})}
                        placeholder="Ajouter une description"
                    />
                </View>
            </View>
        </View>;
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
        const {_dateD, _dateF, _color, fullday, _title, _desc, allColorHex, allColor} = this.state;

        if (fullday) {
            _dateD.setHours(0, 0, 0, 0);
            _dateF.setHours(0, 0, 0, 0);
        }

        if (_dateF - _dateD < 0) {
            this.setState({error: 'vous ne pouvez pas avoir une date de début inférieur a la date de fin'});
            return;
        }

        if (!_dateD || !_dateF || !_color || !_title) {
            this.setState({error: 'le titre, la date de début et de fin sont obligatoires.'});
            return;
        }

        //let addm = firestore().collection('THREADS').doc(this.state.threadInfo._id).collection('MESSAGES');
        database().ref('/sondage/').child(this.state.threadInfo._id).push({
            createdAt: (new Date()).getTime(),
            system: true,
            event: true,

            title: _title,
            desc: _desc,
            fullday: fullday,
            dateD: _dateD.getTime(),
            dateF: _dateF.getTime(),
            color: _color,

        });

        this.setState({
            visible: false,
        });
    }

    deleteEvent(id) {
        //database().ref(`/sondage/${this.state.threadInfo._id}/${id}`).remove();
        //let ColRef = firestore().collection('THREADS').doc(this.state.threadInfo._id).collection('MESSAGES');
        let RelRef = database().ref(`/sondage/${this.state.threadInfo._id}/${id}`);

        RelRef.child('users').once('value').then(snapshot => {
            if (snapshot.val()) {
                let _uid = Object.keys(snapshot.val())[0];
                let choice = Object.values(snapshot.val())[0];
                if (choice === true) {
                    database().ref(`/users/${_uid}/threads/${this.state.threadInfo._id}/events/${id}`).remove();
                }
            }
        });
        RelRef.remove();
        //ColRef.doc(id).delete();
    }

    render() {
        const {
            loading,
            currentUser,
            threadInfo,
            event,
            show,
            date,
            display,
            mode,
            visible,
            allColor,
            allColorHex,
        } = this.state;
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
                        <View style={{
                            marginLeft: 20,
                            marginTop: 20,
                            paddingLeft: 5,
                            flexDirection: 'row',
                            borderLeftColor: allColorHex[allColor.indexOf(item.color)],
                            borderLeftWidth: 2,
                        }}>
                            <View style={{flex: 1}}>
                                <Title style={styles.listTitle}>{item.title}</Title>
                                {item.desc !== '' &&
                                <Subheading style={styles.listDescription}>{item.desc}</Subheading>}
                                <Subheading style={styles.listDescription}>{printEventDate(item)}</Subheading>
                                <View style={styles.fa}>
                                    <Text>Stats : </Text>
                                    <View style={styles.fa}>
                                        <ToggleButton icon="check"/>
                                        <Text>{item.users.filter(e => e.choice).length}</Text>
                                    </View>
                                    <View style={styles.fa}>
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
                        <Dialog.Actions style={{justifyContent: 'space-between'}}>
                            <IconButton color="#9BA0A7" icon="close" onPress={() => this.hideDialog()}/>
                            <Button mode="contained" color="#255B96" onPress={() => {
                                this.saveEvent();
                            }}>Enregistrer</Button>
                        </Dialog.Actions>
                        {this.eventModal()}
                    </Dialog>
                </Portal>
                {this.colorChoseRender()}
                {this.erreurMakeRender()}
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
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
    mp0: {
        margin: 0,
        padding: 0,
    },
    etitle: {
        fontSize: 18,
        marginLeft: 40,
    },
    divider: {
        height: 1,
        backgroundColor: '#9BA0A7',
        marginTop: 10,
        marginBottom: 10,
    },
    econtainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fa: {
        flexDirection: 'row',
        alignItems: 'center',
    },

});

