import fs from 'fs';

// Helper functions for file operations

export function fileExists(filename: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fs.access(filename, fs.constants.F_OK, (err) => {
            if (err) reject(err);
            else resolve(true);
        });
    });
}

export function readFileAsync(filename: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

export function deleteFile(filename: string): void {
    fs.unlink(filename, (err) => {
        if (err) console.error('Error deleting video:', err);
    });
}