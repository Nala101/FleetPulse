import React from "react";

export default function StatsMenu(){
    return (
      <div className="py-4 px-3">
        <div className="flex flex-col bg-surface-600 rounded-md mx-auto shadow-2xl p">
          <div className="text-lg bg-primary-500 rounded-md shadow-md p-1 text-neutral-50 text-left p-4">
            24 Hr Avg Car Stats
          </div>
          <div className="text-lg text-neutral-50 text-left p-4">
            AVG MPH:
          </div>
          <div className="text-lg text-neutral-50 text-left p-4">
            Top Speed:
          </div>
          <div className="text-lg text-neutral-50 text-left p-4">
            AVG RMP:
          </div>
        </div>
      </div>
    );
}