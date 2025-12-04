import React from "react";
import InfoCard from "../Components/InfoCard";
import ErrorNotification from "../Components/ErrorNotification";
import useSWR from "swr";
import StatsMenu from "../Components/StatsMenu";
import MapCard from "../Components/MapCard";


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

export default function Dashboard() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:3000/api/car-status",
    fetcher,
    { refreshInterval: 1000 } // 3. Configuration: Auto-fetch every 1000ms (1s)
  );

  // error hadning for when it connects to the database 
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

  const stats = data.info;
  const locations = [
    {
      key: "LastLocation",
      location: {
        lat: stats.latitude,
        lng: stats.longitude,
      },
    },
  ];
  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <div className="flex flex-wrap gap-4 p-4 justify-center">
          <InfoCard
            title="Speed"
            content={stats.Speed + " MPH"}
          />
          <InfoCard
            title="RPM"
            content={stats.Rpm + " RPM"}
          />
          <InfoCard
            title="Fuel Level"
            content={stats.Fuel + " %"}
          />
          <InfoCard
            title="Cabin Temp"
            content={stats.Tempurature + "°F"}
          />
        </div>
      </div>

      <div>
        <MapCard
          location={locations}
        />
      </div>
    </div>
  );
}
