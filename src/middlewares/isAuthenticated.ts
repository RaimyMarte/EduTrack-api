import { errorResponse } from "../response";
import { NextFunction, Request, Response } from "express";
import { User, UserInstance, UserToken, UserTokenInstance, } from "../models/authentication";
import { userOptions } from "../options/user/userOptions";
import dotenv from 'dotenv'
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';

dotenv.config()

const secretJWTKey: string | undefined = process.env.SECRET_JWT_KEY

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const headerAuthorization: string | undefined = req.header('Authorization')

        if (headerAuthorization) {
            const token: string = headerAuthorization.replace('Bearer ', '');

            if (token === 'undefined')
                throw Error("User is not authenticated");

            if (secretJWTKey) {
                const verifyToken = jsonwebtoken.verify(token, secretJWTKey) as JwtPayload;
                const userToken: UserTokenInstance | null = await UserToken.findOne({ where: { Id: verifyToken.tokenId } });

                if (!userToken)
                    throw Error("User is not authenticated");

                const user: UserInstance | null = await User.findOne({
                    where: { Id: userToken.UserId },
                    ...userOptions
                });

                if (!user)
                    throw Error("User not found");

                req.user = user;
                req.userToken = userToken;
                next();
            }
            else {
                throw Error('Secret JWT key is undefined');
            }
        } else {
            throw Error("Authorization header not found");
        }
    }
    catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === 'jwt expired') {
                // Token has expired, delete it from the database
                const headerAuthorization: string | undefined = req.header('Authorization')

                if (headerAuthorization) {
                    const Token: string = headerAuthorization.replace('Bearer ', '');
                    await UserToken.destroy({ where: { Token } });
                }
            }

            // The error is an instance of the Error class
            const { response } = errorResponse({
                title: 'Unauthorized',
                message: error.message,
            });
            res.json(response);
        } else {
            // Handle other unknown error types or scenarios
            res.status(500).json({ message: "Internal server error" });
        }
    }
};