import { checkPasswordHistory, handleUnknownError } from "../../utils";
import { encryptPassword, validatePassword } from "../../methods/password";
import { successResponse } from "../../response";
import { Op } from "sequelize";
import { Request, Response } from "express"
import { sendEmail } from "../../email/sendEmail";
import { sequelize } from "../../database/db";
import { User, UserInstance, UserPaswordHistory, UserResetPassword, UserResetPasswordInstance } from "../../models/authentication";
import { v4 as uuidv4 } from 'uuid';
import { uid } from "uid";
import bcrypt from 'bcrypt';

const frontEndBaseUrl: string = process.env.FRONTEND_BASE_URL || ''

export const changePassword = async (req: Request, res: Response): Promise<void> => {
    const { OldPassword, NewPassword, ConfirmNewPassword }: { OldPassword: string, NewPassword: string, ConfirmNewPassword: string } = req.body;
    const { user } = req
    const userId = user?.Id

    try {
        const user = await User.findOne({ where: { Id: userId } })

        const hashedPassword = user?.dataValues?.PasswordHash.toString()
        const isPasswordValid = bcrypt.compareSync(OldPassword, hashedPassword);

        if (!isPasswordValid) throw Error('Incorrect password')

        validatePassword(NewPassword, ConfirmNewPassword)

        await checkPasswordHistory({ Password: NewPassword, UserId: userId || '' })

        const { saltPassword, hashPassword } = encryptPassword(NewPassword)

        const updateData = await User.update(
            {
                PasswordSalt: saltPassword,
                PasswordHash: hashPassword,
                LastPwdChangedDate: sequelize.literal('CURRENT_TIMESTAMP'),
            },
            { where: { Id: userId } }
        );

        await UserPaswordHistory.create({
            UserId: userId,
            PasswordSalt: saltPassword,
            PasswordHash: hashPassword,
        })

        const { response } = successResponse({ data: updateData, message: 'Password has been change successfully' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to change password' })
    }
}

export const requestResetPassword = async (req: Request, res: Response): Promise<void> => {
    const { UserNameOrEmail, IpAddress }: { UserNameOrEmail: string, IpAddress: string } = req.body

    try {
        if (!UserNameOrEmail) throw Error('UserNameOrEmail is required')

        const user: UserInstance | null = await User.findOne({
            where: {
                [Op.or]: [
                    { UserName: UserNameOrEmail.toLowerCase().trim() },
                    { Email: UserNameOrEmail.toLowerCase().trim() }
                ]
            }
        })

        if (!user) throw Error('User does not exist')
        if (!user?.Email) throw Error('User does not have an email')

        const validationId = uuidv4()

        await UserResetPassword.create({
            UserId: user?.Id,
            RequestIPAddress: IpAddress,
            UrlValidation: validationId,
        });

        await sendEmail({
            to: user?.Email,
            subject: 'Password Reset Request',
            title: 'Password Reset Request',
            text: `Dear ${user?.FullName}, 

            We have received a request to reset your password for your account with us. 
        
            To reset your password, please click on the following link: ${frontEndBaseUrl}/auth/reset-password/confirm?validationId=${validationId}          
        
            If you have any questions or concerns, please don't hesitate to contact our support team. 
            `,
            buttonName: 'Reset Password',
            link: `${frontEndBaseUrl}/auth/reset-password/confirm?validationId=${validationId}  `,
            showButton: true,
        })

        const { response } = successResponse({ message: 'The email has been sent to reset the user password' })
        res.json(response);

    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to request reset password' })
    }
}

export const confirmResetPassword = async (req: Request, res: Response): Promise<void> => {
    const { Password, ConfirmPassword, IpAddress, UrlValidation }: { Password: string, ConfirmPassword: string, IpAddress: string, UrlValidation: string } = req.body

    try {
        if (!UrlValidation) throw Error('UrlValidation is required')

        const resetPasswordData: UserResetPasswordInstance | null = await UserResetPassword.findOne({ where: { UrlValidation }, });

        if (!resetPasswordData) throw Error('The request does not exist')
        if (resetPasswordData?.Validated) throw Error('This request has been used')

        const userId: string = resetPasswordData?.UserId

        const user: UserInstance | null = await User.findOne({ where: { Id: userId }, });
        if (!user) throw Error('The user does not exist')
        if (!user?.Email) throw Error('User does not have an email')

        validatePassword(Password, ConfirmPassword)
        await checkPasswordHistory({ Password: Password, UserId: userId })

        await UserResetPassword.update(
            {
                Validated: true,
                ValidatedDate: sequelize.literal('CURRENT_TIMESTAMP'),
                ValidatedIPAddress: IpAddress,
            },
            { where: { UrlValidation } }
        );

        const { saltPassword, hashPassword } = encryptPassword(Password)

        await User.update(
            {
                PasswordSalt: saltPassword,
                PasswordHash: hashPassword,
                LastPwdChangedDate: sequelize.literal('CURRENT_TIMESTAMP'),
            },
            { where: { Id: userId } }
        );

        await UserPaswordHistory.create({
            UserId: userId,
            PasswordSalt: saltPassword,
            PasswordHash: hashPassword,
        })

        await sendEmail({
            to: user?.Email,
            subject: 'Password Successfully Reset',
            title: 'Password Successfully Reset',
            text: `Dear ${user?.FullName}, 
        
            This is to confirm that the password for your account with us has been successfully reset. 
        
            If you have any further questions or concerns, please don't hesitate to contact our support team.
                `
        })

        const { response } = successResponse({ message: 'The password has been changed successfully' })
        res.json(response);

    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to reset password' })
    }
}


export const changePasswordNextLogin = async (req: Request, res: Response): Promise<void> => {
    const { Password, ConfirmPassword }: { Password: string, ConfirmPassword: string } = req.body;
    const { user } = req

    try {
        const userId = user?.dataValues?.Id
        if (!userId) throw new Error("User not found")

        validatePassword(Password, ConfirmPassword)
        await checkPasswordHistory({ Password, UserId: userId })

        const { saltPassword, hashPassword } = encryptPassword(Password)

        const updateData = await User.update(
            {
                PasswordSalt: saltPassword,
                PasswordHash: hashPassword,
                ChangePwdNextLogin: false,
                LastPwdChangedDate: sequelize.literal('CURRENT_TIMESTAMP'),
            },
            { where: { Id: userId } }
        );

        await UserPaswordHistory.create({
            UserId: userId,
            PasswordSalt: saltPassword,
            PasswordHash: hashPassword,
        })

        const { response } = successResponse({ data: updateData, message: 'Password has been change successfully' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to change password' })
    }
}


export const adminResetPassword = async (req: Request, res: Response): Promise<void> => {
    const { userId, Password, ConfirmPassword, sendEmailToUser, AutomaticPassword, ChangePwdNextLogin }: { userId: string, Password: string, ConfirmPassword: string, sendEmailToUser: boolean, AutomaticPassword: boolean, ChangePwdNextLogin: boolean } = req.body;
    const { userToken } = req

    try {
        if (!userId) throw new Error("User not sent")

        const user = await User.findOne({ where: { Id: userId }, attributes: ['Id', 'Email', 'FirstName','LastName','FullName'] })

        if (!user) throw Error("User not found")
        if (sendEmailToUser && !user?.Email) throw Error("User does not have an email")

        if (!AutomaticPassword) {
            validatePassword(Password, ConfirmPassword)
        }

        const generatedPassword = uid(12)
     
        const { saltPassword, hashPassword } = encryptPassword(AutomaticPassword ? generatedPassword : Password)

        const updateData = await User.update(
            {
                ChangePwdNextLogin: ChangePwdNextLogin ? true : AutomaticPassword ? true : false,
                LastModifiedBy: userToken?.UserId,
                LastModifiedDate: sequelize.literal('CURRENT_TIMESTAMP'),
                LastPwdChangedDate: sequelize.literal('CURRENT_TIMESTAMP'),
                PasswordSalt: saltPassword,
                PasswordHash: hashPassword,
            },
            { where: { Id: userId } }
        );



        if (sendEmailToUser) {
            await sendEmail({
                to: user?.Email || '',
                subject: 'Your password has been reset',
                title: 'Your password has been reset',
                text: `Dear ${user?.FullName},
            
                We are pleased to inform you that your password has been successfully reset.
            
                ${AutomaticPassword ? `Your temporary password is: ${generatedPassword}. Please note that you will need to change this password after your first login for security reasons.` : ""}
            
                To access your user, please click on the following link to sign in: ${frontEndBaseUrl}/auth/login
            
                If you have any questions or need assistance, please don't hesitate to contact us.
                `,
                buttonName: 'Login',
                link: `${frontEndBaseUrl}/auth/login`,
                showButton: true,
            })
        }

        const { response } = successResponse({ data: { updateData, password: AutomaticPassword ? generatedPassword : null }, message: 'Password has been change successfully' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to change password' })
    }
}