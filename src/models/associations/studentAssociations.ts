import { ModelCtor } from "sequelize-typescript";
import { User } from "../authentication";
import { Nationality } from "../maintenance";
import { StudentSubjectCross } from "../student";
import { StudentInstance } from "../student/studentModel";


export const studentAssociations = (Student: ModelCtor<StudentInstance>) => {
    Student.belongsTo(User, { foreignKey: 'CreatedBy', as: 'StudentCreatedBy' });
    Student.belongsTo(User, { foreignKey: 'LastUpdatedBy', as: 'StudentLastUpdatedBy' });

    Student.belongsTo(Nationality, { foreignKey: 'NationalityId', as: 'Nationality' });

    Student.hasMany(StudentSubjectCross, { foreignKey: 'StudentId', as: 'StudentSubject' });
}
