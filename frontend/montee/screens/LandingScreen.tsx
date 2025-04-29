import { View, Text, Button, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "./types";

// Specify the navigation type for the Landing screen
type LandingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LandingScreen'>;

interface LandingScreenProps {
    navigation: LandingScreenNavigationProp;
}

export default function LandingScreen(props: LandingScreenProps) {

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Montee</Text>
            <Button title="Get Started" onPress={() => props.navigation.navigate('UploadScreen')} />
        </View>
    )
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#0f012b',
        alignContent: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 60,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
})