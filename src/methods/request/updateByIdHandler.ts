import { Request, Response } from "express";
import { successResponse } from "../../response";
import { ModelCtor } from "sequelize-typescript";
import { convertReqBody, handleUnknownError } from "../../utils";

interface params {
    res: Response;
    req: Request,
    model: ModelCtor;
}

export const updateByIdHandler = async ({ req, res, model }: params) => {
    const { id } = req.params
    const updateBody = convertReqBody(req.body);

    try {
        if (!model) throw Error('Model was not found')

        const modelData = await model.update(
            {
                ...updateBody,
            },
            { where: { Id: id } }
        );

        const { response } = successResponse({ data: modelData })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}