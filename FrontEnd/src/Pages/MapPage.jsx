import StatsMenu from "../Components/StatsMenu";
import ErrorNotification from "../Components/ErrorNotification";
import useSWR from "swr";
import MapWindow from "../Components/MapWindow";


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

// This is the function that will make the map page that shows the map of the last
// 24 hours of the vehicle on a google maps using Google API with MapWindow
export default function MapPage() {
  // fetches data from the backend automatically
  const { data, error, isLoading } = useSWR(
    "http://localhost:3000/api/location-data",
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

  // make sure locations is an array cuz if not it will break the google maps,
  // since it could load before it finishes connecting to the back end, so it wil just default to
  // empty array if it is not an array yet
  let locations = data.info;

  return (
    <div>
      <MapWindow locations={locations} />
      <Menu />
    </div>
  );
}

// this is for the stats menu that shows the average 24 hr stats of the vehicle
// put below the map
function Menu() {
  // fetches data from the backend automatically
  const { data, error, isLoading } = useSWR(
    "http://localhost:3000/api/car-24-status",
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

  return (
    <div>
      <StatsMenu
        data={data.info}
        title={"24 Hour Stats"}
      />
      ;
    </div>
  );
}
