import React from "react";
import { Outlet } from "react-router-dom";
import "../index.css";
import Sidebar from "./DoctorSidebar"; 

function DoctorLayout() {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="dashboard-main main-content">
        <Outlet /> {/* Renders the child route here */}
      </div>
    </div>
  );
}

export default DoctorLayout;
