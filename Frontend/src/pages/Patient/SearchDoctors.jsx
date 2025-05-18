import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import "../../index.css";

const SearchDoctors = () => {
  const [doctors] = useState([
    {
      id: 1,
      name: "Dr. John Doe",
      specialization: "General Physician",
      email: "john.doe@hospital.com",
      phone: "1112223333"
    },
    {
      id: 2,
      name: "Dr. Smith",
      specialization: "Cardiology",
      email: "dr.smith@hospital.com",
      phone: "123-456-7890"
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");

  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Booked with ${selectedDoctor.name} on ${appointmentDate}`);
    setShowModal(false);
  };

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4">Search Doctors</h3>

      {doctors.map((doctor) => (
        <div key={doctor.id} className="card p-3 mb-3 shadow-sm">
          <h5>{doctor.name}</h5>
          <p><strong>Specialization:</strong> {doctor.specialization}</p>
          <p><strong>Email:</strong> {doctor.email}</p>
          <p><strong>Phone:</strong> {doctor.phone}</p>
          <Button variant="primary" onClick={() => handleBookClick(doctor)}>
            Book Appointment
          </Button>
        </div>
      ))}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoctor && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Doctor</Form.Label>
                <Form.Control type="text" readOnly value={selectedDoctor.name} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Select Date</Form.Label>
                <Form.Control
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </Form.Group>
              <Button type="submit" variant="success">
                Confirm Booking
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SearchDoctors;
