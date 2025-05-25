import React, { createContext, useContext, useState, useEffect } from "react";

const EventContext = createContext();

export const useEvents = () => useContext(EventContext);

export const EventProvider = ({ children }) => {
  // Initialize from localStorage directly in useState
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem("events");
    return savedEvents ? JSON.parse(savedEvents) : [];
  });

  const [categoryColors, setCategoryColors] = useState(() => {
    const savedColors = localStorage.getItem("categoryColors");
    return savedColors
      ? JSON.parse(savedColors)
      : {
          work: "#22c55e", // green
          personal: "#8b5cf6", // purple
          meeting: "#ef4444", // red
          other: "#facc15", // yellow
        };
  });

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("categoryColors", JSON.stringify(categoryColors));
  }, [categoryColors]);

  const addEvent = (event) => setEvents((prev) => [...prev, event]);

  const updateEvent = (updatedEvent) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
  };

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const updateCategoryColor = (category, color) => {
    setCategoryColors((prev) => ({ ...prev, [category]: color }));
  };

  return (
    <EventContext.Provider
      value={{
        events,
        categoryColors,
        addEvent,
        updateEvent,
        deleteEvent,
        updateCategoryColor,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
