import WebSocket from 'ws';
import { spawn } from 'child_process';
import fs from 'fs';

export const imageService = {
    async uploadImage(imageData: any) {
        // Generate a timestamp-based filename
        const timestamp = Date.now();
        const outputFilename = `output_${timestamp}.mp4`;
        // Open WebSocket connection to frontend
        const ws = new WebSocket("ws://localhost:8080");

        ws.on('open', () => {
            console.log('WebSocket connection opened.');
        });

        const ffmpeg = spawn('ffmpeg', [
            '-f', 'image2pipe', '-framerate', '7.5', '-i', '-',
            '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', outputFilename
        ]);

        // Handle FFMPEG errors
        ffmpeg.stderr.on('data', (data) => {
            console.error(`FFMPEG error: ${data}`);
        });

        ffmpeg.on('error', (err) => {
            console.error(`FFMPEG process error: ${err.message}`);
        });

        // Pipe data from WebSocket to ffmpeg
        ws.on('message', (data: BinaryType) => {
            ffmpeg.stdin.write(data);
        });

        // Close ffmpeg when WebSocket closes
        ws.on('close', () => {
            ffmpeg.stdin.end();
        });

        // When FFMPEG finishes processing, send the video back to the frontend
        ffmpeg.on('close', () => {
            fs.readFile(outputFilename, (err, video) => {
                if (err) {
                    console.error('Error reading video:', err);
                    return;
                }
                ws.send(video, { binary: true });

                // Delete the file after sending to avoid storage clutter
                fs.unlink(outputFilename, (err) => {
                    if (err) console.error('Error deleting video:', err);
                });
            });
        });
    }
};
