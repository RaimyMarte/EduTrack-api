import { DataTypes, } from "sequelize";
import { sequelize } from "../../database/db";
import { Model, ModelCtor } from "sequelize-typescript";

export interface UserPaswordHistoryInstance extends Model {
    Id: number;
    UserId: string;
    PasswordSalt: Buffer;
    PasswordHash: Buffer;
    CreatedDate: Date;
}

export const UserPaswordHistory = sequelize.define<UserPaswordHistoryInstance>('UserPaswordHistory', {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    UserId: {
        type: DataTypes.STRING(450),
        allowNull: false,
    },
    PasswordSalt: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
    },
    PasswordHash: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
    },
    CreatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
}, {
    tableName: 'UserPaswordHistory',
    schema: 'dbo',
    timestamps: false,
}) as ModelCtor<UserPaswordHistoryInstance>