import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/db';
import { Model, ModelCtor } from 'sequelize-typescript';
import { User } from './userModel';

export interface UserTokenInstance extends Model {
    Id: string
    Token: number
    UserId: string
    ExpiresAt: number
    CreatedDate: Date
}

export const UserToken = sequelize.define<UserTokenInstance>('UserToken', {
    Id: {
        type: DataTypes.STRING(450),
        primaryKey: true,
        allowNull: false,
    },
    Token: {
        type: DataTypes.STRING(450),
        allowNull: false,
    },
    UserId: {
        type: DataTypes.STRING(450),
        allowNull: false,
    },
    CreatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    ExpiresAt: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
}, {
    tableName: 'UserToken',
    schema: 'dbo',
    timestamps: false,
}) as ModelCtor<UserTokenInstance>

UserToken.belongsTo(User, { foreignKey: 'UserId', as: 'User' });