import { Request, Response } from "express";

export const imageUpload = async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        res.json({ message: "Image Uploaded!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
    }