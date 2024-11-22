import { handleUnknownError } from "../../utils";
import { Op } from "sequelize";
import { Request, Response } from "express";
import { sequelize } from "../../database/db";
import { successResponse } from "../../response";
import { User, UserInstance, UserToken, UserTokenInstance, UserHistory } from "../../models/authentication";
import { userOptions } from "../../options/user/userOptions";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv'
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';

dotenv.config()

export const generateAndSaveToken = async (user: UserInstance): Promise<UserTokenInstance> => {
    const userTokenId: string = uuidv4();
    const secretJWTKey: string | undefined = process.env.SECRET_JWT_KEY

    if (secretJWTKey) {
        const token: string = jsonwebtoken.sign({ id: user.Id, tokenId: userTokenId }, secretJWTKey, { expiresIn: '7d' });
        const decodedToken = jsonwebtoken.decode(token) as JwtPayload | null;
        const expirationTimestamp = decodedToken?.exp;

        return await UserToken.create({
            Id: userTokenId,
            Token: token,
            UserId: user.Id,
            ExpiresAt: expirationTimestamp
        });

    } else {
        throw Error('Secret JWT key is undefined');
    }
}

export const createUserHistory = async ({ UserName, Password, IpAddress, IsSuccess }: { UserName: string, Password: string, IpAddress: string, IsSuccess: boolean }) => {
    await UserHistory.create({
        Id: uuidv4(),
        UserName,
        Password,
        IpAddress,
        IsSuccess,
    });
}

export const login = async (req: Request, res: Response): Promise<void> => {
    const { UserNameOrEmail, Password, IpAddress }: { IpAddress: string; UserNameOrEmail: string, Password: string } = req.body

    try {
        if (!UserNameOrEmail) throw Error('UserNameOrEmail is required')
        if (!Password) throw Error('UserNameOrEmail is required')

        const user: UserInstance | null = await User.findOne({
            where: {
                [Op.or]: [
                    { UserName: UserNameOrEmail.toLowerCase().trim() },
                    { Email: UserNameOrEmail.toLowerCase().trim() }
                ]
            }
        })

        if (!user) {
            await createUserHistory({ UserName: UserNameOrEmail, Password, IpAddress, IsSuccess: false })
            throw Error('Invalid credentials')
        }

        if (!user?.PasswordHash) throw Error('Password undefined')

        const hashedPassword: string = user?.PasswordHash.toString()
        const isPasswordValid: boolean = bcrypt.compareSync(Password, hashedPassword);

        if (!isPasswordValid) {
            await createUserHistory({ UserName: UserNameOrEmail, Password, IpAddress, IsSuccess: false })
            throw Error('Invalid credentials')
        }

        if (!user?.Authorized) throw Error('User is not authorized')
        if (user?.Locked) throw Error('User has been blocked')

        if (user?.TFAEnabled) {
            const { response } = successResponse({
                message: 'User has TFA Enabled',
                data: { user: null, userId: user?.Id, TFAEnabled: user?.TFAEnabled }
            })
            res.json(response);
        } else {
            const userToken: UserTokenInstance = await generateAndSaveToken(user)

            //Update LastIpAccess, LastAccessDate,
            await User.update(
                { LastIpAccess: IpAddress, LastAccessDate: sequelize.literal('CURRENT_TIMESTAMP') },
                {
                    where: {
                        [Op.or]: [
                            { UserName: UserNameOrEmail.toLowerCase().trim() },
                            { Email: UserNameOrEmail.toLowerCase().trim() }
                        ]
                    }
                }
            );

            await createUserHistory({ UserName: UserNameOrEmail, Password: '*******', IpAddress, IsSuccess: true })

            const { response } = successResponse({
                message: 'Login successful',
                data: {
                    user: await User.findOne({
                        where: {
                            [Op.or]: [
                                { UserName: UserNameOrEmail.toLowerCase().trim() },
                                { Email: UserNameOrEmail.toLowerCase().trim() }
                            ]
                        },
                        ...userOptions,
                    }),
                    token: userToken.Token,
                }
            })
            res.json(response);
        }
    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to login' })
    }
}

export const checkAuthentication = async (req: Request, res: Response): Promise<void> => {
    const { user } = req

    try {
        if (!user?.Authorized) throw Error('User is not authorized')
        if (user?.Locked) throw Error('User has been blocked')

        const { response } = successResponse({
            data: { user },
            message: 'User authenticated'
        })

        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to check authentication' })
    }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    const { userToken } = req

    try {
        if (userToken) {
            await UserToken.destroy({ where: { Id: userToken.Id } });

            const { response } = successResponse({ message: 'Logout successful' })
            res.json(response);
        } else {
            throw Error('Token not found')
        }
    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to logout' })
    }
}

export const logoutAll = async (req: Request, res: Response): Promise<void> => {
    const { userToken } = req

    try {
        if (userToken) {
            await UserToken.destroy({ where: { UserId: userToken.UserId } });

            const { response } = successResponse({ message: 'Logout all successful' })
            res.json(response);
        } else {
            throw Error('Token not found')
        }
    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to logout all' })
    }
}