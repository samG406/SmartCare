import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaDribbble, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "../index.css";

function Footer() {
  return (
    <footer className="footer-section text-white pt-5 pb-3">
      <Container>
        <Row>
          <Col md={3}>
            <h3 className="fw-bold">SMARTCARE</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="d-flex gap-3">
              <FaFacebookF />
              <FaTwitter />
              <FaLinkedinIn />
              <FaInstagram />
              <FaDribbble />
            </div>
          </Col>

          <Col md={3}>
            <h5 className="fw-bold">For Patients</h5>
            <ul className="list-unstyled">
              <li>» Search for Doctors</li>
              <li>» Login</li>
              <li>» Register</li>
              <li>» Booking</li>
              <li>» Patient Dashboard</li>
            </ul>
          </Col>

          <Col md={3}>
            <h5 className="fw-bold">For Doctors</h5>
            <ul className="list-unstyled">
              <li>» Appointments</li>
              <li>» Login</li>
              <li>» Register</li>
              <li>» Doctor Dashboard</li>
            </ul>
          </Col>

          <Col md={3}>
            <h5 className="fw-bold">Contact Us</h5>
            <ul className="list-unstyled">
              <li><FaMapMarkerAlt className="me-2" /> Long Island university, Brooklyn</li>
              <li><FaPhoneAlt className="me-2" /> +1 000 000 0000</li>
              <li><FaEnvelope className="me-2" /> smartcare@example.com</li>
            </ul>
          </Col>
        </Row>

        <Row className="pt-3 mt-4 border-top border-light justify-content-between">
          <Col md={6} className="text-end">
            <span>Terms and Conditions</span> | <span>Policy</span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
