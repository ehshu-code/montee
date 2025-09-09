import { spawn, execSync } from "child_process";
import fs from "fs";
import { deleteFile, fileExists, readFileAsync } from "./helpers";
import { SessionData } from "./types";
import { EMPTY_SESSION_DATA } from "./store";

export async function createNamedPipe(pipePath: string) {
    // Remove existing pipe if exists
    if (fs.existsSync(pipePath)) {
        fs.unlinkSync(pipePath)
    }
    execSync(`mkdir -p /tmp/pipe/session`)
    // Create a new named pipe (FIFO)
    execSync(`mkfifo ${pipePath}`);
    console.log(`New named pipe created. Path: ${pipePath}`)
}

export async function initialiseImageStream(session: SessionData) {
    if (session) {
        session.pipePath = `/tmp/pipe/session/${session.id}`;
    } else {
        console.error("Invalid session or missing ID");
    }
    await createNamedPipe(session.pipePath);
    const writeStream = fs.createWriteStream(session.pipePath)
    session.writeStream = writeStream
}

/*
    * This function processes the image stream received from the WebSocket client using ffmpeg.
 */
export async function processImageStream(session: SessionData): Promise<void> {
    return new Promise((resolve, reject) => {
        const videoFilename = `processed_${session.id}.mp4`;
        session.videoFilename = videoFilename

        if (!fs.existsSync(session.pipePath)) {
            console.error('Named pipe not found:', session.pipePath);
            return reject(new Error('Named pipe does not exist'));
        }

        const ffmpeg = spawn('ffmpeg', [
            '-y',                  // overwrite output file if exists
            '-f', 'image2pipe',    // input is a pipe
            '-vcodec', 'mjpeg',    // input codec
            '-framerate', '25',    // input framerate
            '-i', '-',             // read from stdin
            '-c:v', 'libx264',     // encode to H.264
            '-pix_fmt', 'yuv420p', // ensure compatibility
            '-preset', 'fast',     // encoding speed/efficiency
            '-crf', '18',          // quality
            videoFilename
        ]);

        ffmpeg.stderr.on('data', (error) => {
            console.error(`FFMPEG log: ${error}`);
        });

        ffmpeg.stdout.on('data', (data) => {
            console.log(`FFMPEG progress: ${data}`);
        });

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                console.log('FFMPEG processing complete.');
                resolve();
            } else {
                reject(new Error(`FFMPEG exited with code ${code}`));
            }
        });

        ffmpeg.on('error', (err) => {
            reject(new Error(`FFMPEG process error: ${err.message}`));
        });
    });
}

export async function sendVideoToClient(ws: any, session: SessionData) {
    try {
        const exists = await fileExists(session.videoFilename);
        if (!exists) {
            console.error('Error: Video file does not exist.');
            return;
        }

        const videoData = await readFileAsync(session.videoFilename);
        ws.send(videoData, { binary: true }, (err: any) => {
            console.log('Sending video data:', videoData);
            if (err) console.error('Error sending video:', err);
        });
        ws.send('FINISHED')
    } catch (err) {
        console.error('Error:', err);
    }
}

export async function clearSessionFiles(session: SessionData) {
    deleteFile(session.videoFilename)
    fs.unlinkSync(session.pipePath) // Delete named pipe file
    // TODO: Reset session map data
    session = EMPTY_SESSION_DATA
}