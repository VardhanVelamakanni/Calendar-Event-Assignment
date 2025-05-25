import React from "react";
import Calendar from "./components/Calendar";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-center text-3xl font-bold py-6">Event Calendar</h1>
      <Calendar />
    </div>
  );
};

export default App;
