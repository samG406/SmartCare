import React from "react";
import { Link } from "react-router-dom";
import { Container, Form, Button } from "react-bootstrap";

function Signup() {
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh", paddingTop: "60px" }}>
      <h2 className="text-center text-success">Sign Up</h2>
      <Form className="w-50 mx-auto">
        <Form.Group controlId="name">
          <Form.Label>Full Name</Form.Label>
          <Form.Control type="text" placeholder="Enter name" />
        </Form.Group>

        <Form.Group controlId="email" className="mt-3">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" placeholder="Enter email" />
        </Form.Group>

        <Form.Group controlId="password" className="mt-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Enter password" />
        </Form.Group>

        <Button variant="success" className="mt-4 w-100">Sign Up</Button>

        <p className="mt-3 text-center">
          Already have an account? <Link to="/login" className="text-success">Login</Link>
        </p>
      </Form>
    </Container>
  );
}

export default Signup;
