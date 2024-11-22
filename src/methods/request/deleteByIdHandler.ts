import { Request, Response } from "express";
import { successResponse } from "../../response";
import { ModelCtor } from "sequelize-typescript";
import { handleUnknownError } from "../../utils";

interface params {
    res: Response;
    req: Request,
    model: ModelCtor;
}

export const deleteByIdHandler = async ({ req, res, model }: params) => {
    const { id } = req.params
    try {
        if (!model) throw Error('Model was not found')
        
        const modelData = await model.destroy({ where: { Id: id } });

        const { response } = successResponse({ data: [modelData] })
        res.json(response);

    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}