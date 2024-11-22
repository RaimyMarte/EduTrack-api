import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/db';
import { Model, ModelCtor } from 'sequelize-typescript';

export interface SubjectInstance extends Model {
    Id: string
    Code: string | null;
    Name: string;
    Description: string | null;
    Enabled: boolean;
    StatusId: number;
    StartDate: Date;
    EndDate: Date;
    CreatedBy: string | null;
    CreatedDate: Date;
    LastUpdatedBy: string | null;
    LastUpdatedDate: Date | null;
}

export const Subject = sequelize.define<SubjectInstance>('Subject', {
    Id: {
        type: DataTypes.STRING(450),
        primaryKey: true,
        allowNull: false,
    },
    Code: {
        type: DataTypes.STRING(20),
    },
    Name: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    Description: {
        type: DataTypes.TEXT,
    },
    Enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    StatusId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    StartDate: {
        type: DataTypes.DATE,
    },
    EndDate: {
        type: DataTypes.DATE,
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
}, {
    tableName: 'Subject',
    schema: 'dbo',
    timestamps: false,
}) as ModelCtor<SubjectInstance>
