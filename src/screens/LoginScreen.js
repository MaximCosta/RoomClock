import React, {useState, useContext} from 'react';
import {View, StyleSheet, Text, TextInput, Dimensions, Switch} from 'react-native';
import {Colors, IconButton, Title} from 'react-native-paper';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import {AuthContext} from '../navigation/AuthProvider';
import {useTheme} from '@react-navigation/native';
import Loading from '../components/Loading';

const {width, height} = Dimensions.get('screen');

export default function LoginScreen({navigation}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [reg, setReg] = useState(false);
    const [loading, setLoading] = useState(false);

    const {login, register} = useContext(AuthContext);
    const {colors} = useTheme();

    const onToggleSwitch = () => setReg(!reg);

    const signin = async (email, password, reg) => {
        setLoading(true);
        if (email && password) {
            if (!reg) {
                await login(email, password);
            } else {
                await register(email, password);
            }
        }
        setLoading(false);
    };

    if (loading) {
        return <Loading/>;
    }

    return (
        <View style={styles.container}>
            <View style={{marginBottom: 10}}>
                <Text style={[styles.titleText, {color: colors.text}]}>RoomClock</Text>
                <Text style={[styles.subTitleText, {color: colors.text}]}>{reg ? 'Register' : 'Login'}</Text>
            </View>
            <TextInput
                placeholder="Email"
                placeholderTextColor={colors.placeholder}
                value={email}
                autoCapitalize="none"
                onChangeText={userEmail => setEmail(userEmail)}
                style={[styles.formInputText, {width: 80 / 100 * width, color: colors.text}]}
            />
            <View style={{flexDirection: 'row', width: 80 / 100 * width}}>
                <TextInput
                    placeholder="Password"
                    placeholderTextColor={colors.placeholder}
                    value={password}
                    secureTextEntry={true}
                    onChangeText={userPassword => setPassword(userPassword)}
                    style={[styles.formInputText, {width: 80 / 100 * width - 75, marginRight: 7, color: colors.text}]}

                />
                <IconButton
                    icon="check"
                    color="#A8A8A8"
                    size={35}
                    onPress={() => signin(email, password, reg)}
                    style={styles.checkBtn}
                />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.navButtonText}>
                    New user?
                </Text>
                <Switch value={reg} onValueChange={onToggleSwitch}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container1: {
        justifyContent: 'center',
    },
    titleText: {
        fontFamily: 'BourtonDropStripesB',
        fontSize: 64,
        fontWeight: '400',

        textAlign: 'center',
    },
    subTitleText: {
        textAlign: 'right',
        fontSize: 24,
        fontFamily: 'Montserrat',
        fontWeight: '700',
    },
    loginButtonLabel: {
        fontSize: 22,
    },
    navButtonText: {
        color: '#3DAFB6',
        fontSize: 14,
        fontFamily: 'Montserrat',
        fontWeight: '700',
        marginRight: 15,
    },
    formInputText: {
        marginTop: 30,
        paddingLeft: 15,
        paddingRight: 15,

        height: 60,

        fontSize: 16,
        fontFamily: 'Montserrat',
        fontWeight: 'bold',

        borderRadius: 50,
        borderColor: '#A8A8A8',
        borderWidth: 4,
    },
    checkBtn: {
        borderRadius: 50,
        borderColor: '#A8A8A8',
        borderWidth: 4,
        height: 60,
        width: 60,
        fontSize: 16,
        marginTop: 30,
        marginLeft: 7,
    },
});
