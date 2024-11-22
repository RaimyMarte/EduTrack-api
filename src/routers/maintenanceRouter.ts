import { Router } from "express";
import { getAllInSelectedMaintenances } from "../controllers/maintenance";


export const maintenanceRouter = Router()

maintenanceRouter.post('/get_all_selected_maintenances/', getAllInSelectedMaintenances)