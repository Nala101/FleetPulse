import React from "react";


export default function NavBar() {
  return (
    <nav className="bg-blue-500 text-white p-4 shadow-md">
      <div className="mx-auto flex-col items-center">
        <div className="text-2xl font-bold">
          FleetPulse
        </div>

        <div className="space-x-4">
          <a href="#" className="hover:underline">
            Dashboard
          </a>
          <a href="#" className="hover:underline">
            Map
          </a>
        </div>
      </div>
    </nav>
  );
}
