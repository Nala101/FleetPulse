/**
 * server.js - The main entry point for your Node.js Backend
 */
import express from "express";
import cors from "cors";

import { getData } from "./sql_connection.js";
import { get24Data } from "./sql_connection.js";
import { getLocationData } from "./sql_connection.js";

const app = express();
const PORT = process.env.PORT || 3000;
const DEBUG = true;

export default app;





// CORS allows your frontend (e.g., React runing on port 5173) to talk to this backend
app.use(cors());

// Built-in middleware to parse JSON bodies (replaces body-parser)
app.use(express.json());

// Root Route: Simple check to see if server is alive
app.get("/", (req, res) => {
  res.send("Connected");
});


// API Route (GET): Fetch data
app.get("/api/car-status", async (req, res) => {
  if (!DEBUG) {
    const data = await getData(1);
    if (!data) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Database error" });
    } else {
      res.json({
        info: {
          Speed: data.Speed,
          Rpm: data.Rpm,
          Fuel: data.Fuel,
          Tempurature: data.Tempurature,
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
      },
      timestamp: new Date(),
      status: "success",
    });
  }
});


// API Route (GET): Fetch data
app.get("/api/car-24-status", async (req, res) => {
  if (!DEBUG) {
    const data = await get24Data();
    if (!data) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Database error" });
    } else {
      res.json({
        info: {
          AvgSpeed: data.AvgSpeed,
          AvgRPM: data.AvgRPM,
          TopSpeed: data.TopSpeed,
        },
        timestamp: new Date(),
        status: "success",
      });
    }
  } else {
    res.json({
      info: {
        AvgSpeed: 0,
        AvgRPM: 0,
        TopSpeed: 0,
      },
      timestamp: new Date(),
      status: "success",
    });
  }
});



// API Route (GET): Fetch data
app.get("/api/location-data", async (req, res) => {
  if (!DEBUG) {
    const data = await getLocationData();
    if (!data) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Database error" });
    } else {
      res.json({
        info: data,
        timestamp: new Date(),
        status: "success",
      });
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

