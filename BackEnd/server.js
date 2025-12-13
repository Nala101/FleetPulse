import express from "express";
import cors from "cors";

import { carStatus } from "./sql_connection.js";
import { getLocationData } from "./sql_connection.js";
import { get24HourAverages } from "./sql_connection.js";
import { getRouteData } from "./sql_connection.js";
import { getRouteLocations } from "./sql_connection.js";
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


// gets the current status of the car and returns the data as a json
// data is nested under the key "info"
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

  return querySQLDataAndSetReponse({
    res: res,
    req: req,
    func: carStatus,
    apiCallName: "car-status Query",
    transform: null,
  });
});


// get the average stats of the car over the last 24 hours, returns the data as a json
// data is nested under the key "info"
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
  return querySQLDataAndSetReponse({
    res: res,
    req: req,
    func: get24HourAverages,
    apiCallName: "car-24-status Query",
    transform: addTemporaryTime,
  });
  }
);


// gets the location data over the last 24 hours from the car as coordinates
// data is nested under the key "info"

app.get(
  "/api/location-data",
  async (req, res) => {
    //for debuging if the server cant be reached will send placeholder data
    if (DEBUG) {
      // Plain JS array of POIs used as default values, taken from the google maps api example code
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

    return querySQLDataAndSetReponse({
      res: res,
      req: req,
      func: getLocationData,
      apiCallName: "location-data Query",
      transform: formatLocationalData,
    });
}
);


// gets the locational data for the routes that the car took, it counts a route as stopping
// for atleast 15min and then driving again, will return coordinate data for it
// data is nested under the key "info"

app.get(
  "/api/routes-locations",
  async (req, res) => {
    //for debuging if the server cant be reached will send placeholder data
    if (DEBUG) {
      // Plain JS array of POIs taken from the google maps api example as place holder data
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
    return querySQLDataAndSetReponse({
      res: res,
      req: req,
      func: getRouteLocations,
      apiCallName: "routes-locations Query",
      transform: formatLocationalData,
    });
  }
);


// gets the average data for each route that the car took, each route data has a
// key called PeriodGroup that defines which route it is in the day.
// data is nested under the key "info"

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

  querySQLDataAndSetReponse({
    res: res,
    req: req,
    func: getRouteData,
    apiCallName: "routes-data Query",
    transform: null
  });
});

// middleware for catching errors 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Error");
});

// starts the server listener
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


// this is the helper function for sending and reciving data from the sql server
// it wraps it in try statments for catching errors and handles the sql querries with 
// error handling 
async function querySQLDataAndSetReponse({res, req, func, apiCallName, transform}){

    try {
      console.log("Sending car-24-status Query");
      const queryData = await func();

      // error handling
      if (!queryData) {
        return res.status(500).json({
          error: "Database error: No Data Found",
        });
      }

      // this will check if there is a transform function and apply it, if not it will just 
      // pass through the data 
      let data; 
      if (transform){
        data = transform(queryData);
      }else{
        data = queryData;
      }

      console.log(
        `server data for ${apiCallName}: `,
        data
      );

      // makes the response for the data 
      res.json({
        info: data,
        timestamp: new Date(),
        status: "success",
      });
    } catch (err) {
      console.error(
        `API ERROR (${apiCallName}):`,
        err
      );
      res
        .status(500)
        .json({ error: "Server error: " + err });
    }
}

// this helper function will format the data into a format that google maps api can read
function formatLocationalData(data){
  // this is will convert all the rows into the proper format for the google maps api
  const locations = data.map((r) => ({
    key: r.key,
    location: {
      lat: Number(r.lat),
      lng: Number(r.lng),
    },
    PeriodGroup: r.PeriodGroup ?? null, // this will use null if its null
  }));

  return locations;
}

// just adds the time into the data as a place holder since the 
// stats menu card needs time 
function addTemporaryTime(data){
  console.log(data);
  data.StartTime = "T0:00";
  data.EndTime = "T23:59";
  return data;
}