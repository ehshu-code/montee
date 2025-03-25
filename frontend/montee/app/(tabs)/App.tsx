import { View, Text, StyleSheet, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useState } from 'react';
import WebSocketContext, { WebSocketProvider } from '@/services'; // Import WebSocketProvider and WebSocketContext

// Main App component
const App = () => {
  const [photoURIs, setPhotoURIs] = useState<string[]>([]);
  const ws = useContext(WebSocketContext); // Access WebSocket context

  const handleChoosePhotos = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert('Permission required to access media library');
      return;
    }

    const results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', // TODO: Change to lib type
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!results.canceled) {
      setPhotoURIs(results.assets.map((asset) => asset.uri));
    }
  };

  const handleUpload = async () => {
    for (const uri of photoURIs) {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
  
        const arrayBuffer = await new Promise((resolve, reject) => {
          const reader = new FileReader();
  
          reader.onload = () => {
            resolve(reader.result);  // Resolve with the ArrayBuffer
          };
  
          reader.onerror = (error) => {
            reject(error);  // Reject on error
          };
  
          reader.readAsArrayBuffer(blob);
        });
  
        if (arrayBuffer && ws && ws.readyState === ws.OPEN) {
          console.log('Sending image to server');
          ws.send(arrayBuffer as ArrayBuffer);
        }
      } catch (error) {
        console.error('Error processing image URI:', error);
      }
    }
  };
  
  return (
      <View style={styles.container}>
        <Text style={styles.text}>Montee</Text>
        <Button title="Choose images" onPress={handleChoosePhotos} />
        <Button title="Upload" onPress={handleUpload} />
      </View>
  );
};

export default App;

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