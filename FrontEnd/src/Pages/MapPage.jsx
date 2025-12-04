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

export default function MapPage(){

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


    // makes sure locations is an array cuz if not it will break the google maps,
    // since it could load before it finishes connecting to the back end, so it wil just default to 
    // empty array if it is not an array yet
const locations = Array.isArray(data?.info)
  ? data.info
  : [];


  return (
    <div className="flex flex-row">
      <div
        style={{ width: "100%", height: "100vh" }}
      >
        <APIProvider
          apiKey={
            import.meta.env
              .VITE_GOOGLE_MAPS_API_KEY
          }
          onLoad={() =>
            console.log("Maps API loaded")
          }
        >
          <Map
            defaultZoom={13}
            defaultCenter={{
              lat: -33.860664,
              lng: 151.208138,
            }}
            onCameraChanged={(ev) =>
              console.log(
                "camera changed:",
                ev.detail.center,
                "zoom:",
                ev.detail.zoom
              )
            }
            mapId="da37f3254c6a6d1c"
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <PoiMarkers pois={locations} />
          </Map>
        </APIProvider>
      </div>

      <div>
          <StatsMenu />

      </div>
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


