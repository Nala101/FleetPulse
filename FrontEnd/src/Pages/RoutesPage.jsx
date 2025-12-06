/**
 * Copyright 2024 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

// just removed the type script stuff and turned it back into normal js
// used this example https://github.com/googlemaps-samples/codelab-maps-platform-101-react-js/tree/main

// this page is for the routes data so the user can visualize the differnet routes they took
// currently a route is defined as having a 15min gap of being idle between drives
// this page has a map with color coded routes as well as aggregate stats about each route
// in a card below the map

import StatsMenu from "../Components/StatsMenu";
import ErrorNotification from "../Components/ErrorNotification";
import useSWR from "swr";
import MapWindow from "../Components/MapWindow";

// colors for the map markers, this is used for the different routes
const GROUP_COLORS = {
  1: "pink",
  2: "red",
  3: "orange",
  4: "yellow",
  5: "green",
  6: "cyan",
  7: "blue",
  8: "purple",
  9: "stone",
  10: "rose",
};

// this is the fetcher for swr to use to query the backend endpoint
const fetcher = async (...args) => {
  const res = await fetch(...args);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      `Request failed: ${res.status}`
    );
    err.info = json;
    throw err;
  }
  return json;
};

// This is the routes page that will display the routes that the user took on a map and 
// the average data values for the diffferent routes
export default function RoutesPage() {
  // fetches data from the backend automatically
  const { data, error, isLoading } = useSWR(
    "http://localhost:3000/api/routes-locations",
    fetcher,
    { refreshInterval: 1000 } // Configuration: Auto-fetch every 1000ms (1s)
  );

  // error handling
  if (error)
    return (
      <div>
        <ErrorNotification message="Error 500: Unable to connect to database" />
      </div>
    );

  if (isLoading)
    return (
      <div>
        <ErrorNotification message="loading dashboard" />
      </div>
    );

  // make sure locations is an array cuz if not it will break the google maps,
  // since it could load before it finishes connecting to the back end, so it wil just default to
  // empty array if it is not an array yet
  let locations = data.info.Locations;
  console.log(locations);

  return (
    <div>
      <MapWindow locations={locations} />
      <Menu />
    </div>
  );
}

// this menu function is for posting the aggregate routes data for each route
function Menu() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:3000/api/routes-data",
    fetcher,
    { refreshInterval: 1000 } // 3. Configuration: Auto-fetch every 1000ms (1s)
  );

  // error handling
  if (error)
    return (
      <div>
        <ErrorNotification message="Error 500: Unable to connect to database" />
      </div>
    );

  if (isLoading)
    return (
      <div>
        <ErrorNotification message="loading dashboard" />
      </div>
    );

  // Safely access the inner data
  // The ?. check prevents crashing if data is null during loading
  const routes = data?.info;

  const menuItems = [];

  // This creates menus for each route data and formats it properly
  if (routes && Array.isArray(routes)) {
    for (let i = 0; i < routes.length; i++) {
      menuItems.push(
        <StatsMenu
          key={i} // IMPORTANT: React needs a unique 'key' for lists
          data={routes[i]}
          title={
            "Route " +
            routes[i].PeriodGroup +
            " (" +
            (GROUP_COLORS[i + 1]) +
            ")"
          }
        />
      );
    }
  }

  // puts the aggregate data cards in a row below the map
  return (
    <div className="flex flex-row">
      {menuItems}
    </div>
  );
}
