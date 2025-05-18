import React from "react";
import "../../index.css";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaUsers, FaCalendarCheck, FaUserMd } from "react-icons/fa";

const AdminDashboard = () => {
  return (
    <Container className="pt-5 my-4">
      <h2 className="text-center mb-4">SmartCare Admin Dashboard</h2>
      <p className="text-center">Welcome to the SmartCare Admin Portal.</p>

      <Row className="justify-content-center mt-4">
        <Col md={4} className="mb-4">
          <Card className="text-center shadow-sm p-3">
            <Card.Body>
              <FaUsers size={32} className="mb-2 text-primary" />
              <Card.Title>Total Users</Card.Title>
              <Card.Text>120</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="text-center shadow-sm p-3">
            <Card.Body>
              <FaCalendarCheck size={32} className="mb-2 text-success" />
              <Card.Title>Appointments Today</Card.Title>
              <Card.Text>15</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="text-center shadow-sm p-3">
            <Card.Body>
              <FaUserMd size={32} className="mb-2 text-warning" />
              <Card.Title>Doctors Registered</Card.Title>
              <Card.Text>8</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
