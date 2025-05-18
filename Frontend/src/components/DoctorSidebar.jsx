import React from "react";
import { NavLink } from "react-router-dom";
import "../index.css";
import { FaClock, FaCalendarAlt, FaCog, FaUsers, FaFileInvoiceDollar, FaHome } from "react-icons/fa";

function DoctorSidebar() {
  return (
    <div className="dashboard-sidebar sidebar">
      <div className="text-center p-4">
        <h5>Dr. Darren Elder</h5>
        <p className="text-white-50">BDS, MDS - Oral & Maxillofacial Surgery</p>
      </div>

      <ul className="nav-links px-3">
        <li className="py-2">
          <NavLink to="/doctors/dashboard" activeClassName="active">
            <FaHome className="me-2" /> Dashboard
          </NavLink>
        </li>
        <li className="py-2">
          <NavLink to="/doctors/appointments" activeClassName="active">
            <FaCalendarAlt className="me-2" /> Appointments
          </NavLink>
        </li>
        <li className="py-2">
          <NavLink to="/doctors/patients" activeClassName="active">
            <FaUsers className="me-2" /> My Patients
          </NavLink>
        </li>
        <li className="py-2">
          <NavLink to="/doctors/scheduleTiming" activeClassName="active">
            <FaClock className="me-2" /> Schedule Timings
          </NavLink>
        </li>
        <li className="py-2">
          <NavLink to="/doctors/invoices" activeClassName="active">
            <FaFileInvoiceDollar className="me-2" /> Invoices
          </NavLink>
        </li>
        <li className="py-2">
          <NavLink to="/doctors/settings" activeClassName="active">
            <FaCog className="me-2" /> Profile Settings
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default DoctorSidebar;