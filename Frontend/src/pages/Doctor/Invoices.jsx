import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import jsPDF from "jspdf";
import "../../index.css";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const invoicesPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get("http://localhost:7070/api/invoices");
        setInvoices(response.data);
        setFilteredInvoices(response.data);
      } catch (error) {
        console.error("Failed to fetch invoices:", error.message);
      }
      setLoading(false);
    };

    fetchInvoices();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);
    const filtered = invoices.filter((inv) =>
      inv.patientName.toLowerCase().includes(value) ||
      inv.invoiceNumber.toLowerCase().includes(value)
    );
    setFilteredInvoices(filtered);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleDownloadInvoice = (invoice) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Invoice Details", 20, 20);

    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 40);
    doc.text(`Patient: ${invoice.patientName}`, 20, 50);
    doc.text(`Amount: $${invoice.amount.toFixed(2)}`, 20, 60);
    doc.text(`Status: ${invoice.status}`, 20, 70);
    doc.text(`Date Issued: ${new Date(invoice.dateIssued).toLocaleDateString()}`, 20, 80);

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  const startIndex = (currentPage - 1) * invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, startIndex + invoicesPerPage);
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4">Invoices</h3>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Patient Name or Invoice #"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {currentInvoices.length === 0 ? (
        <div className="text-center">
          <p className="text-muted">No invoices found.</p>
        </div>
      ) : (
        <div className="table-responsive bg-white p-4 rounded shadow-sm">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Patient</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date Issued</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.map((invoice, index) => (
                <tr key={index}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.patientName}</td>
                  <td>${invoice.amount.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${invoice.status === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>{new Date(invoice.dateIssued).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <button
                className="btn btn-light me-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </button>
              <span className="mt-2">{currentPage} / {totalPages}</span>
              <button
                className="btn btn-light ms-2"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Invoice View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Invoice Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice && (
            <>
              <p><strong>Invoice #:</strong> {selectedInvoice.invoiceNumber}</p>
              <p><strong>Patient:</strong> {selectedInvoice.patientName}</p>
              <p><strong>Amount:</strong> ${selectedInvoice.amount.toFixed(2)}</p>
              <p><strong>Status:</strong> {selectedInvoice.status}</p>
              <p><strong>Date Issued:</strong> {new Date(selectedInvoice.dateIssued).toLocaleDateString()}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

    </div>
  );
}

export default Invoices;
