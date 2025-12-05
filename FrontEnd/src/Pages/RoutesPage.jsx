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
    const err = new Error(`Request failed: ${res.status}`);
    err.info = json;
    throw err;
  }
  return json;
};

export default function RoutesPage(){
  const { data, error, isLoading } = useSWR(
    "http://localhost:3000/api/routes-locations",
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


const PoiMarkers = ({ pois }) => {
  const map = useMap();
  const [markers, setMarkers] = useState({});
  const clusterer = useRef(null);
  const [circleCenter, setCircleCenter] =
    useState(null);

  const handleClick = useCallback(
    (ev) => {
      if (!map || !ev.latLng) return;
      console.log(
        "marker clicked:",
        ev.latLng.toString()
      );
      map.panTo(ev.latLng);
      setCircleCenter(ev.latLng);
    },
    [map]
  );

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({
        map,
      });
    }
  }, [map]);

  useEffect(() => {
    if (clusterer.current) {
      clusterer.current.clearMarkers();
      clusterer.current.addMarkers(
        Object.values(markers)
      );
    }
  }, [markers]);

  const setMarkerRef = (marker, key) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers((prev) => {
      if (marker) {
        return { ...prev, [key]: marker };
      } else {
        const newMarkers = { ...prev };
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  return (
    <>
      <Circle
        radius={800}
        center={circleCenter}
        strokeColor={"#0c4cb3"}
        strokeOpacity={1}
        strokeWeight={3}
        fillColor={"#3b82f6"}
        fillOpacity={0.3}
      />

      {pois.map((poi) => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}
          ref={(marker) =>
            setMarkerRef(marker, poi.key)
          }
          clickable={true}
          onClick={handleClick}
        >
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
        </AdvancedMarker>
      ))}
    </>
  );
};


function Menu(){
  const { data, error, isLoading } = useSWR(
    "http://localhost:3000/api/routes-data",
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

  // Safely access the inner data 
  // The ?. check prevents crashing if data is null during loading
  const routes = data?.info;
  console.log("adfafa",routes);
  const menuItems = [];

  if (routes && Array.isArray(routes)) {
    for (let i = 0; i < routes.length; i++) {
      console.log(routes[i]);
      menuItems.push(
        <StatsMenu
          key={i} // IMPORTANT: React needs a unique 'key' for lists
          data={ routes[i] }
          title={"Route " + routes[i].PeriodGroup}
        />
      );
    }
  }

  return (
    <div className="flex flex-row">
      {menuItems}
    </div>
  );
}