import { DataTypes } from "sequelize";
import { sequelize } from "../../database/db";
import { Model, ModelCtor } from "sequelize-typescript";
import { User } from "./userModel";

export interface UserResetPasswordInstance extends Model {
    Id: number
    UserId: string
    RequestDate: Date
    RequestIPAddress: string | null
    UrlValidation: string
    Validated: boolean
    ValidatedDate: Date | null
    ValidatedIPAddress: string | null
}

export const UserResetPassword = sequelize.define<UserResetPasswordInstance>('UserResetPassword', {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    UserId: {
        type: DataTypes.STRING(450),
        allowNull: false,
        references: {
            model: 'User',
            key: 'Id',
        },
    },
    RequestDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    RequestIPAddress: {
        type: DataTypes.STRING(50),
    },
    UrlValidation: {
        allowNull: false,
        type: DataTypes.STRING(2083),
    },
    Validated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    ValidatedDate: {
        type: DataTypes.DATE,
    },
    ValidatedIPAddress: {
        type: DataTypes.STRING(50),
    },
}, {
    tableName: 'UserResetPassword',
    schema: 'dbo',
    timestamps: false,
}) as ModelCtor<UserResetPasswordInstance>

UserResetPassword.belongsTo(User, { foreignKey: 'UserId', as: 'User' });