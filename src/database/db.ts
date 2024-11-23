import dotenv from 'dotenv'
import { DataTypes } from 'sequelize'
// import { DataTypes } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
dotenv.config()


const dbName: string = process.env.DB_CONFIG_DATABASE || ''
const dbUserName: string = process.env.DB_CONFIG_USERNAME || ''
const dbPassword: string = process.env.DB_CONFIG_PASSWORD || ''
const dbHost: string = process.env.DB_CONFIG_HOST || ''

export const sequelize = new Sequelize(dbName, dbUserName, dbPassword, {
  host: dbHost,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true, // For secure connection
      trustServerCertificate: true, // For self-signed certs
      trustedConnection: true, // This enables Windows Authentication
    },
  },
  logging: false,
});

DataTypes.DATE.prototype._stringify = function _stringify(date: any, options: any) {
  date = this._applyTimezone(date, options);

  return date.format('YYYY-MM-DD HH:mm:ss.SSS');
};

export async function authenticateDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}