const mysql = require("mysql2");

// Use environment variables for production, fallback to hardcoded for development
const dbConfig = {
  host: process.env.DB_HOST || "database-1.czqu4w8gu097.us-east-2.rds.amazonaws.com",
  user: process.env.DB_USER || "samG0406",
  password: process.env.DB_PASSWORD || "18KU1a0406#",
  database: process.env.DB_NAME || "smarthealthcare",
  port: parseInt(process.env.DB_PORT || "3306"),
  connectTimeout: 60000,
};

// Only add SSL config for AWS RDS (production)
if (process.env.DB_HOST || process.env.NODE_ENV === 'production') {
  dbConfig.ssl = {
    rejectUnauthorized: false // AWS RDS requires SSL but we don't need to verify certificate
  };
}

const db = mysql.createConnection(dbConfig);

// Connect asynchronously - don't block server startup
// This allows the server to start even if DB connection fails initially
setTimeout(() => {
  db.connect((err) => {
    if (err) {
      console.error("❌ MySQL Connection Error:", err.message);
      console.error("Error Code:", err.code);
      console.error("Hostname:", dbConfig.host);
      console.error("\n💡 Troubleshooting Steps:");
      console.error("1. Verify Elastic Beanstalk and RDS are in the SAME VPC");
      console.error("2. Check AWS RDS Security Group - allow inbound MySQL (port 3306) from Elastic Beanstalk security group");
      console.error("3. Verify database credentials in Elastic Beanstalk environment variables");
      console.error("4. Check if RDS endpoint is correct:", dbConfig.host);
      console.error("5. Verify RDS instance is running and publicly accessible if needed");
      // Don't throw - let server start and retry connection
    } else {
      console.log("✅ MySQL Connected to AWS RDS!");
      console.log("Database:", dbConfig.database);
    }
  });
}, 1000); // Wait 1 second before attempting connection

// Handle connection errors gracefully
db.on('error', (err) => {
  console.error('Database connection error:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect to database...');
    setTimeout(() => db.connect(), 5000); // Retry after 5 seconds
  }
});

module.exports = db;
