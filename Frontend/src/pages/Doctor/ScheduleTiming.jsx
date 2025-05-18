import React, { useState } from "react";
import "../../index.css";    

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function ScheduleTimings() {
  const [selectedDay, setSelectedDay] = useState('Sunday');
  const [slotDuration, setSlotDuration] = useState('Select Duration -');
  const [slotsByDay, setSlotsByDay] = useState({
    Monday: [
      { start: "11:30 pm", end: "1:30 am" },
    ],
  });

  const [showModal, setShowModal] = useState(false);
  const [editableSlots, setEditableSlots] = useState([]);

  const handleEdit = () => {
    const slotsForDay = slotsByDay[selectedDay] || [];
    setEditableSlots([...slotsForDay]);
    setShowModal(true);
  };

  const handleAddSlot = () => {
    setEditableSlots([...editableSlots, { start: "", end: "" }]);
  };

  const handleSlotChange = (index, field, value) => {
    const updated = [...editableSlots];
    updated[index][field] = value;
    setEditableSlots(updated);
  };

  const handleRemoveSlot = (index) => {
    const updated = editableSlots.filter((_, i) => i !== index);
    setEditableSlots(updated);
  };

  const handleSaveChanges = () => {
    setSlotsByDay({ ...slotsByDay, [selectedDay]: editableSlots });
    setShowModal(false);
  };

  const handleAddInitialSlot = () => {
    setEditableSlots([{ start: "", end: "" }]);
    setShowModal(true);
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-4 fw-bold">Schedule Timings</h3>

      <div className="mb-4">
        <label className="fw-bold mb-2">Timing Slot Duration</label>
        <select className="form-control w-25" value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)}>
        <option>
            Select Duration -
          </option>
          <option>15 min</option>
          <option>30 mins</option>
          <option>45 mins</option>
          <option>1 hour</option>
        </select>
      </div>

      <div className="day-buttons mb-4">
        {days.map((day) => (
          <button
            key={day}
            className={`day-button ${selectedDay === day ? 'active' : ''}`}
            onClick={() => setSelectedDay(day)}
          >
            {day.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <h5 className="fw-bold">Time Slots</h5>
        {slotsByDay[selectedDay] && slotsByDay[selectedDay].length > 0 ? (
          <>
            {slotsByDay[selectedDay].map((slot, index) => (
              <span className="badge bg-danger text-white m-1 p-2 rounded-pill" key={index}>
                {slot.start} - {slot.end}
              </span>
            ))}
            <span className="text-primary ms-3" style={{ cursor: "pointer" }} onClick={handleEdit}>
              🖊️ Edit
            </span>
          </>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">Not Available</span>
            <span className="text-primary ms-3" style={{ cursor: "pointer" }} onClick={handleAddInitialSlot}>
              ➕ Add Slot
            </span>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-centered-custom">
            <div className="modal-content p-4">
              <h4 className="mb-4">{slotsByDay[selectedDay]?.length > 0 ? 'Edit' : 'Add'} Time Slots</h4>
              {editableSlots.map((slot, index) => (
                <div className="row mb-3" key={index}>
                  <div className="col">
                    <label>Start Time</label>
                    <input
                      type="text"
                      className="form-control"
                      value={slot.start}
                      onChange={(e) => handleSlotChange(index, "start", e.target.value)}
                    />
                  </div>
                  <div className="col">
                    <label>End Time</label>
                    <input
                      type="text"
                      className="form-control"
                      value={slot.end}
                      onChange={(e) => handleSlotChange(index, "end", e.target.value)}
                    />
                  </div>
                  <div className="col-auto d-flex align-items-end">
                    <button className="btn btn-danger" onClick={() => handleRemoveSlot(index)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              <div>
                <button className="btn btn-link text-primary mb-3" onClick={handleAddSlot}>
                  ➕ Add More
                </button>
              </div>
              <div className="text-center">
                <button className="btn btn-success" onClick={handleSaveChanges}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleTimings;
