import { ModelCtor } from "sequelize-typescript";
import { Nationality } from "../maintenance";
import { StudentSubjectCross } from "../student";
import { StudentInstance } from "../student/studentModel";


export const studentAssociations = (Student: ModelCtor<StudentInstance>) => {
    Student.belongsTo(Nationality, { foreignKey: 'NationalityId', as: 'Nationality' });
    Student.hasMany(StudentSubjectCross, { foreignKey: 'StudentId', as: 'StudentSubject' });
    StudentSubjectCross.belongsTo(Student, { foreignKey: 'StudentId', as: 'Student' });
}
