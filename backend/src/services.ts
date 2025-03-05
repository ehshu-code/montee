import WebSocket from 'ws';
import { spawn } from 'child_process';
import fs from 'fs';

export const imageService = {
    async uploadImages() {
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

        // Handle ffmpeg errors
        ffmpeg.stderr.on('data', (data) => {
            console.error(`FFMPEG error: ${data}`);
        });
        ffmpeg.on('error', (err) => {
            console.error(`FFMPEG process error: ${err.message}`);
            ws.close();
        });

        // When images are sent over from frontend, send to ffmpeg
        ws.on('message', (data: Buffer) => {
            if (!ffmpeg.stdin.destroyed) {
                ffmpeg.stdin.write(data);
            }
        });

        ws.on('close', () => {
            console.log('WebSocket closed. Ending ffmpeg input.');
            ffmpeg.stdin.end();
        });
        
        // When ffpemg finishes processing the video, send it to the frontend
        ffmpeg.on('close', (code) => {
            if (code !== 0) {
                console.error(`FFMPEG exited with code ${code}`);
                return;
            }

            console.log('FFMPEG processing complete. Sending video file.');

            // Ensure file exists before reading
            fs.access(outputFilename, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error('Error: Video file does not exist.');
                    return;
                }

                fs.readFile(outputFilename, (err, video) => {
                    if (err) {
                        console.error('Error reading video:', err);
                        return;
                    }
                    
                    ws.send(video, { binary: true }, (sendErr) => {
                        if (sendErr) console.error('Error sending video:', sendErr);
                        ws.close();
                    });

                    // Delete the file after sending
                    fs.unlink(outputFilename, (unlinkErr) => {
                        if (unlinkErr) console.error('Error deleting video:', unlinkErr);
                    });
                });
            });
        });
    }
};
