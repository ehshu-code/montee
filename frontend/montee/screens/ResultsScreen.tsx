import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { RootStackParamList } from "./types";
import { LinearGradient } from "expo-linear-gradient";
import { ResizeMode, Video } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import WebSocketContext from "@/services/SocketContext";
import { ImageSelectionContext } from "@/services/ImageSelectionContext";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

type ResultsScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "ResultsScreen"
>;

interface ProcessingScreenProps {
    navigation: ResultsScreenNavigationProp;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ResultsScreen({ navigation }: ProcessingScreenProps) {
    const { videoUri, setVideoUri, setServerFeedback } = useContext(WebSocketContext);
    const { setImageSelection } = useContext(ImageSelectionContext);

    const buttonsOpacity = useSharedValue(0);
    const videoOpacity = useSharedValue(0);

    useEffect(() => {
        // 1. Fade in buttons first
        buttonsOpacity.value = withTiming(1, {
            duration: 1500,
            easing: Easing.out(Easing.exp),
        });

        // 2. Fade in video after buttons animation finishes
        setTimeout(() => {
            videoOpacity.value = withTiming(1, {
                duration: 1500,
                easing: Easing.out(Easing.exp),
            });
        }, 1500);
    }, []);

    // Fade styles
    const buttonsFadeStyle = useAnimatedStyle(() => ({
        opacity: buttonsOpacity.value,
    }));

    const videoFadeStyle = useAnimatedStyle(() => ({
        opacity: videoOpacity.value,
    }));

    const handleDownload = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") return;
        if (videoUri) {
            try {
                const fileUri = FileSystem.documentDirectory + "downloadedVideo.mp4";
                const { uri } = await FileSystem.downloadAsync(videoUri, fileUri);

                const asset = await MediaLibrary.createAssetAsync(uri);
                await MediaLibrary.createAlbumAsync("Download", asset, false);
            } catch (error) {
                console.error("Error downloading video:", error);
            }
        }
    };

    const handleCreateAnother = () => {
        setVideoUri(null);
        setServerFeedback(null);
        setImageSelection(null);
        navigation.navigate("LandingScreen");
    };

    return (
        <View style={{ flex: 1, backgroundColor: "black" }}>
            {videoUri ? (
                <>
                    {/* Fading in the video second */}
                    <Animated.View style={[styles.fullscreenVideo, videoFadeStyle]}>
                        <Video
                            source={{ uri: videoUri }}
                            style={StyleSheet.absoluteFill}
                            resizeMode={ResizeMode.COVER}
                            isLooping
                            shouldPlay
                        />
                    </Animated.View>

                    <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.7)"]}
                        style={styles.overlay}
                    >
                        {/* Fading in the buttons first */}
                        <Animated.View style={[styles.buttonContainer, buttonsFadeStyle]}>
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
                        </Animated.View>
                    </LinearGradient>
                </>
            ) : (
                <View style={styles.overlay}>
                    <Text style={{ color: "white" }}>No Video URI</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    fullscreenVideo: {
        position: "absolute",
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 50,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 30,
    },
    saveMonteeButton: {
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: "red",
    },
    createAnotherButton: {
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: "red",
    },
    buttonText: {
        fontFamily: "Dalmation",
        fontSize: 20,
        color: "black",
    },
});
