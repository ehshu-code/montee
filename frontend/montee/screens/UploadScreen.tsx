import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Flag, FlagType, RootStackParamList, StartJobFlag } from "./types";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext, useEffect } from 'react';
import { ImageSelectionContext } from "@/services/ImageSelectionContext";
import WebSocketContext from "@/services/SocketContext";

type UploadScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'UploadScreen'>;

interface UploadScreenProps {
    navigation: UploadScreenNavigationProp;
}

export default function UploadScreen(props: UploadScreenProps) {
    const { imageSelection, setImageSelection } = useContext(ImageSelectionContext);
    const { ws } = useContext(WebSocketContext);

    // Signal backend to create session and spin up pipeline.
    useEffect(() => {
        if (ws) {
            console.log('sending start session flag')
            const startSessionFlag: Flag = {
                type: FlagType.START_SESSION
            }
            ws.send(JSON.stringify(startSessionFlag))
        }
    }, [ws])

    const handleChoosePhotos = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            return;
        }

        const results = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images', // TODO: Change to lib type
            orderedSelection: true,
            allowsMultipleSelection: true,
            base64: true,
            quality: 1,
        });

        if (!results.canceled) {
            setImageSelection(results.assets.map((asset, index) => (
                {
                    index: index,
                    uri: asset.uri,
                    base64: asset.base64!,
                }
            )));
        }
    };

    const handleStartStitching = () => {
        if (ws && imageSelection) {
            // Send start flag to backend
            const startJobFlag: StartJobFlag = {
                type: FlagType.START_JOB,
                noOfImages: imageSelection.length
            }
            console.log('sending start job flag')
            ws.send(JSON.stringify(startJobFlag)) // Send a start flag to the backend
        }
        props.navigation.navigate('ProcessingScreen')
    }

    return (
        <LinearGradient
            colors={['#0D0D0D', '#000000']}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <Text style={styles.text}>Image Gallery</Text>
                {imageSelection ?
                    (
                        <ScrollView contentContainerStyle={styles.galleryContainer}>
                            {imageSelection.map((item) => (
                                <Image key={item.index} source={{ uri: item.uri }} style={styles.image} />
                            ))}
                        </ScrollView>
                    ) : null
                }
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.chooseImagesButton}
                        onPress={handleChoosePhotos}
                    >
                        <Text style={styles.buttonText}>Choose Images</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.startProcessingButton}
                        onPress={handleStartStitching}
                    >
                        <Text style={styles.buttonText}>Start Stitching</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    galleryContainer: {
        width: 300,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    text: {
        fontFamily: 'Dalmation',
        fontSize: 50,
        color: 'red',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'red',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 0, // change this for more gl0w
        padding: 5,
        marginTop: 80
    },
    image: {
        padding: 5,
        width: 90,
        height: 120,
        borderRadius: 5
    },
    buttonContainer: {
        flexDirection: 'row',
        alignContent: 'center',
        gap: 30,
        padding: 30,
    },
    subtitleText: {
        fontFamily: 'Arial',
        color: 'red',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontSize: 14,
    },
    chooseImagesButton: {
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: 'red',
        alignSelf: 'stretch',
        marginBottom: 20,
    },
    startProcessingButton: {
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: 'red',
        alignSelf: 'stretch',
        marginBottom: 20,
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    buttonText: {
        fontFamily: 'Dalmation',
        fontSize: 20,
        color: 'black'
    },
});