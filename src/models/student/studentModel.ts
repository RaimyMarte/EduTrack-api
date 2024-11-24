import { DataTypes, } from "sequelize";
import { sequelize } from "../../database/db";
import { Model, ModelCtor } from "sequelize-typescript";
import { calculateAge, capitalizeFirstLetter, getGenderName } from "../../utils";
import { studentAssociations } from "../associations/studentAssociations";

export interface StudentInstance extends Model {
    Id: string;
    Code: string | null;
    FirstName: string;
    LastName: string;
    FullName: string | null;
    Address: string | null;
    DateOfBirth: Date;
    NationalityId: number | null;
    Gender: string | null;
    EmailAddress: string | null;
    PhoneNumber: string | null;
    ParentName: string | null;
    ParentPhoneNumber: string | null;
    Picture: string | null;
    CreatedBy: string | null;
    CreatedDate: Date;
    LastUpdatedBy: string | null;
    LastUpdatedDate: Date | null;
}

export const Student = sequelize.define<StudentInstance>('Student', {
    Id: {
        type: DataTypes.STRING(450),
        primaryKey: true,
        allowNull: false,
    },
    Code: {
        type: DataTypes.STRING(20),
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
    Address: {
        type: DataTypes.STRING(255),
    },
    NationalityId: {
        type: DataTypes.INTEGER,
    },
    DateOfBirth: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    Age: {
        type: DataTypes.VIRTUAL,
        get() {
            if (this.DateOfBirth) return calculateAge(this.DateOfBirth);
        },
    },
    Gender: {
        type: DataTypes.STRING(1),
    },
    GenderName: {
        type: DataTypes.VIRTUAL,
        get() {
            const gender = this.getDataValue('Gender');
            return getGenderName(gender)
        },
    },
    EmailAddress: {
        type: DataTypes.STRING(254),
    },
    PhoneNumber: {
        type: DataTypes.STRING(20),
    },
    ParentName: {
        type: DataTypes.STRING(140),
    },
    ParentPhoneNumber: {
        type: DataTypes.STRING(20),
    },
    Picture: {
        type: DataTypes.STRING(2086),
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
    tableName: 'Student',
    schema: 'dbo',
    timestamps: false,
}) as ModelCtor<StudentInstance>

studentAssociations(Student)