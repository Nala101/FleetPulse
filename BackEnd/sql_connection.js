import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();



const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  server: process.env.DB_SERVER, // e.g. "myserver.database.windows.net"
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  authentication: {
    type: "default",
  },
  options: {
    encrypt: true, // required for Azure
    trustServerCertificate: false, // true only for local dev
  },
};


const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

export async function carStatus(row_num) {
  try {
    // ensure connected before querying
    await poolConnect;
    const result = await pool
      .request()
      .query(`
      SELECT TOP 1 *
      FROM dbo.Msg as msg
      ORDER BY msg.UploadTime DESC
    `);

    return result.recordset[0]; // array of objects (rows)
  } catch (err) {
    console.error("DB ERROR:", err);
    return null;
  }
}

export async function getLocationData() {
  try {
    // ensure connected before querying
    await poolConnect;
    const result = await pool.request().query(`
      SELECT msg.MsgID, msg.UploadTime, msg.Latitude, msg.Longitude, msg.Mph
      FROM dbo.Msg as msg
      WHERE msg.UploadTime > DATEADD(HOUR, -24, GETDATE())
      ORDER BY msg.UploadTime DESC
    `);

    return result.recordset; // array of objects (rows)
  } catch (err) {
    console.error("DB ERROR:", err);
    return null;
  }
}

export async function get24HourAverages() {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT
      MAX(msg.mph) as 'TopSpeed',
      AVG(msg.mph) as 'AvgSpeed',
      AVG(msg.CabinTemperature) as 'AvgCabinTemp',
      AVG(msg.CabinHumidity) as 'AvgCabinHumidity',
      AVG(msg.EngineTemp) as 'AvgEngineTemp',
      SUM(msg.MilesTraveled) as 'TtlMilesTraveled',
      SUM(msg.MilesTraveled)/SUM(msg.GalUsed) as 'AvgMPG'
      FROM dbo.Msg as msg
      WHERE msg.UploadTime > DATEADD(HOUR, -24, GETDATE())
    `);

    return result.recordset[0];
  } catch (err) {
    console.error("DB ERROR:", err);
    return null;
  }
}



export async function getRouteData() {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      WITH Recent AS (
        SELECT *
        FROM Msg
        WHERE UploadTime >= DATEADD(HOUR, -24, GETDATE())
      ),
      TravelPeriodFlags AS (
          SELECT
              *,
              CASE 
                  WHEN LAG(UploadTime) OVER (ORDER BY UploadTime) IS NULL THEN 1
                  WHEN DATEDIFF(MINUTE,
                      LAG(UploadTime) OVER (ORDER BY UploadTime),
                      UploadTime) >= 15 THEN 1
                  ELSE 0
              END AS TravelPeriodStart
          FROM Recent
      ),
      Groups AS (
          SELECT 
              *,
              SUM(TravelPeriodStart) OVER (ORDER BY UploadTime
                                          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS PeriodGroup
          FROM TravelPeriodFlags
      )
      SELECT 
          Groups.PeriodGroup,
          MIN(Groups.UploadTime) as 'StartTime',
          MAX(Groups.UploadTime) as 'EndTime',
          MAX(Groups.Mph) as 'TopSpeed',
          AVG(Groups.Mph) as 'AvgSpeed',
          AVG(Groups.CabinTemperature) as 'AvgCabinTemp',
          AVG(Groups.CabinHumidity) as 'AvgCabinHumidity',
          AVG(Groups.EngineTemp) as 'AvgEngineTemp',
          SUM(Groups.MilesTraveled) as 'TtlMilesTraveled',
          SUM(Groups.MilesTraveled)/SUM(Groups.GalUsed) as 'AvgMPG'
      FROM Groups
      GROUP BY Groups.PeriodGroup
      ORDER BY StartTime
    `);

    return result.recordset;
  } catch (err) {
    console.error("DB ERROR:", err);
    return null;
  }
}

export async function getRouteLocations() {
  try {
    await poolConnect;
    const result = await pool.request()
      .query(`
        WITH Recent AS (
          SELECT *
          FROM Msg
          WHERE UploadTime >= DATEADD(HOUR, -24, GETDATE())
        ),
        TravelPeriodFlags AS (
            SELECT
                *,
                CASE 
                    WHEN LAG(UploadTime) OVER (ORDER BY UploadTime) IS NULL THEN 1
                    WHEN DATEDIFF(MINUTE,
                        LAG(UploadTime) OVER (ORDER BY UploadTime),
                        UploadTime) >= 15 THEN 1
                    ELSE 0
                END AS TravelPeriodStart
            FROM Recent
        ),
        Groups AS (
            SELECT 
                *,
                SUM(TravelPeriodStart) OVER (ORDER BY UploadTime
                                            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS PeriodGroup
            FROM TravelPeriodFlags
        )
        SELECT 
            Groups.PeriodGroup,
            Groups.Latitude,
            Groups.Longitude
        FROM Groups
        ORDER BY Groups.UploadTime
      `);

    return result.recordset;
  } catch (err) {
    console.error("DB ERROR:", err);
    return null;
  }
}