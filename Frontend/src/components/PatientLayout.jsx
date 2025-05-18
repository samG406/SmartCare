import React from 'react';
import { Outlet } from 'react-router-dom';
import "../index.css";
import PatientSidebar from './PatientSidebar';

const PatientLayout = () => {
  return (
    <div className="dashboard-wrapper">
      <PatientSidebar />
      <div className="dashboard-main">
        <Outlet />
      </div>
    </div>
  );
};

export default PatientLayout; 