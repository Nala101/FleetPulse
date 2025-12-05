import React from "react";

// a simple error card that can show up when there is an error
export default function ErrorNotification({
  message,
}) {
  return (
    <div className="fixed top-4 right-4 p-4 z-50">
      <div className="bg-yellow-200 text-yellow-900 border border-yellow-400 rounded-lg shadow-lg px-6 py-4">
        {message}
      </div>
    </div>
  );
}
