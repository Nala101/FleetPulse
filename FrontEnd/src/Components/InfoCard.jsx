import React from "react";


export default function InfoCard({title, content}){
    return (
      <div className="bg-surface-600 rounded-md mx-auto shadow-2xl">
        <div className="text-lg bg-primary-500 rounded-md shadow-md p-1 text-neutral-50 text-left">
          {title}
        </div>

        <div className="text-center text-neutral-50 p-20">
          {content}
        </div>
      </div>
    );
}