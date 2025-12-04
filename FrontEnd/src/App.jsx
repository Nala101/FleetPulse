import React from 'react'
import "./App.css";
import NavBar from './Components/NavBar.jsx'
import Dashboard from "./Pages/Dashboard.jsx";
import MapPage from "./Pages/MapPage.jsx";
import MainPage from './Pages/MainPage.jsx';
import { Routes, Route } from 'react-router-dom';
import RoutesPage from './Pages/RoutesPage.jsx';


export default function App() {
  return (
    <div className="bg-white-100">
      <NavBar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/routes" element={<RoutesPage />} />
      </Routes>
    </div>
  );
}
