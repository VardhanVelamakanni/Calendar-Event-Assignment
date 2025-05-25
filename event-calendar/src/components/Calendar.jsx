import React, { useState, useEffect } from "react";
import EventForm from "./EventForm";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
} from "date-fns";
import { useEvents } from "../context/EventContext";

// Hook to get window width for responsive behavior
const useWindowSize = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
};

const Calendar = () => {
  const width = useWindowSize();
  const isMobile = width < 640; // Tailwind's sm breakpoint is 640px

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const { events, updateEvent, categoryColors } = useEvents();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Calculate the current week start based on selectedDate or currentMonth for weekly view
  const currentWeekStart = selectedDate
    ? startOfWeek(selectedDate)
    : startOfWeek(new Date());

  const isEventOccurringOnDate = (event, date) => {
    const eventDate = new Date(event.date);
    if (isSameDay(eventDate, date)) return true;
    if (!event.recurrence) return false;

    const { frequency, interval = 1, daysOfWeek = [], endDate } = event.recurrence;
    const recurrenceEndDate = endDate ? new Date(endDate) : null;

    if (date < eventDate) return false;
    if (recurrenceEndDate && date > recurrenceEndDate) return false;

    switch (frequency) {
      case "daily":
        return differenceInCalendarDays(date, eventDate) % interval === 0;
      case "weekly":
        return (
          daysOfWeek.includes(date.getDay()) &&
          differenceInCalendarWeeks(date, eventDate) % interval === 0
        );
      case "monthly":
        return (
          differenceInCalendarMonths(date, eventDate) % interval === 0 &&
          date.getDate() === eventDate.getDate()
        );
      default:
        return false;
    }
  };

  const onDragStart = (e, event) => {
    e.dataTransfer.setData("text/plain", event.id);
  };

  const onDragOver = (e) => e.preventDefault();

  const onDrop = (e, date) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const draggedEvent = events.find((ev) => ev.id === id);
    if (!draggedEvent) return;

    const newDate = new Date(date);
    const oldDate = new Date(draggedEvent.date);
    newDate.setHours(oldDate.getHours(), oldDate.getMinutes(), oldDate.getSeconds());

    updateEvent({ ...draggedEvent, date: newDate.toISOString() });
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  // Render days headers for week or month view
  const renderDayHeaders = (start) => {
    return [...Array(7)].map((_, i) => (
      <div
        key={i}
        className="text-center font-semibold text-gray-700 text-xs sm:text-sm"
        style={{ minWidth: isMobile ? 80 : "auto" }}
      >
        {format(addDays(start, i), "EEE")}
      </div>
    ));
  };

  // Render days for month view
  const renderMonthDays = () => {
    const rows = [];
    let day = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));

    while (day <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dayEvents = events.filter((ev) => isEventOccurringOnDate(ev, day));
        const dayClone = day;

        week.push(
          <div
            key={day.toISOString()}
            className={`border h-24 p-1 cursor-pointer flex flex-col text-xs sm:text-sm relative
              ${!isSameMonth(day, currentMonth) ? "bg-gray-100 text-purple-400" : ""}
              ${isToday(day) ? "border-black" : ""}
              ${isSameDay(day, selectedDate) ? "bg-black/10" : ""}`}
            onClick={() => {
              setSelectedDate(dayClone);
              setSelectedEvent(null);
            }}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, dayClone)}
            style={{ minWidth: 0 }}
          >
            <div className="font-semibold">{format(day, "d")}</div>
            <div className="flex flex-col overflow-y-auto max-h-16">
              {dayEvents.map((event) => (
                <div
                  key={`${event.id}-${format(day, "yyyy-MM-dd")}`}
                  style={{
                    backgroundColor: categoryColors[event.category] || "#93c5fd",
                  }}
                  className="text-xs rounded px-1 my-0.5 truncate cursor-pointer text-black relative"
                  draggable
                  onDragStart={(e) => onDragStart(e, event)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                    setSelectedDate(new Date(event.date));
                  }}
                  onMouseEnter={() => setHoveredEventId(event.id)}
                  onMouseLeave={() => setHoveredEventId(null)}
                >
                  {event.title}

                  {hoveredEventId === event.id && (
                    <div
                      className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-56 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-xs text-gray-800 z-50
                        pointer-events-auto
                        transition-opacity duration-200 ease-in-out opacity-100"
                    >
                      <div className="font-semibold mb-1">{event.title}</div>
                      <div className="truncate">{event.description}</div>
                      <div className="mt-1 italic text-gray-500">
                        {format(new Date(event.date), "MMM d, yyyy hh:mm a")}
                      </div>
                      <div
                        className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0
                          border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white"
                        style={{ marginTop: "-1px" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toISOString()} className="grid grid-cols-7 gap-1 mb-1">
          {week}
        </div>
      );
    }
    return rows;
  };

  // Render days for week view (mobile)
  const renderWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(currentWeekStart, i);
      const dayEvents = events.filter((ev) => isEventOccurringOnDate(ev, day));
      const dayClone = day;

      days.push(
        <div
          key={day.toISOString()}
          className={`border p-2 cursor-pointer flex flex-col text-xs sm:text-sm relative min-w-[80px] h-32
            ${!isSameMonth(day, currentMonth) ? "bg-gray-100 text-purple-400" : ""}
            ${isToday(day) ? "border-black" : ""}
            ${isSameDay(day, selectedDate) ? "bg-black/10" : ""}`}
          onClick={() => {
            setSelectedDate(dayClone);
            setSelectedEvent(null);
          }}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, dayClone)}
        >
          <div className="font-semibold text-center">{format(day, "EEE d")}</div>
          <div className="flex flex-col overflow-y-auto max-h-20 mt-1">
            {dayEvents.map((event) => (
              <div
                key={`${event.id}-${format(day, "yyyy-MM-dd")}`}
                style={{
                  backgroundColor: categoryColors[event.category] || "#93c5fd",
                }}
                className="text-xs rounded px-1 my-0.5 truncate cursor-pointer text-black relative"
                draggable
                onDragStart={(e) => onDragStart(e, event)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                  setSelectedDate(new Date(event.date));
                }}
                onMouseEnter={() => setHoveredEventId(event.id)}
                onMouseLeave={() => setHoveredEventId(null)}
              >
                {event.title}

                {hoveredEventId === event.id && (
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-56 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-xs text-gray-800 z-50
                      pointer-events-auto
                      transition-opacity duration-200 ease-in-out opacity-100"
                  >
                    <div className="font-semibold mb-1">{event.title}</div>
                    <div className="truncate">{event.description}</div>
                    <div className="mt-1 italic text-gray-500">
                      {format(new Date(event.date), "MMM d, yyyy hh:mm a")}
                    </div>
                    <div
                      className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0
                        border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white"
                      style={{ marginTop: "-1px" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-2 sm:px-0">
        {!isMobile && (
          <>
            <button onClick={prevMonth} className="btn px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
              Prev
            </button>
            <h2 className="text-xl font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
            <button onClick={nextMonth} className="btn px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
              Next
            </button>
          </>
        )}

        {isMobile && (
          <h2 className="text-lg font-semibold">{format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}</h2>
        )}
      </div>

      {/* Day Headers */}
      <div
        className={`${
          isMobile ? "flex overflow-x-auto no-scrollbar space-x-1 px-1" : "grid grid-cols-7 mb-2"
        }`}
      >
        {renderDayHeaders(isMobile ? currentWeekStart : startOfWeek(currentMonth))}
      </div>

      {/* Days */}
      {isMobile ? (
        <div className="flex overflow-x-auto no-scrollbar space-x-1 px-1">
          {renderWeekDays()}
        </div>
      ) : (
        <div>{renderMonthDays()}</div>
      )}

      {/* Event Form Modal */}
      {(selectedDate || selectedEvent) && (
        <EventForm
          selectedDate={selectedDate}
          existingEvent={selectedEvent}
          onClose={() => {
            setSelectedDate(null);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
