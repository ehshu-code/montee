export type RootStackParamList = {
    LandingScreen: undefined;
    UploadScreen: undefined;
    ProcessingScreen: undefined;
    ResultsScreen: undefined;
};

export interface ImageSelection {
    index: number; // index of the image in the array
    uri: string; // URI of the image
    base64: string;
}

export interface Flag {
    type: FlagType
}

export interface StartJobFlag extends Flag {
    noOfImages: number
    bpm?: number
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