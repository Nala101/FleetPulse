import React from "react";
import ErrorNotification from "../Components/ErrorNotification";
import useSWR from "swr";

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

// this creates a new card for the average stats for the car data
// bascially just intakes the title and json for the data pulled from
// the database and shows it
export default function StatsMenu({
  data,
  title,
}) {
  const stats = data;

  const startTime =
    stats.StartTime.split("T")[0] +
    ": " +
    stats.StartTime.split("T")[1];
  const endTime =
    stats.EndTime.split("T")[0] +
    ": " +
    stats.EndTime.split("T")[1];

  return (
    // the divs for the card, uses tailwind for the styling and just displays each of the
    // stats in a line down. Is able to be expanded easily
    <div className="py-4 px-3">
      <div className="flex flex-col bg-surface-600 rounded-md mx-auto shadow-2xl p">
        <div className="text-lg bg-primary-500 rounded-md shadow-md p-1 text-neutral-50 text-left p-4">
          {title}
        </div>
        <div className="text-lg text-neutral-50 text-left p-4">
          <div>
            Top Speed: {stats.TopSpeed} MPH{" "}
          </div>
          <div>
            AVG Speed: {stats.AvgSpeed} MPH
          </div>
          <div>
            AVG Cabin Temps: {stats.AvgCabinTemp}{" "}
            F
          </div>
          <div>
            AVG Engine Temps: {stats.AvgEngineTemp}{" "}
            F
          </div>
          <div>
            Total Miles Traveled:{" "}
            {stats.TtlMilesTraveled} Miles AVG
          </div>
          <div>
            MPG: {stats.AvgMPG} Gallons Per Mile
            AVG
          </div>
          <div>
            CabinHumidity:{" "}
            {stats.AvgCabinHumidity}%
          </div>
          <div>
            {" "}
            Driving Start Time: {startTime}
          </div>
          <div>Driving End Time: {endTime}</div>
        </div>
      </div>
    </div>
  );
}
