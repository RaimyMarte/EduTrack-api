import { Router } from "express";
import { getAdminStats, getProfessorStats } from "../controllers/stats/statsController";
import { checkPrivilege, isAuthenticated } from "../middlewares";


export const statsRouter = Router()

statsRouter.get('/get_admin_stats', isAuthenticated, checkPrivilege({ requiredUserRole: 1 }), getAdminStats)
statsRouter.get('/get_professor_stats', isAuthenticated, checkPrivilege({ requiredUserRole: 2 }), getProfessorStats)