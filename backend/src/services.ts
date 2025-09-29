import { spawn, execSync } from "child_process";
import fs from "fs";
import { deleteFile, fileExists, readFileAsync } from "./helpers";
import { Flag, FlagType, SessionData } from "./types";
import { EMPTY_SESSION_DATA } from "./store";
import heicConvert from 'heic-convert';
import sharp from "sharp";

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
        const inputFramerate = (session.bpm / 60).toString() // BPS which equals FPS (input)

        if (!fs.existsSync(session.pipePath)) {
            console.error('Named pipe not found:', session.pipePath);
            return reject(new Error('Named pipe does not exist'));
        }
        const ffmpeg = spawn('ffmpeg', [
            '-y',
            '-f', 'mjpeg',           // tell FFmpeg these are JPEGs
            '-framerate', '5',       // input framerate
            '-i', session.pipePath,  // the named pipe
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-r', '30',              // output framerate
            '-pix_fmt', 'yuv420p',
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
        const finishedJobFlag: Flag = {
            type: FlagType.FINISHED_JOB,
        }
        ws.send(JSON.stringify(finishedJobFlag))
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

/**
 * Preprocess an image buffer: convert HEIC → JPEG, crop to 9:16, resize to 1080x1920
 * @param {Buffer} inputBuffer - incoming image buffer (HEIC, JPEG, etc.)
 * @returns {Promise<Buffer>} - processed JPEG buffer
 */
export async function preprocessImageBuffer(inputBuffer: Buffer) {
    const image = sharp(inputBuffer);

    // Get original dimensions
    const metadata = await image.metadata();
    const origWidth = metadata.width;
    const origHeight = metadata.height;

    const targetAspect = 1080 / 1920; // 9:16

    let cropWidth, cropHeight, left, top;

    if ((origWidth / origHeight) > targetAspect) {
        // Image too wide → crop width
        cropHeight = origHeight;
        cropWidth = Math.round(origHeight * targetAspect);
        left = Math.floor((origWidth - cropWidth) / 2);
        top = 0;
    } else {
        // Image too tall → crop height
        cropWidth = origWidth;
        cropHeight = Math.round(origWidth / targetAspect);
        left = 0;
        top = Math.floor((origHeight - cropHeight) / 2);
    }

    // Process and return as buffer
    const outputBuffer = await image
        .extract({ left, top, width: cropWidth, height: cropHeight }) // crop to 9:16
        .resize(1080, 1920) // resize
        .toBuffer();

    return outputBuffer;
}

/**
 * Converts a HEIC/HEIF buffer into a JPEG buffer.
 * @param heicBuffer The HEIC/HEIF image as a Node.js Buffer
 * @returns JPEG buffer
 */
export async function convertHeicToJpeg(heicBuffer: Buffer): Promise<Buffer> {
    try {
        const jpegBuffer = await heicConvert({
            buffer: heicBuffer,  // input HEIC buffer
            format: 'JPEG',      // output format
            quality: 0.9         // quality 0-1
        });

        return Buffer.from(jpegBuffer); // ensure it’s a Node Buffer
    } catch (err) {
        console.error('Failed to convert HEIC to JPEG:', err);
        throw err;
    }
}