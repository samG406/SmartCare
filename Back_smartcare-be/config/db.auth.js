require("dotenv").config();

const mysql = require("mysql2");

// Debug: Check if .env is being loaded
console.log("DEBUG - Environment variables:");
console.log("  DB_HOST:", process.env.DB_HOST || "NOT SET (using default)");
console.log("  DB_USER:", process.env.DB_USER || "NOT SET (using default)");
console.log("  DB_PASSWORD:", process.env.DB_PASSWORD ? "***SET*** (length: " + process.env.DB_PASSWORD.length + ")" : "NOT SET (using default empty)");
console.log("  DB_NAME:", process.env.DB_NAME || "NOT SET (using default)");
console.log("  DB_PORT:", process.env.DB_PORT || "NOT SET (using default)");

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "smarthealthcare",
  port: parseInt(process.env.DB_PORT || "3306"),
  connectTimeout: 60000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  reconnect: true,
};

const isAWSRDS = dbConfig.host.includes('.rds.amazonaws.com') || dbConfig.host.includes('.rds.');
const shouldUseSSL = process.env.DB_USE_SSL === 'true' || 
                     process.env.NODE_ENV === 'production' || 
                     isAWSRDS;

if (shouldUseSSL) {
  dbConfig.ssl = {
    rejectUnauthorized: false
  };
  console.log("SSL enabled for database connection");
} else {
  console.log("SSL disabled for database connection (dev mode)");
}

console.log("Database Connection Config:");
console.log("   Host:", dbConfig.host);
console.log("   Port:", dbConfig.port);
console.log("   Database:", dbConfig.database);
console.log("   User:", dbConfig.user);
console.log("   SSL:", shouldUseSSL ? "Enabled" : "Disabled");

const db = mysql.createPool(dbConfig);

db.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL Pool Connection Error:", err.message);
    console.error("Error Code:", err.code);
    console.error("Hostname:", dbConfig.host);
    
    if (err.code === 'ENOTFOUND' || err.message.includes('getaddrinfo ENOTFOUND')) {
      console.error("\nDNS Resolution Failed!");
      console.error("   The database hostname cannot be resolved.");
      console.error("   Possible causes:");
      console.error("   1. Database server is not running");
      console.error("   2. Incorrect hostname in DB_HOST environment variable");
      console.error("   3. Network/DNS issues");
      console.error("\n   To fix:");
      console.error("   1. Check your .env file has correct DB_HOST");
      console.error("   2. Verify MySQL server is running");
      console.error("   3. Check database credentials\n");
    }
  } else {
    console.log("MySQL Connection Pool Created Successfully!");
    console.log("   Connected to:", dbConfig.host + ":" + dbConfig.port);
    console.log("   Database:", dbConfig.database);
    connection.release();
  }
});

db.on('error', (err) => {
  console.error('Database Pool Error:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Connection lost, pool will automatically reconnect...');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('Database connection refused. Check if database is running.');
  } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('Database access denied. Check credentials.');
  } else if (err.code === 'ENOTFOUND' || err.message.includes('getaddrinfo ENOTFOUND')) {
    console.error('DNS Resolution Failed - Cannot find database hostname:', dbConfig.host);
    console.error('   Please verify DB_HOST environment variable is set correctly.');
  } else {
    console.error('Unexpected database error:', err);
  }
});

process.on('SIGINT', () => {
  console.log('\nShutting down database pool...');
  db.end((err) => {
    if (err) {
      console.error('Error closing database pool:', err);
    } else {
      console.log('Database pool closed successfully');
    }
    process.exit(0);
  });
});

module.exports = db;
