import { Server as WebSocketServer } from 'ws';
import { Server } from 'http';
import { collectImageStream, processImageStream, sendVideoToClient } from './services';

export function initializeWebSocketServer(server: Server) {
    console.log("Initializing WebSocket server...");
    
    const wss = new WebSocketServer({ server });

    if (wss) {
        console.log('✅ WebSocket server initialized.');
    } else {
        console.error('❌ WebSocket server initialization failed.');
        return;
    }

    wss.on('connection', (ws) => {
        console.log('✅ WebSocket connection established.');

        collectImageStream(ws);
        
        ws.on('close', () => {
            console.log('Closing WebSocket connection...');
            console.log('❌ WebSocket connection closed.');
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
        });
    });
}
