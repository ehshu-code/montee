import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { RootStackParamList, ServerFeedback } from "./types";
import { useContext, useEffect, useState } from "react";
import WebSocketContext from "@/services/SocketContext";
import { LinearGradient } from "expo-linear-gradient";
import { ImageSelectionContext } from "@/services/ImageSelectionContext";
import { Buffer } from 'buffer';

type ProcessingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProcessingScreen'>;

interface ProcessingScreenProps {
    navigation: ProcessingScreenNavigationProp;
}

export default function ProcessingScreen(props: ProcessingScreenProps) {
    const { ws, serverFeedback } = useContext(WebSocketContext);
    const { imageSelection } = useContext(ImageSelectionContext);
    const [screenRendered, setScreenRendered] = useState(false)
    const [uploadStarted, setUploadStarted] = useState(false)

    useEffect(() => {
        if (serverFeedback === ServerFeedback.FINISHED) {
            props.navigation.navigate('ResultsScreen')
        }
    }, [serverFeedback])

    useEffect(() => {
        if (screenRendered && !uploadStarted) {
            setUploadStarted(true)
            try {
                if (imageSelection) { // TODO: See if we can make a clean selection checker above this 
                    for (const image of imageSelection) {
                        const imageBuffer = Buffer.from(image.base64, 'base64');

                        if (ws && ws.readyState === WebSocket.OPEN) {
                            console.log('Sending image no:', image.index + 1);
                            ws.send(imageBuffer);
                        }
                    }
                }
            } catch (error) {
                console.error('Error sending images:', error);
            }
        }
    }, [screenRendered, uploadStarted]
    )

    return (
        <LinearGradient
            colors={['#0D0D0D', '#000000']}
            style={{ flex: 1 }}
        >
            <View style={styles.container} onLayout={() => setScreenRendered(true)}>
                <View style={styles.textContainer} >
                    <Text style={styles.text}>Hang tight...</Text>
                    <Text style={styles.text}>Creating your montee</Text>
                </View>
                <ActivityIndicator size='large' style={styles.activityIndicator} />
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
    },
    activityIndicator: {
        padding: 10
    }
})