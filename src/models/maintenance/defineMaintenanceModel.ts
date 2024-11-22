import { DataTypes, } from "sequelize";
import { sequelize } from "../../database/db";
import { Model, ModelCtor } from 'sequelize-typescript';

export interface MaintenanceInstance extends Model {
    Id: number;
    Name: string;
    Enabled: boolean;
    CreatedBy: string | null;
    CreatedDate: Date;
    LastUpdatedBy: string | null;
    LastUpdatedDate: Date | null;
}

export const defineMaintenanceModel = (tableName: string, extraParameters?: any) => sequelize.define<MaintenanceInstance>(tableName, {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    Name: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    Enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    CreatedBy: {
        type: DataTypes.STRING(450),
    },
    CreatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    LastUpdatedBy: {
        type: DataTypes.STRING(450),
    },
    LastUpdatedDate: {
        type: DataTypes.DATE,
    },
    ...extraParameters
}, {
    tableName,
    schema: 'dbo',
    timestamps: false,
}) as ModelCtor<MaintenanceInstance>