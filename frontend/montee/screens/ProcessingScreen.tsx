import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Text, StyleSheet } from "react-native";
import { FlagType, RootStackParamList } from "./types";
import { useContext, useEffect, useState } from "react";
import WebSocketContext from "@/services/SocketContext";
import { LinearGradient } from "expo-linear-gradient";
import { ImageSelectionContext } from "@/services/ImageSelectionContext";
import { Buffer } from 'buffer';
import Animated, { Easing, runOnUI, useAnimatedStyle, useDerivedValue, useSharedValue, withRepeat, withSpring, withTiming } from "react-native-reanimated";

type ProcessingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProcessingScreen'>;

interface ProcessingScreenProps {
    navigation: ProcessingScreenNavigationProp;
}

export default function ProcessingScreen(props: ProcessingScreenProps) {
    const { ws, serverFeedback } = useContext(WebSocketContext);
    const { imageSelection } = useContext(ImageSelectionContext);
    const [screenRendered, setScreenRendered] = useState<boolean>(false)
    const [uploadStarted, setUploadStarted] = useState<boolean>(false)

    const pulse = useSharedValue(1);
    useEffect(() => {
        // Start pulsing animation on the UI thread
        runOnUI(() => {
            pulse.value = withRepeat(
                withTiming(1.03, { duration: 600, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
        })();
    }, []);

    const sentProgress = useSharedValue(0);
    const processedProgress = useSharedValue(0);
    const combinedProgress = useDerivedValue(() =>
        sentProgress.value + processedProgress.value
    );
    const totalImages = imageSelection?.length ?? 0;
    // We define progress as:
    // 1. How many images have been sent to the server
    // 2. How many the server has received and processed
    // Hence total increments in the progress bar are the totalImages in the job multiplied by 2.
    const completedProgress = totalImages * 2

    useEffect(() => {
        if (serverFeedback) {
            const { type, currentImageProcessingNo } = JSON.parse(serverFeedback.toString())
            if (type === FlagType.FINISHED_JOB) {
                props.navigation.navigate('ResultsScreen')
            }
            if (type === FlagType.PROGRESS_IND) {
                processedProgress.value = withSpring(currentImageProcessingNo, {
                    damping: 25,
                    stiffness: 120,
                });
            }
        }
    }, [serverFeedback])


    // Iterate through the selected images and send to server. This loop occupies the entire JS thread 
    // leading to halting all other operations until all the images are sent.While this is technically 
    // the fastest, it leads to an unresponsive user experience (no progress feedback from the server is processed).
    // Hence, the sleep() allows the single JS thread to yield to the event loop to process anything 
    // pending after each image is sent.
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    useEffect(() => {
        const sendImagesAsync = async () => {
            if (imageSelection && ws && ws.readyState === WebSocket.OPEN) {
                for (const image of imageSelection) {
                    const imageBuffer = Buffer.from(image.base64, 'base64');
                    console.log('Sending image no:', image.index + 1);
                    ws.send(imageBuffer);

                    runOnUI(() => {
                        sentProgress.value = withSpring(sentProgress.value + 1, {
                            damping: 25,
                            stiffness: 120,
                        });
                    })();
                    await sleep(0); // Yield to event loop
                }
            }
        };

        if (screenRendered && !uploadStarted) {
            setUploadStarted(true);
            sendImagesAsync();
        }
    }, [screenRendered, uploadStarted]);

    // Style for progress bar
    const progressStyle = useAnimatedStyle(() => ({
        width: `${(combinedProgress.value / completedProgress) * 100}%`,
    }));


    const pulseAnimationStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));


    return (
        <LinearGradient
            colors={['#0D0D0D', '#000000']}
            style={{ flex: 1 }}
        >
            <Animated.View style={styles.container} onLayout={() => setScreenRendered(true)}>
                <Animated.View style={[styles.textContainer, pulseAnimationStyle]}>
                    <View style={styles.textContainer} >
                        <Text style={styles.text}>Hang tight...</Text>
                        <Text style={styles.text}>Creating your montee</Text>
                    </View>
                </Animated.View>
                <View style={styles.progressContainer}>
                    <Animated.View style={[styles.progressFill, progressStyle]} />
                </View>
            </Animated.View>
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
    progressContainer: {
        width: '80%',            // The total width of your progress bar
        height: 12,              // Fixed height
        backgroundColor: '#333', // Background for unfilled part
        borderRadius: 6,
        overflow: 'hidden',
        marginTop: 20,
    },
    progressFill: {
        height: '100%',          // Fills the container vertically
        backgroundColor: 'red',
        borderRadius: 6,
    },
})