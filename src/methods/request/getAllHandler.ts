import { Response } from "express";
import { successResponse } from "../../response";
import { ModelCtor } from "sequelize-typescript";
import { handleUnknownError } from "../../utils";

interface params {
    res: Response;
    model: ModelCtor;
    options?: object
    extraWhereConditions?: object | null
}

export const getAllHandler = async ({ res, model, options, extraWhereConditions }: params) => {
    try {
        if (!model) throw Error('Model was not found')

        const { count, rows: modelData } = await model.findAndCountAll({ where: { ...extraWhereConditions }, ...options })

        const { response } = successResponse({ data: modelData, total: count })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}