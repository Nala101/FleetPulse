
/**
 * Copyright 2024 Google LLC
 * Licensed under the Apache License, Version 2.0
 */

// most of this code was taken from the example code from google to use their api
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

// colors for the map markers, this is used for the different routes
const GROUP_COLORS = {
  1: "bg-pink-500",
  2: "bg-red-500",
  3: "bg-orange-500",
  4: "bg-yellow-500",
  5: "bg-green-500",
  6: "bg-cyan-500",
  7: "bg-blue-500",
  8: "bg-purple-500",
  9: "bg-stone-500",
  10: "bg-rose-500",
};

// creates the map from the google maps api, this code was taken from the example code 
// from the google maps api github example
export default function MapWindow({ locations }) {
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
            defaultZoom={6}
            defaultCenter={{
              lat: 36.7783,
              lng: -119.4179,
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
    </div>
  );
}

// creates the markers for the map, code was taken from google 
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

      {pois.map((poi) => {

        // this part will color the marker based on the route it is
        const colorClass = GROUP_COLORS[poi.PeriodGroup] || "bg-blue-500";
        
        return (
          <AdvancedMarker
            key={poi.key}
            position={poi.location}
            ref={(marker) =>
              setMarkerRef(marker, poi.key)
            }
            clickable={true}
            onClick={handleClick}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${colorClass}`}
            ></div>
          </AdvancedMarker>
        );})}
    </>
  );
};
