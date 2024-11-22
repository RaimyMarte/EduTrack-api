import { errorResponse } from "../response";
import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import path from "path";

export const fileExtLimiter = (allowedExtArray: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const files = req.files
            const filesExtensions: string[] = []

            if (!files || (Array.isArray(files) && files.length === 0)) {
                throw new Error('Files were not uploaded');
            }

            Object.keys(files).forEach(key => {
                filesExtensions.push(path.extname((files as Record<string, UploadedFile>)[key].name))
            })

            const allowed = filesExtensions.every(ext => allowedExtArray.includes(ext))

            if (!allowed)
                throw Error(`Only files allowed ${allowedExtArray.join(', ')}`)

            next()
        }
        catch (error: unknown) {
            if (error instanceof Error) {
                // The error is an instance of the Error class
                const { response } = errorResponse({ title: 'Error when trying to upload files', message: error.message });
                res.json(response);
            } else {
                // Handle other unknown error types or scenarios
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }
}