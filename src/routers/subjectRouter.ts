import { Router } from "express";
import { checkPrivilege, isAuthenticated } from "../middlewares";
import { createsubject, deleteSubject, subjectGetAllWithPagination, updatesubject } from "../controllers/subject/subjectController";
import { getSubjectAttendance, saveStudentAbsences, updateStudentAttendance } from "../controllers/subject/subjectAttendanceController";


export const subjectRouter = Router()

subjectRouter.get('/subject_get_all', isAuthenticated, checkPrivilege({ requiredUserRole: 2 }), subjectGetAllWithPagination)
subjectRouter.post('/create_subject/', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), createsubject)
subjectRouter.patch('/update_subject/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), updatesubject)
subjectRouter.delete('/delete_subject/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), deleteSubject)

subjectRouter.get('/subject_get_attendance/:subjectId', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), getSubjectAttendance)
subjectRouter.post('/save_student_absences/', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), saveStudentAbsences)
subjectRouter.post('/update_student_attendance/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), updateStudentAttendance)