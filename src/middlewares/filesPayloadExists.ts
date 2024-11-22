import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../response";

export const filesPayloadExists = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            throw new Error('Files were not uploaded');
        }
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