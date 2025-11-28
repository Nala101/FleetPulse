import React from "react";
import ErrorNotification from "../Components/ErrorNotification";
import useSWR from "swr";



const fetcher = (...args) =>
  fetch(...args).then((res) => res.json());


export default function StatsMenu(){

     const { data, error, isLoading } = useSWR(
    "http://localhost:3000/api/car-24-status",
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

  const stats = data.stats;

  return (
    <div className="py-4 px-3">
      <div className="flex flex-col bg-surface-600 rounded-md mx-auto shadow-2xl p">
        <div className="text-lg bg-primary-500 rounded-md shadow-md p-1 text-neutral-50 text-left p-4">
          24 Hr Avg Car Stats
        </div>
        <div className="text-lg text-neutral-50 text-left p-4">
          AVG Speed: {stats.AvgSpeed} MPH
        </div>
        <div className="text-lg text-neutral-50 text-left p-4">
          Top Speed: {stats.TopSpeed} MPH
        </div>
        <div className="text-lg text-neutral-50 text-left p-4">
          AVG RMP: {stats.AvgRPM} RPM
        </div>
      </div>
    </div>
  );
}