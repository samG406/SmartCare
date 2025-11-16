const mysql = require("mysql2");

// Use environment variables for production, fallback to hardcoded for development
// IMPORTANT: In production (AWS), these should be set as environment variables in Elastic Beanstalk
const dbConfig = {
  host: process.env.DB_HOST || "database1.czqu4w8gu097.us-east-2.rds.amazonaws.com",
  user: process.env.DB_USER || "samG0406",
  password: process.env.DB_PASSWORD || "18KU1a0406#",
  database: process.env.DB_NAME || "smarthealthcare",
  port: parseInt(process.env.DB_PORT || "3306"),
  connectTimeout: 60000,
  // Connection pool settings
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0, // Unlimited queue for pending connections
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Reconnection settings
  reconnect: true,
};

// Database configuration loaded

// Only add SSL config for AWS RDS (production)
if (process.env.DB_HOST || process.env.NODE_ENV === 'production') {
  dbConfig.ssl = {
    rejectUnauthorized: false // AWS RDS requires SSL but we don't need to verify certificate
  };
}

// Create connection pool instead of single connection
// This automatically handles connection lifecycle, reconnection, and connection management
const db = mysql.createPool(dbConfig);

// Test the pool connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Pool Connection Error:", err.message);
    console.error("Error Code:", err.code);
    console.error("Hostname:", dbConfig.host);
    
    // Provide helpful error messages
    if (err.code === 'ENOTFOUND' || err.message.includes('getaddrinfo ENOTFOUND')) {
      console.error("\n⚠️  DNS Resolution Failed!");
      console.error("   The database hostname cannot be resolved.");
      console.error("   Possible causes:");
      console.error("   1. RDS instance doesn't exist or was deleted");
      console.error("   2. Incorrect hostname in DB_HOST environment variable");
      console.error("   3. RDS instance is in a different region");
      console.error("   4. Network/DNS issues");
      console.error("\n   To fix:");
      console.error("   1. Go to AWS RDS Console");
      console.error("   2. Find your database instance");
      console.error("   3. Copy the 'Endpoint' (hostname)");
      console.error("   4. Set DB_HOST environment variable in Elastic Beanstalk");
      console.error("   5. Restart your application\n");
    }
    // Don't throw - let server start and retry connection
  } else {
    console.log("✅ MySQL Connection Pool Created Successfully!");
    console.log("Database:", dbConfig.database);
    console.log("Host:", dbConfig.host);
    // Release the test connection back to the pool
    connection.release();
  }
});

// Handle pool errors gracefully
db.on('error', (err) => {
  console.error('❌ Database Pool Error:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('⚠️ Connection lost, pool will automatically reconnect...');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('❌ Database connection refused. Check if database is running.');
  } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('❌ Database access denied. Check credentials.');
  } else if (err.code === 'ENOTFOUND' || err.message.includes('getaddrinfo ENOTFOUND')) {
    console.error('❌ DNS Resolution Failed - Cannot find database hostname:', dbConfig.host);
    console.error('   Please verify DB_HOST environment variable is set correctly in AWS Elastic Beanstalk.');
  } else {
    console.error('❌ Unexpected database error:', err);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down database pool...');
  db.end((err) => {
    if (err) {
      console.error('Error closing database pool:', err);
    } else {
      console.log('✅ Database pool closed successfully');
    }
    process.exit(0);
  });
});

module.exports = db;
