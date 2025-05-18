import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button } from "react-bootstrap";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:7070/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("✅ [CLIENT] Login response:", data);

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        console.log("🧠 Stored user:", data.user);
        console.log("🧠 User role:", data.user?.role);

        // 🔁 Redirect based on role
        switch (data.user?.role) {
          case "doctor":
            navigate("/doctors/dashboard");
            break;
          case "patient":
            navigate("/patient/dashboard");
            break;
          case "admin":
            navigate("/admin");
            break;
          default:
            navigate("/");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Container
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <h2 className="text-center text-success">Login</h2>
      <Form className="w-50 mx-auto" onSubmit={handleSubmit}>
        <Form.Group controlId="email">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </Form.Group>

        <Form.Group controlId="password" className="mt-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </Form.Group>

        {error && <div className="text-danger mt-3">{error}</div>}

        <Button variant="success" type="submit" className="mt-4 w-100">
          Login
        </Button>

        <p className="mt-3 text-center">
          New user?{" "}
          <Link to="/signup" className="text-success">
            Sign up
          </Link>
        </p>
      </Form>
    </Container>
  );
}

export default Login;
