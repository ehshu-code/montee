import { View, Text, StyleSheet, Button, Image } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import React from 'react'

export interface ImagePickerResult {
  assetId: string
  base64?: string
  exif?: Record<string, any> | null
  fileName?: string
  fileSize?: number
  mimeType?: string
  pairedVideoAsset: string
  type: 'image' | 'video'
  canceled: boolean
  height?: number
  uri?: string
  width?: number
}


const app = () => {
  const [photos, setPhotos] = React.useState<string[]>([])

  const handleChoosePhotos = async () => {
    console.log('hi')
    // Request permission to access media library
    await ImagePicker.requestMediaLibraryPermissionsAsync()
    const results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 1,
    })
    console.log('results', results)
    if (results.assets) {
    setPhotos(results.assets?.map((asset: any) => asset.uri))
    }

  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Montee</Text>
      {/* {photos ? photos.map((photo: any) => (
        <Image
          key={photo.uri}
          source={{ uri: photo.uri }}
          style={{ width: 200, height: 200 }}
          resizeMode='contain'
        />
      )) : null} */}
      <Button title="Upload images" onPress={handleChoosePhotos} />
    </View>
  )
}

export default app

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
  }
})