// this creates a new card for the average stats for the car data
// bascially just intakes the title and json for the data given to
// the function and shows it
export default function StatsMenu({
  data,
  title,
}) {
  const stats = data;

  // this splits up the time data so it is formated nicely
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
            AVG Engine Temps:{" "}
            {stats.AvgEngineTemp} F
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
