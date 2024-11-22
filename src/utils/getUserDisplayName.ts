import { Model, ModelCtor } from "sequelize-typescript";
import { User } from "../models/authentication";

export interface GetUserDisplayName {
    model: ModelCtor<Model>,
    as: string,
    attributes: string[],
}

export const getUserDisplayName = (as: string): GetUserDisplayName => ({
    model: User,
    as,
    attributes: ['DisplayName'],
});