/**
 * server.js - The main entry point for your Node.js Backend
 */
import express from "express";
import cors from "cors";

import { carStatus } from "./sql_connection.js";
import { getLocationData } from "./sql_connection.js";
import { get24HourAverages } from "./sql_connection.js";
import { getRouteData } from "./sql_connection.js";
const app = express();

// CORS and JSON middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
const DEBUG = false;

// export for tests
export default app;

// Root Route: Simple check to see if server is alive
app.get("/", (req, res) => {
  res.send("Connected");
});

// API Route (GET): Fetch latest car status
// gets the current status of the car
app.get("/api/car-status", async (req, res) => {
  //for debuging if the server cant be reached will send placeholder data
  if (DEBUG) {
    return res.json({
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
  try {
    //calls the query to get the car information and then sends it back to the database
    console.log("Sending car-status Query");
    const data = await carStatus();

    // error handling
    if (!data) {
      return res.status(500).json({
        error: "Database error: No Data Found",
      });
    }

    res.json({
      info: data,
      timestamp: new Date(),
      status: "success",
    });
  } catch (err) {
    console.error(
      "API ERROR (/api/car-status):",
      err
    );
    res
      .status(500)
      .json({ error: "Server error" });
  }
});

// API Route (GET): Fetch
// get the average stats of the car over the last 24 hours
app.get(
  "/api/car-24-status",
  async (req, res) => {
    //for debuging if the server cant be reached will send placeholder data
    if (DEBUG) {
      return res.json({
        info: {
          TopSpeed: 0,
          AvgSpeed: 0,
          AvgCabinTemp: 0,
          AvgEngineTemp: 0,
          TotalMiles: 0,
          StartTime: 0,
          EndTime: 1,
        },
        timestamp: new Date(),
        status: "success",
      });
    }

    try {
      console.log("Sending car-24-status Query");
      const data = await get24HourAverages();

      // error handling
      if (!data) {
        return res.status(500).json({
          error: "Database error: No Data Found",
        });
      }

      res.json({
        info: data,
        timestamp: new Date(),
        status: "success",
      });
    } catch (err) {
      console.error(
        "API ERROR (/api/car-24-status):",
        err
      );
      res
        .status(500)
        .json({ error: "Server error" });
    }
  }
);

// API Route (GET): Fetch data
// gets the location data over the last 24 hours from the car as coordinates
app.get(
  "/api/location-data",
  async (req, res) => {
    //for debuging if the server cant be reached will send placeholder data
    if (DEBUG) {
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

    try {
      console.log("Sending location-data Query");

      const rows = await getLocationData();

      // error handling
      if (!rows) {
        return res.status(500).json({
          error: "Database error: No Data Found",
        });
      }

      // Transform DB rows to the shape MapPage expects: { key, location: { lat, lng } }
      const locations = [];

      for (const row of rows) {
        // Extract the numbers
        const lat = Number(row.Latitude);
        const lng = Number(row.Longitude);

        const isValid =
          !isNaN(lat) && !isNaN(lng);

        if (isValid) {
          // adds to the list with a json
          locations.push({
            key: row.MsgID,
            location: { lat, lng },
          });
        }
      }

      return res.json({
        info: { Locations: locations },
        timestamp: new Date(),
        status: "success",
      });
    } catch (err) {
      console.error(
        "API ERROR (/api/location-data):",
        err
      );
      res
        .status(500)
        .json({ error: "Server error" });
    }
  }
);

// API Route (GET): Fetch data
// gets the locational data for the routes that the car took, it counts a route as stopping
// for atleast 15min and then driving again, will return coordinate data for it
app.get(
  "/api/routes-locations",
  async (req, res) => {
    //for debuging if the server cant be reached will send placeholder data
    if (DEBUG) {
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
    try {
      console.log(
        "Sending routes location Query"
      );

      const rows = await getRouteLocations();

      // error handling
      if (!rows) {
        return res.status(500).json({
          error: "Database error: No Data Found",
        });
      }

      // Transform DB rows to the shape MapPage expects: { key, location: { lat, lng } }
      const locations = [];

      for (const row of rows) {
        // Extract the numbers
        const lat = Number(row.Latitude);
        const lng = Number(row.Longitude);

        const isValid =
          !isNaN(lat) && !isNaN(lng);

        if (isValid) {
          // adds to the list with a json
          locations.push({
            key: row.MsgID,
            location: { lat, lng },
          });
        }
      }

      return res.json({
        info: { Locations: locations },
        timestamp: new Date(),
        status: "success",
      });
    } catch (err) {
      res.status(500).json({
        error: "API ERROR (/api/car-24-status):",
      });
    }
  }
);

// API Route (GET): Fetch
// gets the average data for each route that the car took, each route data has a
// key called PeriodGroup that defines which route it is in the day.
app.get("/api/routes-data", async (req, res) => {
  //for debuging if the server cant be reached will send placeholder data
  if (DEBUG) {
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

  try {
    console.log("Sending routes Query");

    const data = await getRouteData();

    // error handling
    if (!data) {
      return res.status(500).json({
        error: "Database error: No Data Found",
      });
    }
    console.log("server data: ", data);
    return res.json({ data });
  } catch (err) {
    res.status(500).json({
      error: "API ERROR (/api/routes-data):",
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
