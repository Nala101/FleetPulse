import InfoCard from "../Components/InfoCard";
import ErrorNotification from "../Components/ErrorNotification";
import useSWR from "swr";
import MapCard from "../Components/MapCard";

// this is the fetcher for swr to use to query the backend endpoint
// this was from chatgpt
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

// creates the dashboard page for the website to display the car stats, and queries the backend for the car status information
// and populates the coresponding infoCards and MapCards with the information
export default function Dashboard() {
  // fetches data from the backend automatically
  const { data, error, isLoading } = useSWR(
    "http://localhost:3000/api/car-status",
    fetcher,
    { refreshInterval: 1000 } // Configuration: Auto-fetch every 1000ms (1s)
  );

  // error handling for when it connects to the database
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

  // formats the location coords into the proper format for google maps api
  const stats = data.info;
  const locations = [
    {
      key: "LastLocation",
      location: {
        lat: stats.Latitude,
        lng: stats.Longitude,
      },
    },
  ];

  // creates the dashboard part for the website to display all the live vehicle stats
  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <div className="flex flex-wrap gap-4 p-4 justify-center">
          <InfoCard
            title="Speed"
            content={stats.Mph + " MPH"}
          />
          <InfoCard
            title="RPM"
            content={stats.Rpm + " RPM"}
          />
          <InfoCard
            title="Fuel Level"
            content={stats.FuelPercent + " %"}
          />
          <InfoCard
            title="Cabin Temp"
            content={
              stats.CabinTemperature + "°F"
            }
          />
        </div>
      </div>
      <div>
        <MapCard location={locations} />
      </div>
    </div>
  );
}
