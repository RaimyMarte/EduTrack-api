import { DataTypes } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';
import { sequelize } from '../../database/db';
import { StudentSubjectCross } from '../student';

export interface SubjectNonAttendanceInstance extends Model {
    Id: number
    StudentSubjectCrossId: string;
    Date: Date;
}

export const SubjectNonAttendance = sequelize.define<SubjectNonAttendanceInstance>('SubjectNonAttendance', {
    Id: {
        type: DataTypes.STRING(450),
        primaryKey: true,
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

SubjectNonAttendance.belongsTo(StudentSubjectCross, { foreignKey: 'StudentSubjectCrossId', as: 'StudentSubjectCross' });