import { Request, Response } from "express";
import { ModelCtor } from "sequelize-typescript";
import { maintenancesModels } from "../../models/maintenance";
import { successResponse } from "../../response";
import { handleUnknownError } from "../../utils";


export const getAllInSelectedMaintenances = async (req: Request, res: Response): Promise<void> => {
    const { selectedMaintenances } = req.query
    try {
        const selectedMaintenancesArray = selectedMaintenances
            ? (selectedMaintenances as string).split(',')
            : [];

        if (!selectedMaintenancesArray.length) {
            throw new Error('selectedMaintenances is required');
        }

        const data = await Promise.all(selectedMaintenancesArray.map(async (modelName: string) => {
            const model: ModelCtor<any> = maintenancesModels[modelName]

            if (!model) throw Error(`${modelName} was not found`);

            const modelData = await model.findAll({
                where: { Enabled: true },
            });

            return [modelName, modelData];
        }));

        const convertDataToObject = Object.fromEntries(data);

        const { response } = successResponse({ data: convertDataToObject })
        res.json(response);
    } catch (error: unknown) {
        handleUnknownError({ error, res, })
    }
}
