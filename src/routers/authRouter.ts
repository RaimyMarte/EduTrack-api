import { Router } from "express";
import { adminResetPassword, checkAuthentication, confirmResetPassword, disableTFA, generateTFASecretKey, login, logout, logoutAll, requestResetPassword, validateTFA, verifyTFASecretKey, } from "../controllers/auth";
import { checkPrivilege, isAuthenticated } from "../middlewares";
import dotenv from 'dotenv'
dotenv.config()

export const authRouter = Router()

authRouter.post('/auth/login', login)
authRouter.post('/auth/confirm_reset_password', confirmResetPassword)
authRouter.post('/auth/request_reset_password', requestResetPassword)
authRouter.post('/auth/admin_reset_password', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), adminResetPassword)
authRouter.get('/auth/check_auth', isAuthenticated, checkAuthentication)
authRouter.post('/auth/logout', isAuthenticated, logout)
authRouter.post('/auth/logout_all', isAuthenticated, logoutAll)

authRouter.post('/auth/generate_tfa_key', isAuthenticated, generateTFASecretKey)
authRouter.post('/auth/verify_tfa_key', isAuthenticated, verifyTFASecretKey)
authRouter.post('/auth/validate_tfa', validateTFA)
authRouter.post('/auth/disable_tfa/:userId', isAuthenticated, disableTFA)