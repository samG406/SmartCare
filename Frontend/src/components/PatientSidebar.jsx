import React from 'react';
import { NavLink } from 'react-router-dom';
import "../index.css";
import { FaTachometerAlt, FaCalendarCheck, FaFileAlt, FaShoppingCart, FaCog } from 'react-icons/fa';

const PatientSidebar = () => {
  const [patientData] = React.useState({
    name: 'Richard Wilson',
    age: '38 years',
    location: 'Newyork, USA',
  });

  return (
    <div className="dashboard-sidebar sidebar">
      <div className="text-center p-4">
        <h5>{patientData.name}</h5>
        <p className="text-white-50">{patientData.age}, {patientData.location}</p>
      </div>

      <ul className="nav-links px-3">
        <li className="py-2">
          <NavLink to="/patient/dashboard" activeClassName="active">
            <FaTachometerAlt className="me-2" /> Dashboard
          </NavLink>
        </li>
        <li className="py-2">
          <NavLink to="/patient/booking" activeClassName="active">
            <FaCalendarCheck className="me-2" /> Booking
          </NavLink>
        </li>
        <li className="py-2">
          <NavLink to="/patient/medicalrecords" activeClassName="active">
            <FaFileAlt className="me-2" /> Medical Records
          </NavLink>
        </li>
        <li className="py-2">
          <NavLink to="/patient/checkout" activeClassName="active">
            <FaShoppingCart className="me-2" /> Checkout
          </NavLink>
        </li>
        <li className="py-2">
          <NavLink to="/patient/profile-settings" activeClassName="active">
            <FaCog className="me-2" /> Profile Settings
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default PatientSidebar;
