import React from "react";
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


/*
Here is the sql query for reference 
SELECT
      MAX(msg.mph) as 'TopSpeed',
      AVG(msg.mph) as 'AvgSpeed',
      AVG(msg.CabinTemperature) as 'AvgCabinTemp',
      AVG(msg.CabinHumidity) as 'AvgCabinHumidity',
      AVG(msg.EngineTemp) as 'AvgEngineTemp',
      SUM(msg.MilesTraveled) as 'TtlMilesTraveled',
      SUM(msg.MilesTraveled)/SUM(msg.GalUsed) as 'AvgMPG'
      FROM dbo.Msg as msg
      WHERE msg.UploadTime > DATEADD(HOUR, -96, GETDATE())

*/


export default function StatsMenu({data}){

  const stats = data.info;
  return (
    <div className="py-4 px-3">
      <div className="flex flex-col bg-surface-600 rounded-md mx-auto shadow-2xl p">
        <div className="text-lg bg-primary-500 rounded-md shadow-md p-1 text-neutral-50 text-left p-4">
          24 Hr Avg Car Stats
        </div>
        <div className="text-lg text-neutral-50 text-left p-4">
          Top Speed: {stats.TopSpeed} MPH
        </div>
        <div className="text-lg text-neutral-50 text-left p-4">
          AVG Speed: {stats.AvgSpeed} MPH
        </div>
        <div className="text-lg text-neutral-50 text-left p-4">
          AVG Cabin Temps: {stats.AvgCabinTemp} F
        </div>
        <div className="text-lg text-neutral-50 text-left p-4">
          AVG Engine Temps: {stats.AvgEngineTemp}{" "}
          F
        </div>
        <div className="text-lg text-neutral-50 text-left p-4">
          Total Miles Traveled:{" "}
          {stats.TtlMilesTraveled} Miles
        </div>
        <div className="text-lg text-neutral-50 text-left p-4">
          AVG MPG: {stats.AvgMPG} Gallons Per Mile
        </div>
        <div className="text-lg text-neutral-50 text-left p-4">
          AVG CabinHumidity:{" "}
          {stats.AvgCabinHumidity}%
        </div>
      </div>
    </div>
  );
}