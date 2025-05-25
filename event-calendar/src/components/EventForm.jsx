import React, { useState, useEffect } from "react";
import { useEvents } from "../context/EventContext";

function toLocalDateTimeString(date) {
  const pad = (n) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const EventForm = ({ selectedDate, existingEvent, onClose }) => {
  const { addEvent, updateEvent, deleteEvent, events, categoryColors, updateCategoryColor } = useEvents();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [date, setDate] = useState("");
  const [frequency, setFrequency] = useState("none");
  const [interval, setInterval] = useState(1);
  const [endDate, setEndDate] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState([]);

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setDescription(existingEvent.description);
      setCategory(existingEvent.category || "other");
      setDate(toLocalDateTimeString(new Date(existingEvent.date)));
      const r = existingEvent.recurrence;
      if (r) {
        setFrequency(r.frequency || "none");
        setInterval(r.interval || 1);
        setEndDate(r.endDate?.slice(0, 10) || "");
        setDaysOfWeek(r.daysOfWeek || []);
      }
    } else if (selectedDate) {
      setDate(toLocalDateTimeString(selectedDate));
    }
  }, [existingEvent, selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title required");
    const newEvent = {
      id: existingEvent?.id || Date.now().toString(),
      title,
      description,
      category,
      date: new Date(date).toISOString(),
      recurrence: frequency === "none" ? null : {
        frequency,
        interval,
        daysOfWeek: frequency === "weekly" ? daysOfWeek : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      },
      duration: 60 * 60 * 1000,
    };
    existingEvent ? updateEvent(newEvent) : addEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80 max-h-[90vh] overflow-auto">
        <h3 className="text-lg font-bold mb-4">{existingEvent ? "Edit" : "Add"} Event</h3>

        <label className="block mb-2">
          Title
          <input className="w-full border px-2 py-1 rounded mt-1" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label className="block mb-2">
          Description
          <textarea className="w-full border px-2 py-1 rounded mt-1" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <label className="block mb-2">
          Category
          <select className="w-full border px-2 py-1 rounded mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.keys(categoryColors).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
          Color for category
          <input type="color" className="w-full h-8 p-0 rounded mt-1" value={categoryColors[category]} onChange={(e) => updateCategoryColor(category, e.target.value)} />
        </label>

        <label className="block mb-4">
          Date & Time
          <input type="datetime-local" className="w-full border px-2 py-1 rounded mt-1" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <label className="block mb-2">
          Recurrence
          <select className="w-full border px-2 py-1 rounded mt-1" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            <option value="none">No recurrence</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>

        {frequency !== "none" && (
          <>
            <label className="block mb-2">
              Interval
              <input type="number" className="w-full border px-2 py-1 rounded mt-1" min="1" value={interval} onChange={(e) => setInterval(Number(e.target.value))} />
            </label>

            {frequency === "weekly" && (
              <div className="mb-2">
                <p className="text-sm">Repeat on:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
                    <label key={i} className="flex items-center space-x-1">
                      <input type="checkbox" checked={daysOfWeek.includes(i)} onChange={() => {
                        setDaysOfWeek(daysOfWeek.includes(i) ? daysOfWeek.filter(d => d !== i) : [...daysOfWeek, i]);
                      }} />
                      <span>{d}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <label className="block mb-4">
              Until
              <input type="date" className="w-full border px-2 py-1 rounded mt-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </>
        )}

        <div className="flex justify-between mt-4">
          <button type="submit" className="bg-black text-white px-3 py-1 rounded">
            {existingEvent ? "Update" : "Add"}
          </button>
          {existingEvent && (
            <button type="button" className="bg-orange-500 text-white px-3 py-1 rounded" onClick={() => {
              deleteEvent(existingEvent.id);
              onClose();
            }}>Delete</button>
          )}
          <button type="button" className="px-3 py-1 border rounded" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
