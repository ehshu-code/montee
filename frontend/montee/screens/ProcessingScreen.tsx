import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Text, Button, StyleSheet } from "react-native";
import { RootStackParamList } from "./types";

type ProcessingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProcessingScreen'>;

interface ProcessingScreenProps {
    navigation: ProcessingScreenNavigationProp;
}

export default function ProcessingScreen(props: ProcessingScreenProps) {

    // Chuck a useEffect here that watches for the finished signal from the server
    // This should be used to trigger the navigate.



    return (
        <View style={styles.container}>
            <Text style={styles.text}>Processing</Text>
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