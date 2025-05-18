import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { FaPrint } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../index.css";

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tab, setTab] = useState("appointments");

  // Booking modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    // Dummy appointment data (can be replaced by GET request later)
    setAppointments([
      {
        doctor: {
          name: "Dr. Ruby Perrin",
          specialty: "Dental",
          image: "/doctor-thumb-01.jpg",
        },
        apptDate: "14 Nov 2024",
        apptTime: "10.00 AM",
        bookingDate: "12 Nov 2024",
        amount: "$160",
        followUp: "16 Nov 2024",
        status: "Confirm",
      },
      {
        doctor: {
          name: "Dr. Darren Elder",
          specialty: "Dental",
          image: "/doctor-thumb-02.jpg",
        },
        apptDate: "12 Nov 2024",
        apptTime: "8.00 PM",
        bookingDate: "12 Nov 2024",
        amount: "$250",
        followUp: "14 Nov 2024",
        status: "Confirm",
      },
    ]);

    axios
      .get("http://localhost:7070/api/doctors")
      .then((res) => setDoctors(res.data))
      .catch(() => toast.error("Failed to fetch doctors"));
  }, []);

  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:7070/api/appointments", {
        doctor_id: selectedDoctor.doctor_id,
        patient_id: 1, // Replace with logged-in user's ID
        appointment_date: `${appointmentDate}T${appointmentTime}`,
        reason,
        status: "pending",
      });
      toast.success("Appointment booked successfully!");
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to book appointment");
    }
  };

  return (
    <div className="dashboard-content">
      <ToastContainer position="top-right" />
      <div className="appointment-tabs">
        <button
          className={`tab-btn ${tab === "appointments" ? "active" : ""}`}
          onClick={() => setTab("appointments")}
        >
          Appointments
        </button>
        <button
          className={`tab-btn ${tab === "doctors" ? "active" : ""}`}
          onClick={() => setTab("doctors")}
        >
          Search Doctors
        </button>
      </div>

      {tab === "appointments" && (
        <div className="appointments-table-wrapper">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Appt Date</th>
                <th>Booking Date</th>
                <th>Amount</th>
                <th>Follow Up</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt, index) => (
                <tr key={index}>
                  <td>
                    <div className="doctor-details">
                      <img src={appt.doctor.image} alt={appt.doctor.name} />
                      <div>
                        <h4>{appt.doctor.name}</h4>
                        <p>{appt.doctor.specialty}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="date">{appt.apptDate}</span>
                    <span className="time">{appt.apptTime}</span>
                  </td>
                  <td>{appt.bookingDate}</td>
                  <td>{appt.amount}</td>
                  <td>{appt.followUp}</td>
                  <td>
                    <span className={`status-badge ${appt.status.toLowerCase()}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td>
                    <button className="print-btn">
                      <FaPrint /> Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "doctors" && (
        <div className="doctor-cards d-flex flex-wrap gap-3 p-3">
          {doctors.map((doc) => (
            <div
              className="card shadow-sm p-3 rounded"
              style={{ minWidth: "250px" }}
              key={doc.doctor_id}
            >
              <h5>{doc.name}</h5>
              <p><strong>Specialization:</strong> {doc.specialization}</p>
              <p><strong>Email:</strong> {doc.email}</p>
              <p><strong>Phone:</strong> {doc.phone}</p>
              <p><strong>Address:</strong> {doc.address || "N/A"}</p>
              <button
                className="btn btn-primary mt-2"
                onClick={() => handleBookClick(doc)}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Appointment Date</label>
              <input
                type="date"
                className="form-control"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Time</label>
              <input
                type="time"
                className="form-control"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Reason</label>
              <textarea
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-success w-100">Submit</button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PatientDashboard;

