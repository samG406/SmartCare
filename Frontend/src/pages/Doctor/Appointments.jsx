import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import "../../index.css";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get("http://localhost:7070/api/appointments");
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error.message);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const endpoint = `http://localhost:7070/api/appointments/${id}/${action}`;
      await axios.post(endpoint);
      fetchAppointments();
    } catch (error) {
      console.error(`Failed to ${action} appointment:`, error.message);
      alert(`Failed to ${action} appointment.`);
    }
  };

  const todayDate = new Date().toISOString().slice(0, 10);

  const filteredAppointments = appointments
    .filter((appt) => {
      if (filter === "today") {
        return new Date(appt.appointment_date).toISOString().slice(0, 10) === todayDate;
      } else if (filter === "upcoming") {
        return new Date(appt.appointment_date) > new Date();
      }
      return true;
    })
    .filter((appt) =>
      (appt?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appt?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appt?.phone || "").includes(searchTerm)
    );

  const handlePatientClick = (appt) => {
    setSelectedPatient(appt);
    setShowModal(true);
  };

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4">Appointments</h3>

      {/* Search bar */}
      <div className="hero-searchbar mb-4">
        <input
          type="text"
          placeholder="Search patient by name, email, phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter buttons */}
      <div className="d-flex gap-2 mb-4">
        <button
          className={`btn ${filter === "all" ? "btn-info text-white" : "btn-light"}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`btn ${filter === "today" ? "btn-info text-white" : "btn-light"}`}
          onClick={() => setFilter("today")}
        >
          Today
        </button>
        <button
          className={`btn ${filter === "upcoming" ? "btn-info text-white" : "btn-light"}`}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </button>
      </div>

      {/* Appointments list */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center mt-5">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076505.png"
            alt="No Data"
            style={{ width: "120px", marginBottom: "10px" }}
          />
          <p className="text-muted">No appointments found.</p>
        </div>
      ) : (
        <div className="appointments-page">
          {filteredAppointments.map((appt, index) => (
            <div key={index} className="appointment-card">
              <img
                src={appt.image || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                alt={appt.name}
                className="patient-img"
              />
              <div className="appointment-details">
                <h5
                  style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline" }}
                  onClick={() => handlePatientClick(appt)}
                >
                  {appt.name}
                </h5>
                <p>Status:{" "}
                  <span style={{
                    color: appt.status === "accepted" ? "green" :
                           appt.status === "cancelled" ? "red" : "orange",
                    fontWeight: "bold",
                  }}>
                    {appt.status}
                  </span>
                </p>
                <p>📅 {appt.appointment_date}</p>
                <p>📍 {appt.location || "Unknown Location"}</p>
                <p>📧 {appt.email || "Unknown Email"}</p>
                <p>📞 {appt.phone || "Unknown Phone"}</p>
              </div>
              <div className="appointment-actions">
                <button
                  className="btn btn-outline-success btn-sm btn-animated"
                  onClick={() => handleAction(appt.appointment_id, "accept")}
                  disabled={appt.status === "accepted"}
                >
                  Accept
                </button>
                <button
                  className="btn btn-outline-danger btn-sm btn-animated"
                  onClick={() => handleAction(appt.appointment_id, "cancel")}
                  disabled={appt.status === "cancelled"}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Patient Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <>
              <p><strong>Name:</strong> {selectedPatient.name}</p>
              <p><strong>Email:</strong> {selectedPatient.email}</p>
              <p><strong>Phone:</strong> {selectedPatient.phone}</p>
              <p><strong>Location:</strong> {selectedPatient.location || "N/A"}</p>
              <p><strong>Status:</strong> {selectedPatient.status}</p>
              <p><strong>Date:</strong> {selectedPatient.appointment_date}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Appointments;
