import * as FileSystem from 'expo-file-system/legacy'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Buffer } from 'buffer';

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

/**
 * Preprocess an image:
 *  - Take an image URI
 *  - Crop to 9:16
 *  - Resize to 1080x1920
 *  - Return a Buffer ready for WebSocket transfer
 */
export async function preprocessImage(imageUri: string): Promise<Buffer> {
  const { width, height } = await manipulateAsync(imageUri, []);

  const targetAspect = 9 / 16;
  const currentAspect = width / height;

  let cropWidth = width;
  let cropHeight = height;
  let cropX = 0;
  let cropY = 0;

  if (currentAspect > targetAspect) {
    // Too wide → crop horizontally
    cropWidth = height * targetAspect;
    cropX = (width - cropWidth) / 2;
  } else if (currentAspect < targetAspect) {
    // Too tall → crop vertically
    cropHeight = width / targetAspect;
    cropY = (height - cropHeight) / 2;
  }

  // Crop and resize to 1080x1920
  const finalResult = await manipulateAsync(
    imageUri,
    [
      {
        crop: {
          originX: cropX,
          originY: cropY,
          width: cropWidth,
          height: cropHeight,
        },
      },
      {
        resize: {
          width: 1080,
          height: 1920,
        },
      },
    ],
    {
      compress: 1, // Max quality
      format: SaveFormat.JPEG,
      base64: true, // Required for Buffer conversion
    }
  );

  // Ensure base64 output exists
  if (!finalResult.base64) {
    throw new Error('Image processing failed: no base64 returned');
  }

  return Buffer.from(finalResult.base64, 'base64');
}

