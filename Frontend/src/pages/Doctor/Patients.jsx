import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../index.css";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // 👈 new

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get("http://localhost:7070/api/patients"); 
        setPatients(response.data);
      } catch (error) {
        console.error("Failed to fetch patients:", error.message);
      }
      setLoading(false);
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4">My Patients</h3>

      {/* Search Bar */}
      <div className="hero-searchbar mb-4">
        <input
          type="text"
          placeholder="Search patients by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button disabled>
          <i className="fas fa-search"></i>
        </button>
      </div>

      <div className="row g-4">
        {filteredPatients.length === 0 ? (
          <div className="text-center">
            <p className="text-muted">No patients found.</p>
          </div>
        ) : (
          filteredPatients.map((patient, index) => (
            <div className="col-md-4" key={index}>
              <div className="card shadow-sm p-3 h-100 card-hover">
                <div className="text-center">
                  <img
                    src={patient.image || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                    alt={patient.name}
                    className="rounded-circle mb-3"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                  <h5 className="fw-bold">{patient.name}</h5>
                  <p className="text-muted mb-1">
                    <strong>Patient ID:</strong> {patient.id}
                  </p>
                  <p className="text-muted">
                    <i className="fas fa-map-marker-alt me-1"></i>
                    {patient.location}
                  </p>
                  <p className="text-muted">
                    📞 {patient.phone}
                  </p>
                  <p className="text-muted">
                    📧 {patient.email}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Patients;
