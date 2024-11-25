import cors from 'cors';
import dotenv from 'dotenv';
import express from "express";
import { authenticateDatabase } from "./database/db";
import { validateAPIKey } from "./middlewares";
import { authRouter, maintenanceRouter, statsRouter, studentRouter, subjectRouter, userRouter } from "./routers";

dotenv.config()

const PORT: string | undefined = process.env.PORT;

const app = express();

app.use(cors())
app.use(express.json())


// Sync the models with the database
authenticateDatabase();

app.use('/public', express.static('public'))

app.use(validateAPIKey);
app.use(authRouter);
app.use(maintenanceRouter)
app.use(studentRouter);
app.use(subjectRouter)
app.use(userRouter);
app.use(statsRouter);

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
