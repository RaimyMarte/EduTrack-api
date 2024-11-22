import { sequelize } from "./database/db"
import cors from 'cors';
import dotenv from 'dotenv'
import express from "express";

dotenv.config()

const PORT: string | undefined = process.env.PORT;

const app = express();

app.use(cors())

app.use(express.json())


// Sync the models with the database
async function authenticateDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

authenticateDatabase();

app.use('/public', express.static('public'))

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
