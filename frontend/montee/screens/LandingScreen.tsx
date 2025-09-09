import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "./types";
import { Text, View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

type LandingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LandingScreen'>;

interface LandingScreenProps {
    navigation: LandingScreenNavigationProp;
}

export default function LandingScreen(props: LandingScreenProps) {

    const images = [
        require('../assets/image-gallery/Still 2025-05-10 144927_1.1.31.jpg'),
        require('../assets/image-gallery/Still 2025-05-10 144927_1.1.32.jpg'),
        require('../assets/image-gallery/Still 2025-05-10 144927_1.1.33.jpg'),
        require('../assets/image-gallery/Still 2025-05-10 144927_1.1.34.jpg'),
        require('../assets/image-gallery/Still 2025-05-10 144927_1.1.35.jpg'),
        require('../assets/image-gallery/Still 2025-05-10 144927_1.1.36.jpg'),
        require('../assets/image-gallery/Still 2025-05-10 144927_1.1.37.jpg'),
        require('../assets/image-gallery/Still 2025-05-10 144927_1.1.38.jpg'),
        require('../assets/image-gallery/Still 2025-05-10 144927_1.1.39.jpg'),
    ];

    return (
        <LinearGradient
            colors={['#0D0D0D', '#000000']}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <View style={styles.headerBlock}>
                    <Text style={styles.text}>Montee</Text>
                    <Text style={styles.subtitleText}>Your camera roll photos to hype reel in seconds...</Text>
                </View>
                <View style={styles.videoContainer}>
                    <Carousel
                        loop
                        autoPlay
                        autoPlayInterval={1000}
                        width={155}
                        height={275}
                        data={images}
                        style={{ borderRadius: 12 }}
                        scrollAnimationDuration={1500}
                        renderItem={({ item }) => (
                            <Image source={item} style={styles.image} />
                        )}
                    />
                    <Video
                        source={require('../assets/video/sample.mp4')}
                        shouldPlay
                        isLooping
                        isMuted
                        style={{ width: 155, height: 275, borderRadius: 10 }}
                    />
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => props.navigation.navigate('UploadScreen')}
                >
                    <Text style={styles.buttonText}>Create</Text>
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
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    videoContainer: {
        flexDirection: 'row',
        borderRadius: 10,
        bottom: 20,
        gap: 10
    },
    image: {
        width: '100%',
        height: '100%',
    },
    text: {
        fontFamily: 'Dalmation',
        fontSize: 100,
        color: 'red',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'red',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 0, // change this for more gl0w
        padding: 5
    },
    headerBlock: {
        alignItems: 'center',
        marginTop: 175,
        position: 'relative',
    },
    subtitleText: {
        fontFamily: 'Arial',
        color: 'red',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontSize: 14,
        bottom: 25
    },
    button: {
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: 'red',
        alignSelf: 'stretch',
        marginHorizontal: 20,
        marginBottom: 20
    },
    buttonText: {
        fontFamily: 'Dalmation',
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black'
    }
});
