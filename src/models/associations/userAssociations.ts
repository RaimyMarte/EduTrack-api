import { ModelCtor } from "sequelize-typescript";
import { UserInstance, } from "../authentication";
import { Nationality, StudentStatus, SubjectStatus, UserRole } from "../maintenance";
import { StudentSubjectCross } from "../student/studentSubjectCrossModel";
import { Subject } from "../subject";
import { Student } from "../student";


export const userAssociations = (User: ModelCtor<UserInstance>) => {
    User.belongsTo(UserRole, { foreignKey: 'UserRoleId', as: 'UserRole' });
    User.belongsTo(User, { foreignKey: 'CreatedBy', as: 'UserCreatedBy' });
    User.belongsTo(User, { foreignKey: 'LastUpdatedBy', as: 'UserLastUpdatedBy' });

    Student.belongsTo(User, { foreignKey: 'CreatedBy', as: 'StudentCreatedBy' });
    Student.belongsTo(User, { foreignKey: 'LastUpdatedBy', as: 'StudentLastUpdatedBy' });

    Subject.belongsTo(User, { foreignKey: 'CreatedBy', as: 'SubjectCreatedBy' });
    Subject.belongsTo(User, { foreignKey: 'LastUpdatedBy', as: 'SubjectLastUpdatedBy' });

    Nationality.belongsTo(User, { foreignKey: 'CreatedBy', as: 'NationalityCreatedBy' });
    Nationality.belongsTo(User, { foreignKey: 'LastUpdatedBy', as: 'NationalityLastUpdatedBy' });

    SubjectStatus.belongsTo(User, { foreignKey: 'CreatedBy', as: 'SubjectStatusCreatedBy' });
    SubjectStatus.belongsTo(User, { foreignKey: 'LastUpdatedBy', as: 'SubjectStatusLastUpdatedBy' });

    StudentStatus.belongsTo(User, { foreignKey: 'CreatedBy', as: 'StudentStatusCreatedBy' });
    StudentStatus.belongsTo(User, { foreignKey: 'LastUpdatedBy', as: 'StudentStatusLastUpdatedBy' });

    UserRole.belongsTo(User, { foreignKey: 'CreatedBy', as: 'UserRoleCreatedBy' });
    UserRole.belongsTo(User, { foreignKey: 'LastUpdatedBy', as: 'UserRoleLastUpdatedBy' });

    StudentSubjectCross.belongsTo(User, { foreignKey: 'CreatedBy', as: 'StudentSubjectCrossCreatedBy' });
}
