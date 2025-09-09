import * as FileSystem from 'expo-file-system';

export const writeVideoDataToFile = async (videoData: ArrayBuffer): Promise<string> => {
  try {
    const base64VideoData = arrayBufferToBase64(videoData);
    if (!base64VideoData) {
      throw new Error('Failed to convert ArrayBuffer to base64');
    }

    const filePath = `${FileSystem.documentDirectory}video.mp4`;

    // Write the base64 video data to a file
    await FileSystem.writeAsStringAsync(filePath, base64VideoData, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return filePath;
  } catch (error) {
    console.error('Error converting video:', error);
    throw error;
  }
};

// Helper function to convert ArrayBuffer to base64 string
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  uint8Array.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary); // This method works in React Native with a polyfill
};