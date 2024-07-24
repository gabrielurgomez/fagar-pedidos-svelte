import { env } from '$env/dynamic/private';
import mysql, { type PoolOptions } from 'mysql2/promise';

const access: PoolOptions = {
    host: env.DB_HOST,
    user: env.DB_USER,
    port: Number(env.DB_PORT),
    database: env.DB_NAME,
    password: env.DB_PASSWORD,
};

export const pool = mysql.createPool(access);