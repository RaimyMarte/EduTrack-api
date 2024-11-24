import { Request, Response } from "express";
import { successResponse } from "../../response";
import { ModelCtor } from "sequelize-typescript";
import { convertReqBody, handleUnknownError } from "../../utils";
import { v4 as uuidv4 } from 'uuid';

interface params {
    res: Response;
    req: Request,
    model: ModelCtor;
    idType?: 'number' | 'uuid';
}
export const createHandler = async ({ req, res, model, idType = 'number' }: params) => {
    const createBody = convertReqBody(req.body);
    const { user } = req

    try {
        if (!model) throw Error('Model was not found')

        const modelData = await model.create({
            ...createBody,
            Id: idType === 'uuid' ? uuidv4() : undefined,
            CreatedBy: user?.Id,
        });

        const { response } = successResponse({ data: modelData })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}