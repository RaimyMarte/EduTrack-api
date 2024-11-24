import { Request, Response } from "express";
import { Op } from "sequelize";
import { uid } from "uid";
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from "../../database/db";
import { sendEmail } from "../../email/sendEmail";
import { encryptPassword, validatePassword } from "../../methods/password";
import { getAllHandler, getByIdHandler, paginationSearchHandler, } from "../../methods/request";
import { User, UserHistory, UserPaswordHistory, } from "../../models/authentication";
import { userOptions } from "../../options/user/userOptions";
import { successResponse } from "../../response";
import { convertReqBody, handleUnknownError } from "../../utils";
import { deleteFile, uploadFiles } from "../files";

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
    UserName: string
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
        { FirstName: { [Op.like]: `%${search}%` } },
        { LastName: { [Op.like]: `%${search}%` } },
        { UserName: { [Op.like]: `%${search}%` } },
        { Email: { [Op.like]: `%${search}%` } },
        { Phone: { [Op.like]: `%${search}%` } },
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

export const getProfessorsForDropdown = async (_req: Request, res: Response): Promise<void> => {
    getAllHandler({
        res,
        model: User,
        options: {
            attributes: ['Id', 'FullName', 'FirstName', 'LastName'],
            order: [['FirstName', 'DESC']],
        },
        extraWhereConditions: {
            UserRoleId: 2
        },
    })
}

export const getUserById = async (req: Request, res: Response): Promise<void> => getByIdHandler({ req, res, model: User, options: userOptions })

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { FirstName, LastName, Email, AutomaticPassword, UserName, ChangePwdNextLogin, Password, ConfirmPassword, }: CreateUserBody = req.body;
    const { userToken } = req

    const createBody = convertReqBody(req.body);

    try {
        if (!Email) throw Error('Email is required')
        if (!UserName) throw Error('UserName is required')

        const userNameExists = await User.findOne({
            where: { UserName: UserName.toLowerCase().trim() },
            attributes: ['Id']
        });

        if (userNameExists)
            throw Error(`User Name ${UserName} already exist`);


        const emailExists = await User.findOne({
            where: { Email: Email.toLowerCase().trim() },
            attributes: ['Id']
        });

        if (emailExists)
            throw Error(`Email Address ${Email} already exist`);

        const formattedEmail: string = Email.toLowerCase().trim()

        if (!AutomaticPassword) validatePassword(Password, ConfirmPassword)

        const generatedPassword = uid(12)
        const { saltPassword, hashPassword } = encryptPassword(AutomaticPassword ? generatedPassword : Password)

        const user = await User.create({
            ...createBody,
            ChangePwdNextLogin: ChangePwdNextLogin ? true : AutomaticPassword ? true : false,
            CreatedBy: userToken?.UserId,
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

        const findUser = await User.findOne({ where: { Id: UserId }, attributes: ['Id'] })
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