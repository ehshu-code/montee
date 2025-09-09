import React, { createContext, useState, useEffect, ReactNode, SetStateAction, Dispatch } from 'react';
import { writeVideoDataToFile } from './helpers';

const WebSocketContext = createContext<{
  ws: WebSocket | null;
  videoUri: string | null;
  setVideoUri: Dispatch<SetStateAction<string | null>>;
  setServerFeedback: Dispatch<SetStateAction<string | null>>;
  serverFeedback: string | null;
}>({
  ws: null,
  videoUri: null,
  setVideoUri: () => { },
  setServerFeedback: () => { },
  serverFeedback: null,
});

// WebSocket Provider to manage WebSocket connection
export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [serverFeedback, setServerFeedback] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://192.168.0.98:3000');
    socket.binaryType = 'arraybuffer';

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setWs(socket);
    };

    socket.onmessage = async (event) => {
      if (event.data instanceof ArrayBuffer) {
        console.log('Message from server:', event.data.byteLength);
        const videoUri = await writeVideoDataToFile(event.data);
        setVideoUri(videoUri);
      }
      else if (typeof event.data === 'string') {
        console.log('Message from server:', event.data);
        setServerFeedback(event.data);
      }
    };
    socket.onerror = (error) => {
      console.log('WebSocket Error: ', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setWs(null);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws, videoUri, setVideoUri, setServerFeedback, serverFeedback }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext; 
