import React from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="bg-blue-500 text-white p-4 shadow-md">
      <div className="mx-auto flex-col items-center">
        <div className="text-2xl font-bold">
          FleetPulse
        </div>
        <div className="space-x-4">
          <Link
            to="/dashboard"
            className="hover:underline"
          >
            Dashboard
          </Link>

          <Link
            to="/map"
            className="hover:underline"
          >
            Map
          </Link>
        </div>
      </div>
    </nav>
  );
}
