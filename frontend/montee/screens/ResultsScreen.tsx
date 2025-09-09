import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { RootStackParamList } from "./types";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView, VideoSource } from 'expo-video';
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library';
import WebSocketContext from "@/services/SocketContext";
import { ImageSelectionContext } from "@/services/ImageSelectionContext";

type ResultsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResultsScreen'>;

interface ProcessingScreenProps {
    navigation: ResultsScreenNavigationProp;
}

export default function ResultsScreen(props: ProcessingScreenProps) {
    const { videoUri, setVideoUri, setServerFeedback } = useContext(WebSocketContext);
    const { setImageSelection } = useContext(ImageSelectionContext)

    const player = useVideoPlayer(videoUri, player => {
        player.loop = true;
        player.play();
    });

    if (!videoUri) {
        return <Text>No Video URI</Text>
    }

    const handleDownload = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            return
        }
        try {
            const fileUri = FileSystem.documentDirectory + 'downloadedVideo.mp4';
            const { uri } = await FileSystem.downloadAsync(videoUri, fileUri);

            const asset = await MediaLibrary.createAssetAsync(uri);
            await MediaLibrary.createAlbumAsync('Download', asset, false);
        } catch (error) {
            console.error('Error downloading video:', error);
        }
    }

    const handleCreateAnother = () => {
        // Reset states
        setVideoUri(null)
        setServerFeedback(null)
        setImageSelection(null)
        props.navigation.navigate('LandingScreen')
    }

    return (
        <LinearGradient
            colors={['#0D0D0D', '#000000']}
            style={{ flex: 1 }}
        >
            <Text style={styles.text}>Here we are...</Text>
            <View style={styles.container}>
                <VideoView
                    player={player}
                    style={styles.video}
                />
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.saveMonteeButton}
                    onPress={handleDownload}
                >
                    <Text style={styles.buttonText}>Save Montee</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.createAnotherButton}
                    onPress={handleCreateAnother}
                >
                    <Text style={styles.buttonText}>Create another</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    )
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontFamily: 'Dalmation',
        fontSize: 40,
        color: 'red',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'red',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 0, // change this for more gl0w
        padding: 5,
        marginTop: 200,
    },
    activityIndicator: {
        padding: 10
    },
    video: {
        width: 263,
        height: 350,
        borderRadius: 10
    },
    buttonContainer: {
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
        gap: 30,
        padding: 30,
    },
    saveMonteeButton: {
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: 'red',
        alignSelf: 'stretch',
        marginBottom: 20,
    },
    createAnotherButton: {
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
    }
})