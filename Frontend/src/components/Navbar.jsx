import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import logo from "../assets/SC-logo.png";

function CustomNavbar() {
  return (
    <Navbar expand="lg" fixed="top" className="custom-navbar">
      <Container>
        {/* ✅ Logo */}
        <Navbar.Brand as={Link} to="/">
          <img 
            src={logo} 
            alt="SmartCare Logo" 
            className="d-inline-block align-top logo"
          />
        </Navbar.Brand>

        {/* ✅ Toggle Button for Mobile */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* ✅ Navigation Links */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/" className="nav-link-custom m-2">Home</Nav.Link>
            
            {/* ✅ Doctors Dropdown */}
            <NavDropdown title="Doctors" id="doctors-dropdown" className="nav-dropdown nav-dropdown-link">
              <NavDropdown.Item as={Link} to="/doctors/dashboard">Doctors Dashboard</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/doctors/scheduleTiming">Schedule Timing</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/doctors/patients">Patients List</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/doctors/settings">Profile Settings</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/doctors/register">Doctor Register</NavDropdown.Item>
            </NavDropdown>

            {/* ✅ Patients Dropdown */}
            <NavDropdown title="Patients" id="patients-dropdown" className="nav-dropdown nav-dropdown-link">
            <NavDropdown.Item as={Link} to="/patient/dashboard">Patient Dashboard</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/patient/search-doctors">Search Doctors</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/patient/booking">Booking</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/patient/medicalrecords">Medical Records</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/patient/checkout">Checkout</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/patient/profile-settings">Profile Settings</NavDropdown.Item>
            </NavDropdown>


            {/* ✅ Admin Link with padding */}
            <Nav.Link as={Link} to="/admin" className="nav-link-custom m-2">Admin</Nav.Link>
          </Nav>

          {/* ✅ Emergency & Login/Signup */}
          <div className="d-flex align-items-center">
            <span className="text-danger fw-bold me-3">🚑 Emergency</span>
            <Link to="/login" className="btn btn-outline-success custom-login-btn">
                  Login / SignUp
            </Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
