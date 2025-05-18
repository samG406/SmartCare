const express = require("express");
const router = express.Router();

// Dummy Invoice Data
const dummyInvoices = [
  {
    invoiceNumber: "INV-1001",
    patientName: "John Doe",
    amount: 250.0,
    status: "paid",
    dateIssued: "2025-04-25",
  },
  {
    invoiceNumber: "INV-1002",
    patientName: "Jane Smith",
    amount: 180.0,
    status: "pending",
    dateIssued: "2025-04-26",
  },
];

router.get("/", (req, res) => {
  res.json(dummyInvoices);
});

module.exports = router;
