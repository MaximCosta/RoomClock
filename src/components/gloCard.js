import React, {useEffect, useState} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Text,
    Dimensions,
    Animated,
    ImageBackground, View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import {getColorPack} from '../function';
import {IconButton} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';

const {width, height} = Dimensions.get('screen');

export default function GloCard({item, navigation, deleteAsk, index, forceFlip, setForceFlip}) {

    const [aniCard, setAniCard] = useState(new Animated.Value(0));
    const [aniCardF, setAniCardF] = useState(true);

    const [speaker, setSpeaker] = useState(true);

    const frontInterpolate = aniCard.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });
    const backInterpolate = aniCard.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    useEffect(() => {
        if (!aniCardF) {
            flipCard();
        }
    }, [forceFlip]);

    const flipCard = () => {
        if (aniCardF) {
            setForceFlip(Math.random());
            Animated.spring(aniCard, {
                toValue: 180,
                friction: 8,
                tension: 10,
            }).start(
                setAniCardF(false),
            );
        } else {
            Animated.spring(aniCard, {
                toValue: 0,
                friction: 8,
                tension: 0,
            }).start(
                setAniCardF(true),
            );
        }
    };

    const frontAnimatedStyle = {
        transform: [{
            rotateX: frontInterpolate,
        }],
    };

    const backAnimatedStyle = {
        transform: [{
            rotateX: backInterpolate,
        }],
    };

    const CardFB = (props) => {
        return (
            <Animated.View style={props.style}>
                <LinearGradient
                    colors={[
                        'rgba(255, 255, 255, 0.4)',
                        getColorPack(2)[item.color || '#FF2459'],
                        getColorPack(3)[item.color || '#FF2459'],
                    ]}
                    locations={[0.01, .1, 1]}
                    style={styles.linearGr}
                    useAngle={true}
                    angle={135}
                >
                    <ImageBackground source={require('../img/blur.png')} style={{
                        width: (width - 40) / 2,
                        height: 105,
                        padding: 5,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.4)',
                        borderRadius: 15,
                    }} blurRadius={10}>
                        {props.children}
                    </ImageBackground>
                </LinearGradient>
            </Animated.View>
        );
    };

    const navRoom = (thread) => {
        setForceFlip(Math.random());
        navigation.navigate('Room', {thread: item})
    }

    return (
        <Animatable.View
            animation="fadeIn"
            duration={500}
            delay={index * 500 / 5}
            useNativeDriver
        >
            <TouchableOpacity
                onPress={() => aniCardF ? navRoom(item) : flipCard()}
                onLongPress={() => flipCard()}
                style={styles.itemRenderContainer}
            >
                <CardFB style={[styles.card, frontAnimatedStyle]}>
                    <Text numberOfLines={1} style={styles.listTitle}>{item.name}</Text>
                    <Text numberOfLines={2} style={styles.listDescription}>{item.latestMessage.text}</Text>
                </CardFB>
                <CardFB style={[styles.card, styles.backCard, backAnimatedStyle]}>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                        <IconButton
                            icon={speaker ? 'volume-high' : 'volume-off'}
                            animated={true}
                            color={'#FFFFFFCC'}
                            size={36}
                            style={aniCardF && {display: 'none'}}
                            onPress={() => setSpeaker(!speaker)}
                        />
                        <IconButton
                            icon="delete"
                            color={'#FFFFFFCC'}
                            size={36}
                            style={aniCardF && {display: 'none'}}
                            onPress={() => deleteAsk(item)}
                        />
                    </View>
                </CardFB>
            </TouchableOpacity>
        </Animatable.View>
    );
}

const styles = StyleSheet.create({
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
    linearGr: {
        flex: 1,
        borderRadius: 15,
    },
    itemRenderContainer: {
        width: (width - 40) / 2,
        height: 105,
        margin: 10,
    },
    card: {
        flex: 1,
        backfaceVisibility: 'hidden',
    },
    backCard: {
        position: 'absolute',
        top: 0,
    },
});
