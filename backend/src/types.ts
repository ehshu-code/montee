import fs from "fs";
import WebSocket from "ws";

export interface Flag {
    type: FlagType
}

export enum FlagType {
    // From client ---> server
    START_JOB = 'START_JOB',
    END_JOB = 'END_JOB',
    START_SESSION = 'START_SESSION',
    END_SESSION = 'END_SESSION',
    // From server ---> client
    PROGRESS_IND = 'PROGRESS_IND',
    FINISHED_JOB = 'FINISHED_JOB'
}

export interface ProgressIndFlag extends Flag {
    currentImageProcessingNo: number
}

export interface SessionData {
    id: string;
    socket: WebSocket | null;
    noOfImages: number;
    bpm: number;
    currentImageIndex: number;
    pipePath: string;
    writeStream?: fs.WriteStream;
    ffmpegProcessId: string;
    videoFilename: string;
    startedAt: Date | null;
    isActive: boolean;
};