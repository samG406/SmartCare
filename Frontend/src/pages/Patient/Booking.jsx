import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../index.css";

const Booking = () => {
  const navigate = useNavigate();
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
        date,
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

  const handleDateSelect = (date) => setSelectedDate(date);
  const handleTimeSelect = (time) => setSelectedTime(time);

  const handleProceedToCheckout = () => {
    if (selectedDate && selectedTime) {
      navigate('/checkout', {
        state: {
          doctorName: "Dr. Darren Elder",
          doctorLocation: "Newyork, USA",
          appointmentDate: selectedDate.date.toLocaleDateString(),
          appointmentTime: selectedTime,
          consultingFee: 100,
          bookingFee: 10,
          videoCall: 50,
          total: 160
        }
      });
    }
  };

  return (
    <div className="booking-page">
      {/* Doctor Info */}
      <div className="doctor-info">
        <img src="/doctor-thumb-02.jpg" alt="Dr. Darren Elder" className="doctor-image" />
        <div className="doctor-details">
          <h2>Dr. Darren Elder</h2>
          <div className="rating">★★★★☆ 35</div>
          <p className="location">Newyork, USA</p>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="calendar-section">
        <div className="date-slider">
          <button className="nav-button prev">‹</button>
          <div className="dates-container">
            {dates.map((dateObj, index) => (
              <div
                key={index}
                className={`date-card ${selectedDate === dateObj ? 'selected' : ''}`}
                onClick={() => handleDateSelect(dateObj)}
              >
                <span className="day-name">{dateObj.dayName}</span>
                <span className="day-number">{dateObj.dayNumber}</span>
                <span className="month">{dateObj.month} {dateObj.year}</span>
              </div>
            ))}
          </div>
          <button className="nav-button next">›</button>
        </div>

        {/* Time Slots */}
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

      {/* Proceed Button */}
      <div className="booking-footer">
        <button
          className={`proceed-button ${selectedDate && selectedTime ? 'active' : ''}`}
          disabled={!selectedDate || !selectedTime}
          onClick={handleProceedToCheckout}
        >
          Proceed to Pay
        </button>
      </div>
    </div>
  );
};

export default Booking;
