import { NextFunction, Request, Response } from "express";
import { handleUnknownError } from "../utils";

interface CheckPrivilege {
    requiredUserRole: number
}

export const checkPrivilege = ({ requiredUserRole }: CheckPrivilege) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user)
            throw new Error('User is not authenticated');

        const user = req.user
        const isUserAdmin = user?.UserRoleId === 1

        const hasRequiredUserRole = user?.UserRoleId === requiredUserRole

        const isAuthorized = isUserAdmin || hasRequiredUserRole

        if (!isAuthorized)
            throw new Error('You are not allow to do this');

        next();
    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
};