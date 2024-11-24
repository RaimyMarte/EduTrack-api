import { DataTypes, } from "sequelize";
import { Model, ModelCtor } from "sequelize-typescript";
import { sequelize } from "../../database/db";

export interface StudentSubjectCrossInstance extends Model {
    Id: string;
    SubjectId: string;
    StudentId: string;
    Grade: number | null;
    CreatedBy: string | null;
    CreatedDate: Date;
}

export const StudentSubjectCross = sequelize.define<StudentSubjectCrossInstance>('StudentSubjectCross', {
    Id: {
        type: DataTypes.STRING(450),
        primaryKey: true,
        allowNull: false,
    },
    SubjectId: {
        type: DataTypes.STRING(450),
        allowNull: false,
    },
    StudentId: {
        type: DataTypes.STRING(450),
        allowNull: false,
    },
    Grade: {
        type: DataTypes.INTEGER,
    },
    LetterGrade: {
        type: DataTypes.VIRTUAL,
        get() {
            const grade = this.getDataValue('Grade');
            switch (true) {
                case (grade >= 90 && grade <= 100):
                    return 'A';
                case (grade >= 80 && grade < 90):
                    return 'B';
                case (grade >= 70 && grade < 80):
                    return 'C';
                default:
                    return 'F';
            }
        },
    },
    CreatedBy: {
        type: DataTypes.STRING(450),
    },
    CreatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    LastGradeUpdatedBy: {
        type: DataTypes.STRING(450),
    },
    LastGradeUpdatedDate: {
        type: DataTypes.DATE,
    },
}, {
    tableName: 'StudentSubjectCross',
    schema: 'dbo',
    timestamps: false,
}) as ModelCtor<StudentSubjectCrossInstance>