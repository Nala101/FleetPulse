import mysql from "mysql2/promise";
const USER = process.env.USER;
const PASS = process.env.PASS;
const DB_NAME = process.env.DB_NAME;


// Create the connection pool. The pool allows the server to reuse connections
// rather than opening a new one for every single request.
const pool = mysql.createPool({
  host: "localhost",
  user: USER, 
  password: PASS, 
  database: DB_NAME, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
