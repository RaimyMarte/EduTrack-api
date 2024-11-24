import { Router } from "express";
import { getSubjectAttendance, saveSubjectAttendance } from "../controllers/subject/subjectAttendanceController";
import { createsubject, deleteSubject, getSubjectById, subjectGetAllWithPagination, updatesubject } from "../controllers/subject/subjectController";
import { checkPrivilege, isAuthenticated } from "../middlewares";


export const subjectRouter = Router()

subjectRouter.get('/subject_get_all', isAuthenticated, checkPrivilege({ requiredUserRole: 2 }), subjectGetAllWithPagination)
subjectRouter.get('/get_subject/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 2 }), getSubjectById)
subjectRouter.post('/create_subject/', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), createsubject)
subjectRouter.patch('/update_subject/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), updatesubject)
subjectRouter.delete('/delete_subject/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), deleteSubject)

subjectRouter.get('/subject_get_attendance/:subjectId', isAuthenticated, checkPrivilege({ requiredUserRole: 2 }), getSubjectAttendance)
subjectRouter.post('/save_subject_attendance/', isAuthenticated, checkPrivilege({ requiredUserRole: 2 }), saveSubjectAttendance)