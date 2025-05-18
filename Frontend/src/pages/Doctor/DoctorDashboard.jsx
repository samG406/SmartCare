import React, { useEffect, useState } from "react";
import axios from "axios";
import CountUp from "react-countup";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../index.css";

function DoctorDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    accepted: 0,
    pending: 0,
    cancelled: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState("upcoming");

  const appointmentsPerPage = 5;
  const COLORS = ["#00C49F", "#FFBB28", "#FF4444"];
  const todayDate = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get(
          "http://localhost:7070/api/appointments/stats"
        );
        const appointmentsRes = await axios.get(
          "http://localhost:7070/api/appointments"
        );

        setStats(statsRes.data);
        setAppointments(appointmentsRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error.message);
        toast.error("Failed to load dashboard data");
      }
      setLoading(false);
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAction = async (id, action) => {
    try {
      await axios.post(`http://localhost:7070/api/appointments/${id}/${action}`);
      toast.success(`Appointment ${action}ed successfully!`);
      const updatedAppointments = await axios.get("http://localhost:7070/api/appointments");
      setAppointments(updatedAppointments.data);
    } catch (error) {
      console.error(`Failed to ${action} appointment:`, error.message);
      toast.error(`Failed to ${action} appointment.`);
    }
  };

  const handlePatientClick = (appt) => {
    setSelectedPatient(appt);
    setShowModal(true);
  };

  const filteredAppointments = appointments
    .filter((appt) => {
      const apptDate = new Date(appt.appointment_date);
      const formattedDate = apptDate.toISOString().slice(0, 10);

      if (filterMode === "today") {
        return formattedDate === todayDate;
      } else {
        return formattedDate > todayDate;
      }
    })
    .filter((appt) =>
      (appt.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appt.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appt.location || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );

  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4">Dashboard</h3>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Analytics Section */}
      <div className="row mb-5">
        <div className="col-md-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Accepted", value: stats.accepted },
                  { name: "Pending", value: stats.pending },
                  { name: "Cancelled", value: stats.cancelled },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Section */}
      <div className="row mb-4">
        {[
          { title: "Total Patients", value: stats.total, color: "text-danger" },
          { title: "Today Patients", value: stats.today, color: "text-success" },
          {
            title: "Appointments",
            value: stats.accepted + stats.pending + stats.cancelled,
            color: "text-primary",
          },
        ].map((item, index) => (
          <div className="col-md-4 mb-3" key={index}>
            <div className="border rounded shadow-sm p-4 text-center card-hover">
              <h6>{item.title}</h6>
              <h2 className={item.color}>
                <CountUp end={item.value} duration={1.5} />
              </h2>
              <p className="text-muted">
                {item.title === "Today Patients"
                  ? new Date().toLocaleDateString()
                  : "Till Today"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Table Section */}
      <div className="bg-white rounded shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Patient Appointments</h4>
          <div>
            <button
              className={`btn me-2 ${filterMode === "upcoming" ? "btn-info text-white" : "btn-light"}`}
              onClick={() => {
                setFilterMode("upcoming");
                setCurrentPage(1);
              }}
            >
              Upcoming
            </button>
            <button
              className={`btn ${filterMode === "today" ? "btn-info text-white" : "btn-light"}`}
              onClick={() => {
                setFilterMode("today");
                setCurrentPage(1);
              }}
            >
              Today
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search patients by name, email or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <table className="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Appt Date</th>
              <th>Location</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-5">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/4076/4076505.png"
                    alt="No Data"
                    style={{ width: "120px", marginBottom: "10px" }}
                  />
                  <p className="text-muted">No appointments found.</p>
                </td>
              </tr>
            ) : (
              currentAppointments.map((appt, index) => {
                const apptDate = new Date(appt.appointment_date);
                const isToday =
                  apptDate.toISOString().slice(0, 10) === todayDate;

                return (
                  <tr key={index} className={isToday ? "today-row" : ""}>
                    <td>
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                        alt="Patient"
                        className="rounded-circle me-2"
                        style={{
                          width: "30px",
                          height: "30px",
                          objectFit: "cover",
                        }}
                      />
                      <span
                        style={{
                          cursor: "pointer",
                          color: "#007bff",
                          textDecoration: "underline",
                        }}
                        onClick={() => handlePatientClick(appt)}
                      >
                        {appt.name}
                      </span>
                    </td>
                    <td>{appt.appointment_date}</td>
                    <td>{appt.location}</td>
                    <td>{appt.email}</td>
                    <td>{appt.phone}</td>
                    <td>
                      <span
                        className={`badge ${
                          appt.status === "accepted"
                            ? "bg-success"
                            : appt.status === "pending"
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-success btn-sm me-2 btn-animated"
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-outline-primary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <small>
              Page {currentPage} of {totalPages}
            </small>
            <button
              className="btn btn-outline-primary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Patient Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <>
              <p>
                <strong>Name:</strong> {selectedPatient.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedPatient.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedPatient.phone}
              </p>
              <p>
                <strong>Location:</strong> {selectedPatient.location}
              </p>
              <p>
                <strong>Status:</strong> {selectedPatient.status}
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default DoctorDashboard;
