import { spawn, execSync } from "child_process";
import fs, { write } from "fs";
import { deleteFile, fileExists, isUtf8String, readFileAsync } from "./helpers";


// Function to handle image stream collection
export function startImageStream(ws: any, pipePath: string) {
    const stream = fs.createWriteStream(pipePath)
    ws.on("message", async (message: Buffer) => {
        console.log(`Message received:`, message)
         if (isUtf8String(message)) {
            const textFlag = message.toString('utf8');
            if (textFlag === 'isLast') {
                console.log('isLast')
                stream.end()
                fs.unlinkSync(pipePath)
            }
         }
        else {
            console.log("Image received");
            const currentBuffer = Buffer.from(message);
            console.log("Buffer size:", currentBuffer.length);
    
            // Write to named pipe
            stream.write(currentBuffer, (err) => {
                if (err) {
                    console.log(`Write error:`, err)
                } else {
                    console.log('Write successful')
                }
            }
        )
        }
    }
    );
}

export async function createNamedPipe(pipePath: string) {
    // Remove existing pipe if exists
    if (fs.existsSync(pipePath)) {
        fs.unlinkSync(pipePath)
    }
    // Create a new named pipe (FIFO)
    execSync(`mkfifo ${pipePath}`);
    console.log(`New named pipe created. Path: ${pipePath}`)

}

export async function writeToNamedPipe(pipePath: string, data: Buffer) {
    const stream = fs.createWriteStream(pipePath)
    stream.write(data)
}


/*
    * This function processes the image stream received from the WebSocket client using ffmpeg.
 */
export async function processImageStream(ws: any, pipePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const outputFilename = `output_${timestamp}.mp4`;

        if (!fs.existsSync(pipePath)) {
            console.error('Named pipe not found:', pipePath);
            return reject(new Error('Named pipe does not exist'));
        }

        const ffmpeg = spawn('ffmpeg', [
            '-f', 'image2pipe',
            '-framerate', '10', // Input frame rate
            '-i', pipePath,     // Input from named pipe
            '-r', '30',         // Output frame rate
            '-c:v', 'libx264',  // Encode to H.264
            '-pix_fmt', 'yuv420p',
            '-loglevel', 'info', // Change to info for debugging
            '-stats',
            '-progress', 'pipe:1',
            outputFilename
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
                resolve(outputFilename);
            } else {
                reject(new Error(`FFMPEG exited with code ${code}`));
            }
        });

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
        ws.send(videoData, { binary: true }, (err: any) => {
            console.log('Sending video data:', videoData);
            if (err) console.error('Error sending video:', err);
        });
        
        await ws.close();
        deleteFile(outputFilename);
    } catch (err) {
        console.error('Error:', err);
    }
}