import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'testFastify',
    waitForConnections: true,
    connectionLimit: 10
});