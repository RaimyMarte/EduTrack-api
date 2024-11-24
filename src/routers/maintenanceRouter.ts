import { Router } from "express";
import { getAllInSelectedMaintenances } from "../controllers/maintenance";


export const maintenanceRouter = Router()

maintenanceRouter.get('/get_all_selected_maintenances', getAllInSelectedMaintenances)