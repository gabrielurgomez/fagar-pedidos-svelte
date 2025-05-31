import mysql, { type PoolOptions } from 'mysql2/promise';
import { config } from 'dotenv';
config();
const access: PoolOptions = {
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	port: Number(process.env.MYSQL_PORT),
	database: process.env.MYSQL_DATABASE,
	password: process.env.MYSQL_PASSWORD,
};

export const pool = mysql.createPool(access);
