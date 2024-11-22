import { DataTypes, } from "sequelize";
import { sequelize } from "../../database/db";
import { Model, ModelCtor } from "sequelize-typescript";

export interface UserHistoryInstance extends Model {
    Id: string;
    UserName: string | null;
    IsSuccess: boolean;
    Password: string | null;
    IpAddress: string | null;
    CreatedDate: Date;
}

export const UserHistory = sequelize.define<UserHistoryInstance>('UserHistory', {
    Id: {
        type: DataTypes.STRING(450),
        primaryKey: true,
        allowNull: false,
    },
    UserName: {
        type: DataTypes.STRING(50),
    },
    Password: {
        type: DataTypes.STRING,
    },
    IsSuccess: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    CreatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    IpAddress: {
        type: DataTypes.STRING(50),
        validate: {
            isIP: true,
        }
    },
}, {
    tableName: 'UserHistory',
    schema: 'dbo',
    timestamps: false,
}) as ModelCtor<UserHistoryInstance>