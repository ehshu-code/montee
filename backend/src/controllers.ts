import { Request, Response } from "express";
import { imageService } from "./services";

export const imageUploadController = async (req: Request, res: Response) => {
    try {
        const result = await imageService.uploadImages();

        res.json({ message: "Image Uploaded!", data: result });
    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
