import { View, Text, StyleSheet, Button } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import React from 'react'



const app = () => {
  const [photos, setPhotos] = React.useState<string[]>([])
  const handleChoosePhotos = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      console.log(response)
  })
  }
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Montee</Text>
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