import React from "react";

export default function ErrorNotification({
  message,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="bg-yellow-200 text-yellow-900 border border-yellow-400 rounded-lg shadow-lg px-6 py-4">
        {message}
      </div>
    </div>
  );
}
