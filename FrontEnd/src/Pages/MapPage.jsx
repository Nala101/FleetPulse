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
import { createRoot } from "react-dom/client";

import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";

import { MarkerClusterer } from "@googlemaps/markerclusterer";

import { Circle } from "../components/circle";
import StatsMenu from "../Components/StatsMenu";
import ErrorNotification from "../Components/ErrorNotification";
import useSWR from "swr";



const fetcher = (...args) =>
  fetch(...args).then((res) => res.json());

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
  }
];

export default function MapPage(){

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



const calculateDirections = async() => {
  if (locations.length > 1){
    const directionService = new window.google.maps.DirectionService()
  }


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


