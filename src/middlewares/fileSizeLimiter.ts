import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../response";
import { UploadedFile } from "express-fileupload";


export const fileSizeLimiter = (mbSize: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const files = req.files
            const fileSizeLimiter = mbSize * 1024 * 1024

            const filesOverLimit: string[] = []

            if (!files || (Array.isArray(files) && files.length === 0)) {
                throw new Error('Files were not uploaded');
            }

            Object.keys(files).forEach(key => {
                if ((files as Record<string, UploadedFile>)[key].size > fileSizeLimiter) {
                    filesOverLimit.push((files as Record<string, UploadedFile>)[key].name)
                }
            })

            if (filesOverLimit.length)
                throw Error(`The file must be less than ${mbSize}MB`)

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