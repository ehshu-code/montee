import { Server as WebSocketServer } from 'ws';
import { Server } from 'http';
import { processImageStream, sendVideoToClient, initialiseImageStream, clearSessionFiles } from './services';
import { MessageTypes, SessionData } from './types';
import { v4 as uuidv4 } from 'uuid';
import { EMPTY_SESSION_DATA } from './store';
import sharp from 'sharp'

export function initializeWebSocketServer(server: Server) {
    console.log("Initializing WebSocket server...");

    const wss = new WebSocketServer({ server });

    if (wss) {
        console.log('✅ WebSocket server initialized.');
    } else {
        console.error('❌ WebSocket server initialization failed.');
        return;
    }

    // A global session map. Keeps track of concurrent connections and associated processes/data.
    // { id, SessionData }
    const sessionMap: Map<string, SessionData> = new Map();

    wss.on('connection', async (ws) => {
        console.log('✅ WebSocket connection established.');

        // Initialise a new session
        const session: SessionData = EMPTY_SESSION_DATA;
        const sessionId = uuidv4();
        session.id = sessionId;
        session.socket = ws;
        session.startedAt = new Date;
        session.isActive = true;
        sessionMap.set(sessionId, session)

        ws.on("message", async (message, isBuffer) => {
            if (isBuffer) {
                if (session && session.writeStream) {
                    const image = sharp(message);
                    const metadata = await image.metadata();
                    console.log(`  Format: ${metadata.format}`);
                    console.log(`  Width: ${metadata.width}`);
                    console.log(`  Height: ${metadata.height}`);
                    console.log(`  Channels: ${metadata.channels}`);
                    console.log(`  Depth: ${metadata.depth}`);
                    console.log(`  Space: ${metadata.space}`);
                    console.log(`  Has alpha: ${metadata.hasAlpha}`);

                    session.writeStream.write(message, (err) => {
                        if (err) {
                            console.error("Write error:", err);
                        } else {
                            session.currentImageIndex += 1;
                            console.log(`Image ${session.currentImageIndex}/${session.noOfImages} written`);
                            if (session.noOfImages === session.currentImageIndex) {
                                console.log("Ending write stream");
                                session.writeStream!.end();
                            }
                        }
                    });
                } else {
                    console.warn("No active session or write stream found for this client.");
                }
            }

            // Else, it'll be a string/object flag to trigger events
            else {
                const { type, noOfImages } = JSON.parse(message.toString())
                switch (type) {
                    case MessageTypes.START_JOB:
                        session.noOfImages = noOfImages
                    case MessageTypes.START_SESSION:
                        await initialiseImageStream(session) // Create write stream to new named pipe
                        await processImageStream(session) // Start FFMPEG and wait
                        await sendVideoToClient(ws, session) // Once processed, send video to client
                    case MessageTypes.END_SESSION:
                        await clearSessionFiles(session)
                }
            }
        })
        ws.on('close', () => {
            console.log('❌ WebSocket connection closed.');
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
        });
    });
}
