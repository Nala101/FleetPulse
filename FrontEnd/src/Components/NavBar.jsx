import { Link } from "react-router-dom";

// nav bar for the webite to navigate to difference web pages
export default function NavBar() {
  return (
    <nav className="p-4 shadow-md bg-primary-500">
      <div className="mx-auto flex-col items-center">
        <div className="text-4xl font-bold text-neutral-50">
          FleetPulse
        </div>
        <div className="space-x-4 text-neutral-50">
          <Link
            to="/dashboard"
            className="hover:underline"
          >
            Live Dashboard
          </Link>

          <Link
            to="/map"
            className="hover:underline"
          >
            24 Hour History
          </Link>
          <Link
            to="/routes"
            className="hover:underline"
          >
            Routes
          </Link>
        </div>
      </div>
    </nav>
  );
}
