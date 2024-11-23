import { Router } from "express";
import fileUpload from "express-fileupload";
import { changePassword, changePasswordNextLogin, createUser, getLoginHistory, getUserById, getUsers, getProfessorsForDropdown, updateUser, uploadUserPicture } from "../controllers/auth";
import { checkPrivilege, checkUserNameOrEmailExist, fileExtLimiter, fileSizeLimiter, filesPayloadExists, isAuthenticated } from "../middlewares";

export const userRouter = Router()

userRouter.get('/get_users', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), getUsers)
userRouter.get('/get_professors', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), getProfessorsForDropdown)
userRouter.get('/get_user/:id', isAuthenticated, getUserById)
userRouter.post('/create_user', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), checkUserNameOrEmailExist, createUser)
userRouter.patch('/update_user', isAuthenticated, checkUserNameOrEmailExist, updateUser)
userRouter.post('/change_password', isAuthenticated, changePassword)
userRouter.post('/change_password_next_login', isAuthenticated, changePasswordNextLogin)

userRouter.get('/get_login_history/:id', isAuthenticated, getLoginHistory)

userRouter.post('/upload_user_picture/:userId',
    isAuthenticated,
    fileUpload({ createParentPath: true, debug: true }),
    filesPayloadExists,
    fileExtLimiter(['.png', '.jpg', '.jpeg', '.webp']),
    fileSizeLimiter,
    uploadUserPicture,
)