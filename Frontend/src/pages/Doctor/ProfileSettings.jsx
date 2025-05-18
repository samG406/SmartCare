import React, { useState } from "react";
import "../../index.css";  

function ProfileSettings() {
  const [pricingType, setPricingType] = useState("free");
  const [customPrice, setCustomPrice] = useState("");
  const [services, setServices] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [newService, setNewService] = useState("");
  const [newSpecialization, setNewSpecialization] = useState("");
  const [education, setEducation] = useState([
    { degree: "", institute: "", year: "" }
  ]);

  const handleAddService = (e) => {
    if (e.key === "Enter" && newService.trim() !== "") {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  const handleAddSpecialization = (e) => {
    if (e.key === "Enter" && newSpecialization.trim() !== "") {
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization("");
    }
  };

  const removeService = (index) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
  };

  const removeSpecialization = (index) => {
    const updated = specializations.filter((_, i) => i !== index);
    setSpecializations(updated);
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const handleAddEducation = () => {
    setEducation([...education, { degree: "", institute: "", year: "" }]);
  };

  return (
    <div className="container mt-4">
      {/* Basic Info */}
      <div className="card mb-4 p-4">
        <h5>Basic Information</h5>
        <div className="row align-items-center mb-3">
          <div className="col-md-2">
            <img src="/images/doctor.jpg" alt="profile" className="img-fluid rounded" />
          </div>
          <div className="col-md-4">
            <button className="btn btn-info text-white">Upload Photo</button>
            <p className="small">Allowed JPG, GIF or PNG. Max size of 2MB</p>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Username *</label>
            <input type="text" className="form-control" disabled />
          </div>
          <div className="col-md-6">
            <label>Email *</label>
            <input type="email" className="form-control" disabled />
          </div>
          <div className="col-md-6 mt-3">
            <label>First Name *</label>
            <input type="text" className="form-control" />
          </div>
          <div className="col-md-6 mt-3">
            <label>Last Name *</label>
            <input type="text" className="form-control" />
          </div>
          <div className="col-md-6 mt-3">
            <label>Phone Number</label>
            <input type="text" className="form-control" />
          </div>
          <div className="col-md-6 mt-3">
            <label>Gender</label>
            <select className="form-control">
              <option>Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Others</option>
            </select>
          </div>
          <div className="col-md-6 mt-3">
            <label>Date of Birth</label>
            <input type="date" className="form-control" />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="card mb-4 p-4">
        <h5>Pricing</h5>
        <div className="form-check form-check-inline">
          <input
            type="radio"
            className="form-check-input"
            name="pricing"
            checked={pricingType === "free"}
            onChange={() => setPricingType("free")}
          />
          <label className="form-check-label">Free</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            type="radio"
            className="form-check-input"
            name="pricing"
            checked={pricingType === "custom"}
            onChange={() => setPricingType("custom")}
          />
          <label className="form-check-label">Custom Price (per hour)</label>
        </div>
        {pricingType === "custom" && (
          <div className="mt-2">
            <input
              type="text"
              className="form-control"
              placeholder="20"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
            />
            <small className="text-muted">Custom price you can add</small>
          </div>
        )}
      </div>

      {/* Services and Specializations */}
      <div className="card mb-4 p-4">
        <h5>Services and Specialization</h5>

        {/* Services */}
        <div className="mb-3">
          <label>Services</label>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {services.map((srv, index) => (
              <span key={index} className="badge bg-info text-white p-2">
                {srv} <span onClick={() => removeService(index)} style={{ cursor: "pointer" }}>x</span>
              </span>
            ))}
            <input
              className="form-control border-0"
              style={{ minWidth: "200px" }}
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={handleAddService}
              placeholder="Enter Services"
            />
          </div>
          <small className="text-muted">Note : Type & Press enter to add new services</small>
        </div>

        {/* Specializations */}
        <div>
          <label>Specialization</label>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {specializations.map((spec, index) => (
              <span key={index} className="badge bg-info text-white p-2">
                {spec} <span onClick={() => removeSpecialization(index)} style={{ cursor: "pointer" }}>x</span>
              </span>
            ))}
            <input
              className="form-control border-0"
              style={{ minWidth: "200px" }}
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              onKeyDown={handleAddSpecialization}
              placeholder="Enter Specialization"
            />
          </div>
          <small className="text-muted">Note : Type & Press enter to add new specialization</small>
        </div>
      </div>

      {/* Education Section */}
      <div className="card mb-4 p-4">
        <h5>Education</h5>
        {education.map((entry, index) => (
          <div key={index} className="row mb-3">
            <div className="col-md-4">
              <label>Degree</label>
              <input
                type="text"
                className="form-control"
                value={entry.degree}
                onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label>College/Institute</label>
              <input
                type="text"
                className="form-control"
                value={entry.institute}
                onChange={(e) => handleEducationChange(index, "institute", e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label>Year of Completion</label>
              <input
                type="text"
                className="form-control"
                value={entry.year}
                onChange={(e) => handleEducationChange(index, "year", e.target.value)}
              />
            </div>
          </div>
        ))}
        <button className="btn btn-outline-primary" onClick={handleAddEducation}>+ Add More</button>
      </div>
    </div>
  );
}

export default ProfileSettings;
