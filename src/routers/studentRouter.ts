import { Router } from "express";
import fileUpload from "express-fileupload";
import { createStudent, deleteStudent, getStudentById, studentGetAllWithPagination, updateStudent, uploadStudentPicture } from "../controllers/student/studentController";
import { getStudentsInSubject, getStudentsInSubjectWithGrades, getStudentsNotEnrolled, saveStudentsGrades, saveSubjectEnrollment } from "../controllers/student/studentSubjectController";
import { checkPrivilege, fileExtLimiter, fileSizeLimiter, filesPayloadExists, isAuthenticated } from "../middlewares";

export const studentRouter = Router()

studentRouter.get('/student_get_all', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), studentGetAllWithPagination)
studentRouter.get('/student_by_id/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), getStudentById)
studentRouter.post('/create_student/', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), createStudent)
studentRouter.patch('/update_student/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), updateStudent)
studentRouter.delete('/delete_student/:id', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), deleteStudent)


studentRouter.post('/upload_student_picture/:studentId',
    isAuthenticated,
    fileUpload({ createParentPath: true, debug: true }),
    filesPayloadExists,
    fileExtLimiter(['.png', '.jpg', '.jpeg', '.webp']),
    fileSizeLimiter,
    checkPrivilege({ requiredUserRole: 1 }),
    uploadStudentPicture,
)

studentRouter.get('/students_in_subject/:subjectId', isAuthenticated, checkPrivilege({ requiredUserRole: 2 }), getStudentsInSubject)
studentRouter.get('/students_out_subject/:subjectId', isAuthenticated, checkPrivilege({ requiredUserRole: 2 }), getStudentsNotEnrolled)
studentRouter.get('/students_in_subject_with_grades/:subjectId', isAuthenticated, checkPrivilege({ requiredUserRole: 2}), getStudentsInSubjectWithGrades)
studentRouter.post('/save_subject_enrollment/', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), saveSubjectEnrollment)
studentRouter.post('/save_students_grades/', isAuthenticated, checkPrivilege({ requiredUserRole: 2 }), saveStudentsGrades)