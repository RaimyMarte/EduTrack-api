import { DataTypes } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';
import { sequelize } from '../../database/db';

export interface SubjectNonAttendanceInstance extends Model {
    Id: number
    StudentSubjectCrossId: string;
    Date: Date;
}

export const SubjectNonAttendance = sequelize.define<SubjectNonAttendanceInstance>('SubjectNonAttendance', {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    StudentSubjectCrossId: {
        type: DataTypes.STRING(450),
        allowNull: false,
    },
    Date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
}, {
    tableName: 'SubjectNonAttendance',
    schema: 'dbo',
    timestamps: false,
}) as ModelCtor<SubjectNonAttendanceInstance>