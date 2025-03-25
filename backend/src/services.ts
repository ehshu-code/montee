import { spawn } from "child_process";
import { deleteFile, fileExists, readFileAsync } from "./helpers";


// Function to handle image stream collection
export function collectImageStream(ws: any) {
    let imageBuffers: Buffer[] = [];
    let timeout: NodeJS.Timeout | null = null;

    ws.on("message", (message: any) => {
        if (message instanceof Buffer) {
            imageBuffers.push(message);
            console.log("Received image chunk:", message.length);

            // Reset timeout on every new chunk
            if (timeout) clearTimeout(timeout);

            timeout = setTimeout(async () => {
                const fullBuffer = Buffer.concat(imageBuffers);
                console.log("Processing complete image stream:", fullBuffer.length);

                // Process and send back the video
                const videoFilename = await processImageStream(ws, fullBuffer);
                sendVideoToClient(ws, videoFilename);

                // Clear buffer after processing
                imageBuffers = [];
            }, 3000);
        } else {
            console.error("Unexpected message type:", typeof message);
        }
    });
}


/*
    * This function processes the image stream received from the WebSocket client using ffmpeg.
 */
export async function processImageStream(ws: any, data: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const outputFilename = `output_${timestamp}.mp4`;

        const ffmpeg = spawn('ffmpeg', [
            '-f', 'image2pipe', '-framerate', '10', // 10 FPS (Each image lasts 0.1s)
            '-i', '-', // Read images from stdin
            '-r', '30', // Output frame rate
            '-c:v', 'libx264', // Use H.264 codec (libx264)
            '-pix_fmt', 'yuv420p', // Ensure output uses yuv420p pixel format
            '-loglevel', 'error', // Only show errors
            '-stats', '-progress', 'pipe:1', // Show stats and progress
            outputFilename // Output file name
        ]);        

        // Log ffmpeg errors
        ffmpeg.stderr.on('data', (error) => {
            console.error(`FFMPEG log: ${error}`);
        });

        // Write stdin data to ffmpeg input stream
        if (!ffmpeg.stdin.destroyed) {
            console.log(`Writing data to ffmpeg input stream: ${data.length} bytes`);
            ffmpeg.stdin.write(data);
            // Close ffmpeg input stream
            ffmpeg.stdin.end();
        }

        // Close ffmpeg input when WebSocket closes
        ws.on('close', () => {
            console.log('WebSocket closed. Ending ffmpeg input.');
            ffmpeg.stdin.end();
        });

        // Listen for ffmpeg process to close
        ffmpeg.on('close', (code) => {
            if (code === 0) {
                console.log('FFMPEG processing complete.');
                resolve(outputFilename);
            } else {
                reject(new Error(`FFMPEG exited with code ${code}`));
            }
        });

        // Handle potential ffmpeg process errors
        ffmpeg.on('error', (err) => {
            reject(new Error(`FFMPEG process error: ${err.message}`));
        });
    });
}

export async function sendVideoToClient(ws: any, outputFilename: string) {
    try {
        const exists = await fileExists(outputFilename);
        if (!exists) {
            console.error('Error: Video file does not exist.');
            return;
        }

        const videoData = await readFileAsync(outputFilename);
        console.log('Sending video data:', videoData.length);
        ws.send(videoData, { binary: true }, (err: any) => {
            if (err) console.error('Error sending video:', err);
        });
        
        await ws.close();
        // deleteFile(outputFilename);
    } catch (err) {
        console.error('Error:', err);
    }
}