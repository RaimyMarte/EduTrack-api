import { Request, Response } from "express";
import { Op } from "sequelize";
import { uid } from "uid";
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from "../../database/db";
import { sendEmail } from "../../email/sendEmail";
import { User, UserHistory, UserPaswordHistory, } from "../../models/authentication";
import { UserRole } from "../../models/maintenance";
import { userOptions } from "../../options/user/userOptions";
import { encryptPassword, validatePassword } from "../../methods/password";
import { successResponse } from "../../response";
import { capitalizeFirstLetter, convertReqBody, handleUnknownError } from "../../utils";
import { deleteFile, uploadFiles } from "../files";
import { getAllHandler, getByIdHandler, paginationSearchHandler, } from "../../methods/request";

const frontEndBaseUrl: string = process.env.FRONTEND_BASE_URL || ''
const apiBaseUrl: string = process.env.API_BASE_URL || ''

interface CreateUserBody {
    Email: string
    FirstName: string
    LastName: string
    Phone: string
    ChangePwdNextLogin: boolean
    AutomaticPassword: boolean
    Password: string
    ConfirmPassword: string
    UserRoleId: number
}

interface UpdateUserBody {
    Email: string
    FirstName: string
    LastName: string
    UserName: string
    UserId: string
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    const { search } = req.query;

    const searchParameters = [
        { UserName: { [Op.like]: `%${search}%` } },
        { DisplayName: { [Op.like]: `%${search}%` } },
        { Email: { [Op.like]: `%${search}%` } },
        { Phone: { [Op.like]: `%${search}%` } },
        sequelize.where(sequelize.fn('CONCAT', sequelize.col('UserProfile.FirstName'), ' ', sequelize.col('UserProfile.LastName')), 'LIKE', `%${search}%`),
        sequelize.where(sequelize.col('UserRole.Name'), 'LIKE', `%${search}%`),
    ]

    paginationSearchHandler({
        req,
        res,
        model: User,
        searchParameters,
        options: {
            ...userOptions,
            order: [['CreatedDate', 'DESC']],
        },
    })
}

export const getUsersForDropdown = async (_req: Request, res: Response): Promise<void> => {
    getAllHandler({
        res,
        model: User,
        options: {
            attributes: ['Id', 'DisplayName', 'Picture', 'UserRoleId'],
            include: [{
                model: UserRole,
                as: 'UserRole',
                attributes: ['Name'],
            }],
            order: [['DisplayName', 'DESC']],
        },
        extraWhereConditions: {
            UserRoleId: {
                [Op.ne]: 1,
            }
        },
    })
}

export const getUserById = async (req: Request, res: Response): Promise<void> => getByIdHandler({ req, res, model: User, options: userOptions })

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { FirstName, LastName, Email, AutomaticPassword, ChangePwdNextLogin, Password, ConfirmPassword, }: CreateUserBody = req.body;
    const { userToken } = req

    const createBody = convertReqBody(req.body);

    try {
        if (!Email) throw Error('Email is required')

        const formattedEmail: string = Email.toLowerCase().trim()
        const formattedDisplayName: string = capitalizeFirstLetter(`${FirstName} ${LastName}`)

        if (!AutomaticPassword) validatePassword(Password, ConfirmPassword)

        const generatedPassword = uid(12)
        const { saltPassword, hashPassword } = encryptPassword(AutomaticPassword ? generatedPassword : Password)

        const user = await User.create({
            ...createBody,
            ChangePwdNextLogin: ChangePwdNextLogin ? true : AutomaticPassword ? true : false,
            CreatedBy: userToken?.UserId,
            DisplayName: formattedDisplayName,
            Email: formattedEmail,
            Id: uuidv4(),
            PasswordHash: hashPassword,
            PasswordSalt: saltPassword,
        })

        if (!AutomaticPassword) {
            await UserPaswordHistory.create({
                UserId: user?.Id,
                PasswordSalt: saltPassword,
                PasswordHash: hashPassword,
            })
        }

        await sendEmail({
            to: Email,
            subject: 'Your Account Has Been Created',
            title: 'Your Account Has Been Created',
            text: `Dear ${FirstName} ${LastName},
        
            We are pleased to inform you that your account has been successfully created.
        
            ${AutomaticPassword ? `Your temporary password is: ${generatedPassword}. Please note that you will need to change this password after your first login for security reasons.` : ""}
        
            To access your account, please click on the following link to sign in: ${frontEndBaseUrl}/auth/login
        
            If you have any questions or need assistance, please don't hesitate to contact us.
            `,
            buttonName: 'Login',
            link: `${frontEndBaseUrl}/auth/login`,
            showButton: true,
        })

        const { response } = successResponse({ message: 'User has been created successfully' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to create user', })
    }
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const { UserName, Email, UserId }: UpdateUserBody = req.body;
    const { userToken } = req

    const updateBody = convertReqBody(req.body);

    try {
        if (!UserId) throw Error('User was not sent')

        const findUser = await User.findOne({ where: { Id: UserId }, attributes: ['Id', 'DisplayName'] })
        if (!findUser) throw Error('User was not found')

        const formattedEmail: string = Email.toLowerCase().trim()
        const formattedUserName: string = UserName.toLowerCase().trim()

        const userUpdated = await User.update(
            {
                ...updateBody,
                LastModifiedBy: userToken?.UserId,
                LastModifiedDate: sequelize.literal('CURRENT_TIMESTAMP'),
                Email: formattedEmail,
                UserName: formattedUserName,
            },
            { where: { Id: UserId } }
        )

        const { response } = successResponse({ data: userUpdated, message: 'User has been updated successfully' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to update user', })
    }
}


export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    try {
        await User.destroy({ where: { Id: id } });

        const { response } = successResponse({ data: null, message: 'User has been deleted successfully' })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}


export const uploadUserPicture = async (req: Request, res: Response): Promise<void> => {
    try {
        const { params, userToken } = req;
        const { userId } = params;

        const user = await User.findOne({ where: { Id: userId }, attributes: ['Id', 'Picture'] })
        if (!user) throw Error('User does not exist')

        if (user?.Picture) deleteFile(user?.Picture)

        const savedFile = await uploadFiles({ req, folder: 'users' });

        const updateData: Record<string, any> = {
            Picture: `${apiBaseUrl}/public/users/${savedFile[0]}`,
            LastUpdatedBy: userToken?.UserId,
            LastUpdatedDate: sequelize.literal('CURRENT_TIMESTAMP'),
        };

        const updatedUser = await User.update(updateData, { where: { Id: userId } });

        const { response } = successResponse({ data: updatedUser, message: 'User Picture was uploaded successfully' });
        res.json(response);

    } catch (error: unknown) {
        handleUnknownError({ error, res, title: 'Error when trying to upload user picture' })
    }
}

export const getLoginHistory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params

    let extraWhereConditions

    try {
        const user = await User.findOne({
            where: { Id: id },
            attributes: ['Id', 'UserName', 'Email']
        })

        if (!user) throw Error('User has not been found')

        extraWhereConditions = {
            [Op.or]: [
                { UserName: user?.UserName },
                { UserName: user?.Email }
            ],
            isSuccess: true,
        }

    } catch (error: unknown) {
        handleUnknownError({ error, res, })
        return
    }

    paginationSearchHandler({
        req,
        res,
        extraWhereConditions,
        model: UserHistory,
        options: {
            order: [['CreatedDate', 'DESC']],
        },
    })
}