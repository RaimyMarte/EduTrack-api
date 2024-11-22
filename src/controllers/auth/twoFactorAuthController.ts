import { createUserHistory, generateAndSaveToken } from "./authController";
import { handleUnknownError } from "../../utils";
import { Request, Response } from "express";
import { sequelize } from "../../database/db";
import { successResponse } from "../../response";
import { User, UserTokenInstance } from "../../models/authentication";
import QRCode from 'qrcode'
import speakeasy from 'speakeasy';
import { userOptions } from "../../options/user/userOptions";

export const generateTFASecretKey = async (req: Request, res: Response): Promise<void> => {
    const { userToken } = req

    try {
        const { base32: secretKey, otpauth_url } = speakeasy.generateSecret({ name: 'Edutrack' });

        if (!otpauth_url) throw Error('Error generating QR code')

        const qrCode = await QRCode.toDataURL(otpauth_url)

        await User.update(
            { TFATempSecretKey: secretKey, },
            { where: { Id: userToken?.UserId } }
        );

        const { response } = successResponse({ data: { key: secretKey, qrCode }, message: 'Two Factor Authentication secret created successful' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to create Two Factor Authentication secret ' })
    }
}


export const verifyTFASecretKey = async (req: Request, res: Response): Promise<void> => {
    const { userToken } = req
    const { token }: { token: string, } = req.body
    try {
        const user = await User.findOne({ where: { Id: userToken?.UserId }, attributes: ['TFAEnabled', 'TFATempSecretKey'] })
        const secretKey = user?.TFATempSecretKey
        if (!secretKey) throw Error('User does not have TFA secret key')
        if (user?.TFAEnabled) throw Error('TFA has been enabled already')


        const verified = speakeasy.totp.verify({
            secret: secretKey,
            encoding: 'base32',
            token
        });

        if (!verified) throw Error('Invalid Two Factor Authentication token')

        await User.update(
            {
                TFAEnabled: true,
                TFATempSecretKey: null,
                TFASecretKey: secretKey,
                TFADate: sequelize.literal('CURRENT_TIMESTAMP'),
            },
            { where: { Id: userToken?.UserId } }
        );

        const { response } = successResponse({ message: 'Two Factor Authentication has been verified succesfully' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to verify Two Factor Authentication' })
    }
}

export const validateTFA = async (req: Request, res: Response): Promise<void> => {
    const { token, userId, IpAddress }: { token: string, userId: string, IpAddress: string } = req.body

    try {
        if (!userId) throw Error('User has not been sent')

        const user = await User.findOne({ where: { Id: userId }, })

        if (!user?.TFAEnabled) throw Error('User does not have TFA enabled')
        if (!user?.TFASecretKey) throw Error('User does not have TFA secret key')

        const verified = speakeasy.totp.verify({
            secret: user?.TFASecretKey,
            encoding: 'base32',
            token
        });

        if (!verified) throw Error('Invalid Two Factor Authentication token')

        const userToken: UserTokenInstance = await generateAndSaveToken(user)

        await createUserHistory({ UserName: user?.UserName || user?.Email, Password: '*******', IpAddress, IsSuccess: true })

        await User.update(
            { LastIpAccess: IpAddress, LastAccessDate: sequelize.literal('CURRENT_TIMESTAMP') },
            { where: { Id: userId } }
        );

        const { response } = successResponse({
            message: 'Login successful',
            data: {
                user: await User.findOne({
                    where: { Id: userId },
                    ...userOptions,
                }),
                token: userToken.Token,
            }
        })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to validate Two Factor Authentication' })
    }
}

export const disableTFA = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params
    try {
        const user = await User.findOne({ where: { Id: userId } })
        if (!user) throw Error('User was not found')
        if (!user?.TFAEnabled) throw Error('User does not have TFA enabled')

        await User.update(
            { TFAEnabled: false, TFADate: null, TFASecretKey: null, },
            { where: { Id: userId } }
        );

        const { response } = successResponse({ message: 'Two Factor Authentication has been disable successfully' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to disable Two Factor Authentication' })
    }
}