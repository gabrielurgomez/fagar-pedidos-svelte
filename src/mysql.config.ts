import mysql, { type PoolOptions } from 'mysql2/promise';

const access: PoolOptions = {
    host: 'fagarcomercial.com',
    user: 'fagarcomercial_user',
    port: 3306,
    database: 'fagarcomercial_admon',
    password: 'VYg906Z8rApB',
};

export const pool = mysql.createPool(access);


//Conexion a la base de datos de admon, la que usan en produccion para crear productos e inventarios
/*export const pool = mysql.createPool({
    host: 'fagarcomercial',
    user: 'fagarcomercial_user',
    database: 'fagarcomercial_admon',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});*/

