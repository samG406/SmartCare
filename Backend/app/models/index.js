const dbConfig = require("../config/db.config.js");
const { Sequelize, DataTypes } = require("sequelize");

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: dbConfig.pool,
});

// Test connection
sequelize
  .authenticate()
  .then(() => console.log("✅ Connected to MySQL database using Sequelize"))
  .catch((err) => console.error("❌ Unable to connect:", err));

// Initialize DB object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ✅ Correctly Load Models
db.user = require("./user.model.js")(sequelize, DataTypes);
db.appointments = require("./appointment.model.js")(sequelize, DataTypes);
// db.invoice = require("./invoice.model.js")(sequelize, DataTypes);  // (optional later)
db.patients = require("./Patient.js")(sequelize, DataTypes);  // ✅ IMPORTANT: patients (plural)
db.doctors = require("./doctor.model.js")(sequelize, DataTypes); // ✅ 
module.exports = db;
