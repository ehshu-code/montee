import { View, Text, StyleSheet, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useEffect, useState } from 'react';
import WebSocketContext from '@/services';
import { Video } from 'expo-av';
import { ServerFeedback } from '@/services/constants';
import { ImageSelection } from './types';
import { Buffer } from 'buffer';

const App = () => {
  const [images, setImages] = useState<ImageSelection[]>([]);
  const { ws, videoUri, serverFeedback } = useContext(WebSocketContext);

  if (serverFeedback === ServerFeedback.PROCESSING) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Processing...</Text>
      </View>
    );
  }

  const handleChoosePhotos = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert('Permission required to access media library');
      return;
    }

    const results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', // TODO: Change to lib type
      orderedSelection: true,
      allowsMultipleSelection: true,
      base64: true,
      quality: 1,
    });

    if (!results.canceled) {
      setImages(results.assets.map((asset, index) => (
        {
          index: index,
          uri: asset.uri,
          base64: asset.base64!,
        }
      )));
    }
    // Put navigation here
  };

  // TODO: Batch upload all images instead of iterating.
  const handleUpload = async () => {
    try {
      for (const image of images) {
        const imageBuffer = Buffer.from(image.base64, 'base64');
        const isLast = image.index === images.length - 1;

        if (ws && ws.readyState === WebSocket.OPEN) {
          console.log('Sending image no:', image.index + 1);
          ws.send(imageBuffer);
          if (isLast) {
            console.log('isLast signal sent')
            ws?.send('isLast')
          }
        }
      }
    } catch (error) {
      console.error('Error sending images:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Montee</Text>
      <Button title="Choose images" onPress={handleChoosePhotos} />
      <Button title="Upload" onPress={handleUpload} />
      {videoUri ? (
        <Video
          source={{ uri: videoUri }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          shouldPlay
          isLooping
          style={{ width: '100%', height: '50%' }}
        />
      ) : null}
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