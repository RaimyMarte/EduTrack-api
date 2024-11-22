import { ModelCtor } from "sequelize-typescript";
import { defineMaintenanceModel } from '.';

export const Nationality = defineMaintenanceModel('MNationality')
export const SubjectStatus = defineMaintenanceModel('MSubjectStatus')
export const StudentStatus = defineMaintenanceModel('MStudentStatus')
export const UserRole = defineMaintenanceModel('MUserRole')

export const maintenancesModels: { [modelName: string]: ModelCtor<any> } = {
    Nationality,
    SubjectStatus,
    StudentStatus,
    UserRole,
};