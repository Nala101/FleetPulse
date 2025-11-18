import React from 'react'
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>title</h1>
        <p>text</p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Click Me
        </button>
      </header>
    </div>
  );
}
