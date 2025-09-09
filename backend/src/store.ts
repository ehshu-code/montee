import { SessionData } from "./types";

export const EMPTY_SESSION_DATA: SessionData = {
    id: '',
    socket: null,
    noOfImages: 0,
    currentImageIndex: 0,
    pipePath: '',
    ffmpegProcessId: '',
    videoFilename: '',
    startedAt: null,
    isActive: false
}