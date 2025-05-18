import React, { useState } from 'react';
import "../../index.css";

const BookAppointment = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Generate dates for the next 7 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        year: date.getFullYear()
      });
    }
    return dates;
  };

  // Generate time slots from 9 AM to 6 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const dates = generateDates();
  const timeSlots = generateTimeSlots();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  return (
    <div className="booking-page">
      <div className="doctor-info">
        <img src="/doctor-thumb-02.jpg" alt="Dr. Darren Elder" className="doctor-image" />
        <div className="doctor-details">
          <h2>Dr. Darren Elder</h2>
          <div className="rating">
            ★★★★☆ 35
          </div>
          <p className="location">Newyork, USA</p>
        </div>
      </div>

      <div className="calendar-section">
        <div className="date-slider">
          <button className="nav-button prev">‹</button>
          <div className="dates-container">
            {dates.map((date, index) => (
              <div
                key={index}
                className={`date-card ${selectedDate === date ? 'selected' : ''}`}
                onClick={() => handleDateSelect(date)}
              >
                <span className="day-name">{date.dayName}</span>
                <span className="day-number">{date.dayNumber}</span>
                <span className="month">{date.month} {date.year}</span>
              </div>
            ))}
          </div>
          <button className="nav-button next">›</button>
        </div>

        <div className="time-slots">
          {timeSlots.map((time, index) => (
            <button
              key={index}
              className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
              onClick={() => handleTimeSelect(time)}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <div className="booking-footer">
        <button 
          className={`proceed-button ${selectedDate && selectedTime ? 'active' : ''}`}
          disabled={!selectedDate || !selectedTime}
        >
          Proceed to Pay
        </button>
      </div>
    </div>
  );
};

export default BookAppointment; 