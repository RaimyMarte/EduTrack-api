import { Request, Response } from "express";
import { successResponse } from "../../response";
import { ModelCtor } from "sequelize-typescript";
import { convertReqBody, handleUnknownError } from "../../utils";
import { sequelize } from "../../database/db";

interface params {
    res: Response;
    req: Request,
    model: ModelCtor;
}

export const updateByIdHandler = async ({ req, res, model }: params) => {
    const { user } = req
    const { id } = req.params
    const updateBody = convertReqBody(req.body);

    try {
        if (!model) throw Error('Model was not found')

        const modelData = await model.update(
            {
                ...updateBody,
                LastUpdatedBy: user?.Id,
                LastUpdatedDate: sequelize.literal('CURRENT_TIMESTAMP'),
            },
            { where: { Id: id } }
        );

        const { response } = successResponse({ data: modelData })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}