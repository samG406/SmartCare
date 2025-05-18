import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, InputGroup } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';

function Signup() {
  const [form, setForm] = useState({
    name: "",          // ✅ updated from full_name to name
    email: "",
    password: "",
    role: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:7070/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.message && data.message.toLowerCase().includes("already registered")) {
          setError("User is already registered. Please login or use a different email.");
        } else {
          setError(data.message || "Registration failed");
        }
        return;
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh", paddingTop: "60px" }}>
      <h2 className="text-center text-success">Sign Up</h2>
      <Form className="w-50 mx-auto" onSubmit={handleSubmit}>
        <Form.Group controlId="name">
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="email" className="mt-3">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="password" className="mt-3">
          <Form.Label>Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="role" className="mt-3">
          <Form.Label>Role</Form.Label>
          <Form.Select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>

        {error && <div className="text-danger mt-3">{error}</div>}
        {success && <div className="text-success mt-3">{success}</div>}

        <Button variant="success" type="submit" className="mt-4 w-100">
          Sign Up
        </Button>

        <p className="mt-3 text-center">
          Already have an account? <Link to="/login" className="text-success">Login</Link>
        </p>
      </Form>
    </Container>
  );
}

export default Signup;
