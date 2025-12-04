import React from "react";
import { MapWindow } from "../Pages/MapPage";


export default function MapCard({location}){

    return (
      <div className="bg-surface-600 rounded-md mx-auto shadow-2xl">
        <div className="text-lg bg-primary-500 rounded-md shadow-md p-1 text-neutral-50 text-left">
            Live Location
        </div>

        <div className="text-center text-neutral-50">
          <MapWindow locations={location}/>
        </div>
      </div>
    );
}