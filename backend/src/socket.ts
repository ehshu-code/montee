import { Server as WebSocketServer } from 'ws';
import { Server } from 'http';
import { startImageStream, processImageStream, sendVideoToClient, createNamedPipe } from './services';

export const PIPE_PATH = '/tmp/ffmpeg_pipe';

export function initializeWebSocketServer(server: Server) {
    console.log("Initializing WebSocket server...");
    
    const wss = new WebSocketServer({ server });

    if (wss) {
        console.log('✅ WebSocket server initialized.');
    } else {
        console.error('❌ WebSocket server initialization failed.');
        return;
    }

    wss.on('connection', async (ws) => {
        console.log('✅ WebSocket connection established.');
        // Create a named pipe
        await createNamedPipe(PIPE_PATH);
        // Start listening for incoming images
        startImageStream(ws, PIPE_PATH);
        // Start FFMPEG
        const videoFilename = await processImageStream(ws, PIPE_PATH)
        sendVideoToClient(ws, videoFilename)
        
        ws.on('close', () => {
            console.log('Closing WebSocket connection...');
            ws.close()
            console.log('❌ WebSocket connection closed.');
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
        });
    });
}
