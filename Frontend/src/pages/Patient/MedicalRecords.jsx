import React, { useState } from 'react';
import { FaEye, FaPrint } from 'react-icons/fa';
import "../../index.css";

const MedicalRecords = () => {
  const [records] = useState([
    {
      id: '#MR-0010',
      date: '14 Nov 2024',
      description: 'Dental Filling',
      attachment: 'dental-test.pdf',
      doctor: {
        name: 'Dr. Ruby Perrin',
        specialty: 'Dental',
        image: '/doctor-thumb-01.jpg'
      }
    },
    {
      id: '#MR-0009',
      date: '13 Nov 2024',
      description: 'Teeth Cleaning',
      attachment: 'dental-test.pdf',
      doctor: {
        name: 'Dr. Darren Elder',
        specialty: 'Dental',
        image: '/doctor-thumb-02.jpg'
      }
    },
    {
      id: '#MR-0008',
      date: '12 Nov 2024',
      description: 'General Checkup',
      attachment: 'cardio-test.pdf',
      doctor: {
        name: 'Dr. Deborah Angel',
        specialty: 'Cardiology',
        image: '/doctor-thumb-03.jpg'
      }
    },
    {
      id: '#MR-0007',
      date: '11 Nov 2024',
      description: 'General Test',
      attachment: 'general-test.pdf',
      doctor: {
        name: 'Dr. Sofia Brient',
        specialty: 'Urology',
        image: '/doctor-thumb-04.jpg'
      }
    },
    {
      id: '#MR-0006',
      date: '10 Nov 2024',
      description: 'Eye Test',
      attachment: 'eye-test.pdf',
      doctor: {
        name: 'Dr. Marvin Campbell',
        specialty: 'Ophthalmology',
        image: '/doctor-thumb-05.jpg'
      }
    }
  ]);

  return (
    <div className="dashboard-content">

      {/* Medical Records Table */}
      <div className="medical-records-wrapper">
        <table className="medical-records-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Description</th>
              <th>Attachment</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index}>
                <td className="record-id">{record.id}</td>
                <td>{record.date}</td>
                <td>{record.description}</td>
                <td>{record.attachment}</td>
                <td>
                  <div className="doctor-details">
                    <img src={record.doctor.image} alt={record.doctor.name} />
                    <div>
                      <h2>{record.doctor.name}</h2>
                      <p>{record.doctor.specialty}</p>
                    </div>
                  </div>
                </td>
                <td className="action-buttons">
                  <button className="view-btn">
                    <FaEye /> View
                  </button>
                  <button className="print-btn">
                    <FaPrint /> Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicalRecords; 