import { Router } from "express";
import fileUpload from "express-fileupload";
import { createStudent, getStudentById, getStudentsDropdown, studentGetAllWithPagination, updateStudent, uploadStudentPicture } from "../controllers/student/studentController";
import { checkPrivilege, fileExtLimiter, fileSizeLimiter, filesPayloadExists, isAuthenticated } from "../middlewares";
import { addStudentsToSubject, getStudentsInSubject, getStudentsNotEnrolled, removeStudentsFromSubject } from "../controllers/student/studentSubjectController";

export const studentRouter = Router()

studentRouter.get('/student_get_all', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), studentGetAllWithPagination)
studentRouter.get('/student_dropdown', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), getStudentsDropdown)
studentRouter.get('/student_by_id/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), getStudentById)
studentRouter.post('/create_student/', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), createStudent)
studentRouter.patch('/update_student/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), updateStudent)


studentRouter.post('/upload_student_picture/:studentId',
    isAuthenticated,
    fileUpload({ createParentPath: true, debug: true }),
    filesPayloadExists,
    fileExtLimiter(['.png', '.jpg', '.jpeg', '.webp']),
    fileSizeLimiter,
    checkPrivilege({ requiredUserRole: 1 }),
    uploadStudentPicture,
)

studentRouter.get('/students_in_subject/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), getStudentsInSubject)
studentRouter.get('/students_out_subject/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), getStudentsNotEnrolled)
studentRouter.post('/add_students_subject/', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), addStudentsToSubject)
studentRouter.post('/remove_students_subject/', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), removeStudentsFromSubject)




