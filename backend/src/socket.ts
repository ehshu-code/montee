import { Server as WebSocketServer } from 'ws';
import { Server } from 'http';
import { processImageStream, sendVideoToClient, initialiseImageStream, clearSessionFiles, preprocessImageBuffer, convertHeicToJpeg } from './services';
import { FlagType, ProgressIndFlag, SessionData } from './types';
import { v4 as uuidv4 } from 'uuid';
import { EMPTY_SESSION_DATA } from './store';
import sharp from 'sharp';

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
                    try {
                        // Ensure message is a Buffer
                        const buffer: Buffer = Buffer.isBuffer(message)
                            ? message
                            : Buffer.from(message as ArrayBuffer);

                        const metadata = await sharp(buffer).metadata();
                        console.log(`${metadata.width}x${metadata.height}`);

                        const jpegBuffer = await convertHeicToJpeg(buffer)
                        const preprocessedImageBuffer = await preprocessImageBuffer(jpegBuffer)

                        // Write the JPEG into the write stream
                        session.writeStream.write(preprocessedImageBuffer, (err) => {
                            if (err) {
                                console.error("Write error:", err);
                            } else {
                                session.currentImageIndex += 1;
                                const progressIndFlag: ProgressIndFlag = {
                                    type: FlagType.PROGRESS_IND,
                                    currentImageProcessingNo: session.currentImageIndex
                                }
                                ws.send(JSON.stringify(progressIndFlag))
                                console.log(`Image ${session.currentImageIndex}/${session.noOfImages} written`);

                                if (session.noOfImages === session.currentImageIndex) {
                                    console.log("Ending write stream");
                                    session.writeStream!.end();
                                }
                            }
                        });
                    } catch (conversionError) {
                        console.error("Failed to convert image to JPEG:", conversionError);
                    }
                } else {
                    console.warn("No active session or write stream found for this client.");
                }
            }

            // Else, it'll be a string/object flag to trigger events
            else {
                const { type, noOfImages, bpm } = JSON.parse(message.toString())
                switch (type) {
                    case FlagType.START_JOB:
                        session.noOfImages = noOfImages
                        session.bpm = bpm
                    case FlagType.START_SESSION:
                        await initialiseImageStream(session) // Create write stream to new named pipe
                        await processImageStream(session) // Start FFMPEG and wait
                        await sendVideoToClient(ws, session) // Once processed, send video to client
                    case FlagType.END_SESSION:
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
