import { DataTypes, } from "sequelize";
import { sequelize } from "../../database/db";
import { Model, ModelCtor } from "sequelize-typescript";
import { userAssociations } from "../associations/userAssociations";
import { capitalizeFirstLetter, getGenderName } from "../../utils";

export interface UserInstance extends Model {
    Id: string;
    FirstName: string;
    LastName: string;
    UserName: string | null;
    FullName: string | null;
    Email: string;
    Phone: string | null;
    Gender: string | null;
    PasswordSalt: Buffer | null;
    PasswordHash: Buffer | null;
    TFAEnabled: boolean;
    TFASecretKey: string | null;
    TFATempSecretKey: string | null;
    TFADate: Date | null;
    ChangePwdNextLogin: boolean;
    LastPwdChangedDate: Date | null;
    UserRoleId: number;
    Authorized: boolean;
    Locked: boolean;
    LockedDate: Date | null;
    CreatedBy: string | null;
    CreatedDate: Date;
    LastUpdatedBy: string | null;
    LastUpdatedDate: Date | null;
    LastIpAccess: string | null;
    LastAccessDate: Date | null;
    Picture: string | null;
}

export const User = sequelize.define<UserInstance>('User', {
    Id: {
        type: DataTypes.STRING(450),
        primaryKey: true,
        allowNull: false,
    },
    FirstName: {
        type: DataTypes.STRING(70),
        allowNull: false,
    },
    LastName: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    FullName: {
        type: DataTypes.VIRTUAL,
        get() {
            const fullName: string = `${this.FirstName} ${this.LastName}`;
            return capitalizeFirstLetter(fullName);
        },
    },
    UserName: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    Gender: {
        type: DataTypes.STRING(1),
        defaultValue: 'M',
        get() {
            const gender: string = this.getDataValue('Gender');
            return getGenderName(gender)
        },
    },
    Email: {
        type: DataTypes.STRING(256),
        allowNull: false,
    },
    Phone: {
        type: DataTypes.STRING(20),
    },
    PasswordSalt: {
        type: DataTypes.BLOB('long'),
    },
    PasswordHash: {
        type: DataTypes.BLOB('long'),
    },
    TFAEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    TFASecretKey: {
        type: DataTypes.TEXT,
    },
    TFATempSecretKey: {
        type: DataTypes.TEXT,
    },
    TFADate: {
        type: DataTypes.DATE,
    },
    ChangePwdNextLogin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    LastPwdChangedDate: {
        type: DataTypes.DATE,
    },
    UserRoleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Authorized: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    Locked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    LockedDate: {
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
    LastIpAccess: {
        type: DataTypes.STRING(20),
    },
    LastAccessDate: {
        type: DataTypes.DATE,
    },
    Picture: {
        type: DataTypes.STRING(2086),
    },
}, {
    tableName: 'User',
    schema: 'dbo',
    timestamps: false,
}) as ModelCtor<UserInstance>

userAssociations(User)