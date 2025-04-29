import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { RootStackParamList } from "./types";

type ResultsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResultsScreen'>;

interface ProcessingScreenProps {
    navigation: ResultsScreenNavigationProp;
}

export default function ResultsScreen(props: ProcessingScreenProps) {

    // Chuck the expo-av component here to display the video


    return (
        <View style={styles.container}>
            <Text style={styles.text}>Results</Text>
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