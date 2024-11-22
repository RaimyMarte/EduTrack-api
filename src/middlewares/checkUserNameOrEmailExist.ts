import { NextFunction, Request, Response } from "express";
import { handleUnknownError } from "../utils";
import { User } from "../models/authentication";

export const checkUserNameOrEmailExist = async (req: Request, res: Response, next: NextFunction) => {
    const { UserName, Email, UserId }: { UserName: string, Email: string, UserId: string } = req.body;

    try {
        const userNameExists = await User.findOne({
            where: { UserName: UserName.toLowerCase().trim() },
            attributes: ['Id']
        });

        if (userNameExists && UserId !== userNameExists?.Id)
            throw Error(`User Name ${UserName} already exist`);


        const emailExists = await User.findOne({
            where: { Email: Email.toLowerCase().trim() },
            attributes: ['Id']
        });

        if (emailExists && UserId !== emailExists?.Id)
            throw Error(`Email Address ${Email} already exist`);

        next();
    } catch (error) {
        handleUnknownError({ error, res, title: 'Error when trying to update user', })
    }
};
