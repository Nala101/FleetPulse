/**
 * server.js - The main entry point for your Node.js Backend
 */
import express from "express";
import cors from "cors";

import { getData } from "./sql_connection.js";
import { getLocationData } from "./sql_connection.js";
import { get24HourAverages } from "./sql_connection.js";
const app = express();

// CORS and JSON middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DEBUG = process.env.DEBUG === "true" || false;

// export for tests
export default app;

// Root Route: Simple check to see if server is alive
app.get("/", (req, res) => {
  res.send("Connected");
});


// API Route (GET): Fetch latest car status
app.get("/api/car-status", async (req, res) => {
  if (!DEBUG) {
    console.log("Sending Car-Status Query")
    const data = await getData(1);
    if (!data) {
      res
        .status(500)
        .json({ error: "Database error" });
    } else {
      res.json({
        info: {
          Speed: data.Mph,
          Rpm: data.Rpm,
          Fuel: data.FuelPercent,
          Tempurature: data.EngineTemp,
          latitude: data.Latitude,
          longitude: data.Longitude
        },
        timestamp: new Date(),
        status: "success",
      });
    }
  } else {
    res.json({
      info: {
        Speed: 0,
        Rpm: 0,
        Fuel: 0,
        Tempurature: 0,
        latitude: 0,
        longitude: 0,
      },
      timestamp: new Date(),
      status: "success",
    });
  }
});

// API Route (GET): Fetch
app.get("/api/car-24-status", async (req, res) => {

  if (DEBUG) {
    // DEBUG MODE → return mock data
    return res.json({
      info: {
        TopSpeed: 0,
        AvgSpeed: 0,
        AvgCabinTemp: 0,
        AvgEngineTemp: 0,
        TotalMiles: 0,
      },
      timestamp: new Date(),
      status: "success",
    });
  }

  // 2. Production Mode
  try {
    console.log("Sending car-24-status Query");

    const data = await get24HourAverages(); // <-- use your new stats function

    if (!data) {
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      info: {
        TopSpeed: data.TopSpeed,
        AvgSpeed: data.AvgSpeed,
        AvgCabinTemp: data.AvgCabinTemp,
        AvgEngineTemp: data.AvgEngineTemp,
        TtlMilesTraveled: data.TtlMilesTraveled,
        AvgCabinHumidity: data.AvgCabinHumidity,
        AvgMPG: data.AvgMPG
      },
      timestamp: new Date(),
      status: "success",
    });
  } catch (err) {
    console.error("API ERROR (/api/car-24-status):", err);
    res.status(500).json({ error: "Server error" });
  }
}); 




// API Route (GET): Fetch data
app.get("/api/location-data", async (req, res) => {
  if (!DEBUG) {
    try {
      console.log("Sending location-data Query");

      const rows = await getLocationData();
      if (!rows) {
        console.error("DB: no rows returned for /api/location-data", { rows });
        return res.status(500).json({ error: "Database error" });
      }

      // Transform DB rows to the shape MapPage expects: { key, location: { lat, lng } }
      const pois = rows
        .map((r, i) => {
          const lat = Number(r.Latitude ?? r.lat ?? r.Lat ?? r.latitude);
          const lng = Number(r.Longitude ?? r.lng ?? r.Lon ?? r.lon ?? r.longitude);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          return {
            key: r.MsgID ? `msg-${r.MsgID}` : `row-${i}`,
            location: { lat, lng },
          };
        })
        .filter(Boolean);

      res.json({
        info: pois,
        timestamp: new Date(),
        status: "success",
      });
    }catch (err) {
        console.error(
          "API ERROR (/api/car-24-status):",
          err
        );
        res
          .status(500)
          .json({ error: "Server error" });
      }
  } else {
    // Plain JS array of POIs
    const locations = [
      {
        key: "botanicGardens",
        location: {
          lat: -33.864167,
          lng: 151.216387,
        },
      },
      {
        key: "museumOfSydney",
        location: {
          lat: -33.8636005,
          lng: 151.2092542,
        },
      },
      {
        key: "maritimeMuseum",
        location: {
          lat: -33.869395,
          lng: 151.198648,
        },
      },
    ];

    res.json({
      info: locations,
      timestamp: new Date(),
      status: "success",
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Error");
});

app.listen(PORT, () => {
  console.log(
    `---------------------------------------`
  );
  console.log(
    `Server running on http://localhost:${PORT}`
  );
  console.log(
    `---------------------------------------`
  );
});







// API Route (GET): Fetch data
app.get("/api/location-data", async (req, res) => {
  if (!DEBUG) {
    try {
      console.log("Sending location-data Query");

      const rows = await getLocationData();
      if (!rows) {
        console.error("DB: no rows returned for /api/location-data", { rows });
        return res.status(500).json({ error: "Database error" });
      }

      // Transform DB rows to the shape MapPage expects: { key, location: { lat, lng } }
      const pois = rows
        .map((r, i) => {
          const lat = Number(r.Latitude ?? r.lat ?? r.Lat ?? r.latitude);
          const lng = Number(r.Longitude ?? r.lng ?? r.Lon ?? r.lon ?? r.longitude);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          return {
            key: r.MsgID ? `msg-${r.MsgID}` : `row-${i}`,
            location: { lat, lng },
          };
        })
        .filter(Boolean);

      res.json({
        info: pois,
        timestamp: new Date(),
        status: "success",
      });
    }catch (err) {
        console.error(
          "API ERROR (/api/car-24-status):",
          err
        );
        res
          .status(500)
          .json({ error: "Server error" });
      }
  } else {
    // Plain JS array of POIs
    const locations = [
      {
        key: "botanicGardens",
        location: {
          lat: -33.864167,
          lng: 151.216387,
        },
      },
      {
        key: "museumOfSydney",
        location: {
          lat: -33.8636005,
          lng: 151.2092542,
        },
      },
      {
        key: "maritimeMuseum",
        location: {
          lat: -33.869395,
          lng: 151.198648,
        },
      },
    ];

    res.json({
      info: locations,
      timestamp: new Date(),
      status: "success",
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Error");
});

app.listen(PORT, () => {
  console.log(
    `---------------------------------------`
  );
  console.log(
    `Server running on http://localhost:${PORT}`
  );
  console.log(
    `---------------------------------------`
  );
});


