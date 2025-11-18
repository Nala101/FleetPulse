import React from "react";


export default function InfoCard({title, content}){
    return (
      <div className="bg-blue-200 shadow-md rounded-md mx-auto ">
        <div className="text-lg bg-blue-500 rounded-md shadow-md p-1 text-white text-left">
          {title}
        </div>

        <div className="text-center p-20">
          {content}
        </div>
      </div>
    );
}