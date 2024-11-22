import { handleUnknownError } from "../../utils";
import { ModelCtor } from "sequelize-typescript";
import { Op } from "sequelize";
import { Request, Response } from "express";
import { successResponse } from "../../response";

interface params {
    req: Request;
    res: Response;
    model: ModelCtor;
    searchParameters?: any
    options?: object;
    extraWhereConditions?: any
}

export const paginationSearchHandler = async ({ req, res, model, options, searchParameters, extraWhereConditions }: params) => {
    const { page = 1, pageSize = 10, search = '' } = req.query;

    let whereCondition: any = {};

    if (search) {
        whereCondition = {
            [Op.or]: [
                {
                    [Op.or]: searchParameters
                },
            ],
        };
    }

    try {
        if (!model) throw Error('Model was not found')

        const limit = parseInt(pageSize as string);
        const currentPage = parseInt(page as string);
        const offset = (currentPage - 1) * limit;

        const { count: total, rows: data } = await model.findAndCountAll({
            distinct: true,
            col: 'Id', 
            where: {
                ...extraWhereConditions,
                ...whereCondition,
            },
            ...options,
            offset,
            limit,
        });

        const { response } = successResponse({ data, total })
        res.json(response);
    } catch (error) {
        handleUnknownError({ error, res, })
    }
}