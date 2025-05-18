import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomNavbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import "bootstrap/dist/css/bootstrap.min.css";

// Auth Pages
import Login from "./pages/Login.jsx";
import Signup from "./pages/SignUp.jsx";

// Doctor Pages
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorLayout from "./components/DoctorLayout";
import Appointments from "./pages/Doctor/Appointments";
import MyPatients from "./pages/Doctor/MyPatients";
import DoctorAnalytics from "./pages/Doctor/DoctorAnalytics";
import ScheduleTiming from "./pages/Doctor/ScheduleTiming";
import Invoices from "./pages/Doctor/Invoices.jsx";
import ProfileSettings from "./pages/Doctor/ProfileSettings";

// Patient Pages
import PatientLayout from "./components/PatientLayout";
import Dashboard from "./pages/Patient/PatientDashboard";
import MedicalRecords from "./pages/Patient/MedicalRecords";
import Booking from "./pages/Patient/Booking";
import Checkout from "./pages/Patient/Checkout";
import SearchDoctors from "./pages/Patient/SearchDoctors";

// Admin Page
import AdminDashboard from "./pages/Admin/AdminDashboard";

// 🔒 Role-based protection
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <CustomNavbar />
        <div className="flex-grow-1">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HeroSection />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Admin Route (Protected) */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />

              {/* Doctor Routes (Protected) */}
              <Route
                path="/doctors"
                element={
                  <PrivateRoute allowedRoles={["doctor"]}>
                    <DoctorLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<DoctorDashboard />} />
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="patients" element={<MyPatients />} />
                <Route path="analytics" element={<DoctorAnalytics />} />
                <Route path="scheduleTiming" element={<ScheduleTiming />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="settings" element={<ProfileSettings />} />
              </Route>

              {/* Patient Routes (Protected) */}
              <Route
                path="/patient"
                element={
                  <PrivateRoute allowedRoles={["patient"]}>
                    <PatientLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="booking" element={<Booking />} />
                <Route path="medicalrecords" element={<MedicalRecords />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="profile-settings" element={<ProfileSettings />} />
                <Route path="search-doctors" element={<SearchDoctors />} />
              </Route>
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
