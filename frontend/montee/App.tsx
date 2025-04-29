import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from '@react-navigation/native';
import React from "react";
import UploadScreen from "./screens/UploadScreen";
import ProcessingScreen from "./screens/ProcessingScreen";
import ResultsScreen from "./screens/ResultsScreen";
import LandingScreen from "./screens/LandingScreen";

const App = () => {
    const Stack = createNativeStackNavigator();
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="LandingScreen">
                <Stack.Screen name="LandingScreen" component={LandingScreen} />
                <Stack.Screen name="UploadScreen" component={UploadScreen} />
                <Stack.Screen name="ProcessingScreen" component={ProcessingScreen} />
                <Stack.Screen name="ResultsScreen" component={ResultsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default App;