import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../index.css";
import { Modal, Button } from "react-bootstrap";

const MyPatients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 6;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get("http://localhost:7070/api/patients");
        setPatients(response.data);
      } catch (error) {
        console.error("Failed to fetch patients:", error.message);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) =>
    (p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (p.address?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const handleCardClick = (patient) => setSelectedPatient(patient);
  const handleCloseModal = () => setSelectedPatient(null);

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">My Patients</h2>

      <input
        type="text"
        className="form-control mb-4"
        placeholder="Search by patient name or location..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      {currentPatients.length === 0 ? (
        <div className="text-center">
          <p>No patients found.</p>
        </div>
      ) : (
        <div className="row">
          {currentPatients.map((patient) => (
            <div
              key={patient.patient_id}
              className="col-md-4 mb-4"
              onClick={() => handleCardClick(patient)}
              style={{ cursor: "pointer" }}
            >
              <div className="card shadow-sm h-100">
                <div className="card-body text-center">
                  <img
                    src="https://via.placeholder.com/50"
                    alt={patient.name}
                    className="rounded-circle mb-3"
                  />
                  <h5 className="card-title">{patient.name}</h5>
                  <p><strong>Gender:</strong> {patient.gender || "N/A"}</p>
                  <p><strong>Phone:</strong> {patient.phone || "N/A"}</p>
                  <p><i className="bi bi-geo-alt"></i> {patient.address || "N/A"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Button
            variant="secondary"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="me-2"
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {selectedPatient && (
        <Modal show={true} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Patient Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Name:</strong> {selectedPatient.name}</p>
            <p><strong>Email:</strong> {selectedPatient.email || "N/A"}</p>
            <p><strong>Phone:</strong> {selectedPatient.phone || "N/A"}</p>
            <p><strong>Date of Birth:</strong> {selectedPatient.date_of_birth || "N/A"}</p>
            <p><strong>Gender:</strong> {selectedPatient.gender || "N/A"}</p>
            <p><strong>Address:</strong> {selectedPatient.address || "N/A"}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default MyPatients;
