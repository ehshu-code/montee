import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Flag, FlagType, RootStackParamList, StartJobFlag } from "./types";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext, useEffect, useState } from 'react';
import { ImageSelectionContext } from "@/services/ImageSelectionContext";
import WebSocketContext from "@/services/SocketContext";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    cancelAnimation,
} from "react-native-reanimated";

type UploadScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'UploadScreen'>;

interface UploadScreenProps {
    navigation: UploadScreenNavigationProp;
}

export default function UploadScreen(props: UploadScreenProps) {
    const { imageSelection, setImageSelection } = useContext(ImageSelectionContext);
    const { ws } = useContext(WebSocketContext);

    const [bpm, setBpm] = useState(170);
    const [selectedBpm, setSelectedBpm] = useState(170);
    const pulse = useSharedValue(1);

    /** Reset animation cleanly whenever BPM changes */
    useEffect(() => {
        cancelAnimation(pulse);
        pulse.value = 1;

        const beatDuration = (60 / bpm) * 1000; // ms per beat
        pulse.value = withRepeat(
            withTiming(1.13, {
                duration: beatDuration / 2,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, [bpm]);

    const animatedStyle = (buttonBpm: number) =>
        useAnimatedStyle(() => {
            return {
                transform: [
                    {
                        scale: selectedBpm === buttonBpm ? pulse.value : 1,
                    },
                ],
            };
        });

    // Backend session start
    useEffect(() => {
        if (ws) {
            const startSessionFlag: Flag = { type: FlagType.START_SESSION };
            ws.send(JSON.stringify(startSessionFlag));
        }
    }, [ws]);

    const handleBPMPress = (value: number) => {
        setBpm(value);
        setSelectedBpm(value);
    };

    const handleChoosePhotos = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) return;

        const results = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            orderedSelection: true,
            allowsMultipleSelection: true,
            base64: true,
            quality: 1,
        });

        if (!results.canceled) {
            setImageSelection(
                results.assets.map((asset, index) => ({
                    index,
                    uri: asset.uri,
                    base64: asset.base64!,
                }))
            );
        }
    };

    const handleStartStitching = () => {
        if (ws && imageSelection) {
            const startJobFlag: StartJobFlag = {
                type: FlagType.START_JOB,
                noOfImages: imageSelection.length,
                bpm: selectedBpm,
            };
            ws.send(JSON.stringify(startJobFlag));
        }
        props.navigation.navigate('ProcessingScreen');
    };

    return (
        <LinearGradient colors={['#0D0D0D', '#000000']} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View>
                        <Text style={styles.text}>Image selection</Text>
                        <Text style={styles.subtitleText}>
                            1. Tap a square to choose speed.
                        </Text>
                    </View>
                    <View style={styles.squaresContainer}>
                        {[70, 120, 170, 220, 270].map((value, idx) => {
                            return (
                                <TouchableOpacity key={idx} onPress={() => handleBPMPress(value)}>
                                    <Animated.View style={[styles.square, animatedStyle(value)]}>
                                    </Animated.View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <Text style={styles.subtitleText}>
                        2. Choose your images in order.
                    </Text>
                    <TouchableOpacity style={styles.chooseImagesButton} onPress={handleChoosePhotos}>
                        <Text style={styles.buttonText}>Choose Images</Text>
                    </TouchableOpacity>
                    <FlatList
                        data={imageSelection}
                        keyExtractor={(item) => item.index.toString()}
                        numColumns={3}
                        contentContainerStyle={{ padding: 10 }}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item.uri }} style={styles.image} />
                        )}
                    />
                    <TouchableOpacity style={styles.startStitchingButton} onPress={handleStartStitching}>
                        <Text style={styles.buttonText}>Start Stitching</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView >
        </LinearGradient>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: '3%',
        paddingTop: '5%',
        paddingBottom: '3%',
    },
    text: {
        fontFamily: 'Dalmation',
        fontSize: 40,
        color: 'red',
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: '3%',
    },
    subtitleText: {
        fontFamily: 'Arial',
        color: 'red',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: '3%',
    },
    squaresContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        height: '9%',
        paddingVertical: 10,
        marginBottom: '5%',
    },
    square: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 8,
        backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        flex: 1,
        aspectRatio: 3 / 4,
        borderRadius: 8,
        margin: 5,
        maxWidth: '30%',
    },
    chooseImagesButton: {
        width: '50%',
        alignSelf: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: 'red',
        marginBottom: 15,
    },
    startStitchingButton: {
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: 'red',
        alignSelf: 'stretch',
        marginHorizontal: 20,
        marginBottom: 15,
        marginTop: 25
    },
    buttonText: {
        fontFamily: 'Dalmation',
        fontSize: 20,
        color: 'black',
    },
});

