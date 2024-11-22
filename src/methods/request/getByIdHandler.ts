import { Request, Response } from "express";
import { successResponse } from "../../response";
import { ModelCtor } from "sequelize-typescript";
import { handleUnknownError } from "../../utils";

interface params {
    res: Response;
    req: Request,
    model: ModelCtor;
    options?: object
}

export const getByIdHandler = async ({ req, res, model, options }: params) => {
    const { id } = req.params
    try {
        if (!model) throw Error('Model was not found')

        const modelData = await model.findOne({ where: { Id: id }, ...options });

        if (!modelData) throw Error(`The requested resource does not exist`);


        const { response } = successResponse({ data: modelData })
        res.json(response);

    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}