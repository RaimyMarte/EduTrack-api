import { Router } from "express";
import { checkPrivilege, isAuthenticated } from "../middlewares";
import { createsubject, subjectGetAllWithPagination, updatesubject } from "../controllers/subject/subjectController";


export const subjectRouter = Router()

subjectRouter.get('/subject_get_all', isAuthenticated, checkPrivilege({ requiredUserRole: 2 }), subjectGetAllWithPagination)
subjectRouter.post('/create_subject/', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), createsubject)
subjectRouter.patch('/update_subject/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), updatesubject)