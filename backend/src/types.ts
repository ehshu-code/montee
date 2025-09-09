import fs from "fs";
import WebSocket from "ws";

export enum ServerFeedback {
    FINISHED = "FINISHED"
}

export enum MessageTypes {
    START_SESSION = "START_SESSION",
    END_SESSION = "END_SESSION",
    START_JOB = "START_JOB",
    END_JOB = "END_JOB"
}

export interface SessionData {
    id: string;
    socket: WebSocket | null;
    noOfImages: number;
    currentImageIndex: number;
    pipePath: string;
    writeStream?: fs.WriteStream;
    ffmpegProcessId: string;
    videoFilename: string;
    startedAt: Date | null;
    isActive: boolean;
};