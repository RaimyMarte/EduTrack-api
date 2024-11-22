import { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();

const APIKey: string | undefined = process.env.API_KEY;

export const validateAPIKey = (req: Request, res: Response, next: NextFunction) => {
    const headerAPIKey: string | string[] | undefined = req.headers.apikey;

    if (req.path.startsWith('/public')) {
        next();
    } else if (headerAPIKey === APIKey) {
        next();
    } else {
        return res.status(403).json({ error: 'Invalid API Key' });
    }
};
