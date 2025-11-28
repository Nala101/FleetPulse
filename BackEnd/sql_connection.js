import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

const DEBUG = true;

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER, // e.g. "myserver.database.windows.net"
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true, // required for Azure
    trustServerCertificate: false, // true only for local dev
  },
};

if (!DEBUG) {
  const pool = new sql.ConnectionPool(config);
  const poolConnect = pool.connect();
}

export async function getData(row_num) {
  try {
    // ensure connected before querying
    await poolConnect;
    const result = await pool
      .request()
      .input("n", sql.Int, row_num)
      .query("SELECT TOP (@n) * FROM carData");

    return result.recordset; // array of objects (rows)
  } catch (err) {
    console.error("DB ERROR:", err);
    return null;
  }
}
