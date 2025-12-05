/**
 * Copyright 2024 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

// just removed the type script stuff and turned it back into normal js
// used this example https://github.com/googlemaps-samples/codelab-maps-platform-101-react-js/tree/main

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";

import { MarkerClusterer } from "@googlemaps/markerclusterer";

import { Circle } from "../Components/circle";
import StatsMenu from "../Components/StatsMenu";
import ErrorNotification from "../Components/ErrorNotification";
import useSWR from "swr";
import MapWindow from "../Components/MapWindow";

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

export default function MapPage() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:3000/api/location-data",
    fetcher,
    { refreshInterval: 1000 } // 3. Configuration: Auto-fetch every 1000ms (1s)
  );

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

  return (
    <div>
      <MapWindow locations={locations} />
      <Menu />
    </div>
  );
}

function Menu() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:3000/api/car-24-status",
    fetcher,
    { refreshInterval: 1000 } // Configuration: Auto-fetch every 1000ms (1s)
  );

  

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

  


  return (
    <div>
      <StatsMenu
        data={data.info}
        title={"24 Hour Stats"}
      />
      ;
    </div>
  );
}
