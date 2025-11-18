import React from "react";
import InfoCard from "../Components/InfoCard";

export default function Dashboard() {
  return (
    <div className="flex flex-wrap gap-4 p-4 justify-center">
      <InfoCard title="Speed" content="0" />
      <InfoCard title="RPM" content="0" />
      <InfoCard
        title="Fuel Level"
        content="0"
      />
      <InfoCard
        title="Cabin Temp"
        content="0"
      />
    </div>
  );
}
