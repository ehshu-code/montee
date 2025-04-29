import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Text, Button, StyleSheet } from "react-native";
import { RootStackParamList } from "./types";

type UploadScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'UploadScreen'>;

interface UploadScreenProps {
    navigation: UploadScreenNavigationProp;
}

export default function UploadScreen(props: UploadScreenProps) {

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Montee</Text>
            <Button title="Choose Images" onPress={() => console.log('Choose Images')} />
            <Button title="Start Processing" onPress={() => props.navigation.navigate('ProcessingScreen')} />
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