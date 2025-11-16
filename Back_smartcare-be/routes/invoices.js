const express = require("express");
const router = express.Router();

// Assuming you have a db connection object (e.g., from mysql2 or mysql)
const db = require("../config/db.auth"); // Adjust path as needed

// GET /api/invoices - fetch all invoices from the database
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      invoiceNumber AS invoiceNumber, 
      patientName AS patientName, 
      amount, 
      status, 
      dateIssued AS dateIssued 
    FROM invoices
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching invoices:", err);
      return res.status(500).json({ error: "Failed to fetch invoices" });
    }
    res.json(results);
  });
});

module.exports = router;
