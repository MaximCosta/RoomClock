import React, {useState, useEffect, useContext, Component} from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity, Text, Alert} from 'react-native';
import {TextInput} from 'react-native';

import {
    List,
    Divider,
    Dialog,
    Button,
    Portal,
    Title,
    Checkbox,
    Colors,
    IconButton,
    Subheading,
    ToggleButton,
    Paragraph,
    Switch,
    Badge,
    RadioButton,
} from 'react-native-paper';

import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

import {dateForHumans, formatDate, formatDateTime, humanDate} from '../function';
import Loading from '../components/Loading';
import useStatsBar from '../utils/useStatusBar';
import {AuthContext} from '../navigation/AuthProvider';
import {printEventDate} from '../function';

import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MCI = MaterialCommunityIcons;

export default class RoomParamScreen extends Component {
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.state = {
            currentUser: undefined,
            loading: true,

            date: new Date(),
            event: [],

            allColor: ['Tomate', 'Mandarine', 'Banane', 'Basilic', 'Sauge', 'Paon', 'Myrtille', 'Lavande', 'Raisin', 'Flamant rose', 'Graphite', 'Couleur par défaut'],
            allColorHex: ['#EA5553', '#F26F45', '#EBC252', '#44946A', '#48B382', '#2FA8E3', '#858EE1', '#7E8BCB', '#C878DB', '#DE857D', '#949493', '#7E8ACB'],

        };
    }


    componentDidMount() {
        if (!this.state.currentUser) {
            this.state.currentUser = this.context.user;
        }

        const sfRef = database().ref(`/users/${this.state.currentUser.uid}/threads/`);
        sfRef.on('value', (snapshot => {
                const threads = snapshot.val();
                if (threads) {
                    let uArray = [];
                    for (const items of Object.entries(snapshot.val())) {
                        if (items[1].events) {
                            for (const event of Object.entries(items[1].events)) {
                                uArray.push(event[1]);
                            }
                        }
                    }
                    this.setState({event: uArray, loading: false});
                } else {
                    this.setState({event: [], loading: false});
                }
            }),
        );
    }

    reIcon(item) {
        return <IconButton color={Colors.red500} icon="delete" onPress={() => {
            this.deleteEvent(item.msgID);
        }}/>;
    }

    render() {
        const {loading, event, allColor, allColorHex} = this.state;
        if (loading) {
            return <Loading/>;
        }
        return (
            <View style={styles.container}>
                <FlatList
                    data={event}
                    keyExtractor={item => item._id}
                    ItemSeparatorComponent={() => <Divider/>}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={{color: '#ffffff',}}>Pas d'evenement</Text>
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
                            </View>
                            <View style={{alignItems: 'center'}}>
                                {this.reIcon(item)}
                            </View>
                        </View>
                    )}
                />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        marginTop: 50,
        alignSelf: 'center',
        fontSize: 26,
        color: '#ffffff',
        fontFamily: 'Montserrat',
    },
    listTitle: {
        fontSize: 22,
        color: '#ffffff',
        fontFamily: 'Montserrat',
    },
    listDescription: {
        fontSize: 16,
        color: '#ffffff',
        fontFamily: 'Montserrat',
    },
    emptyContainer: {
        marginTop: 24,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fa: {
        flexDirection: 'row',
        alignItems: 'center',
    },

});
