module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define("appointments", {
    appointment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patient_id: {
      type: DataTypes.INTEGER
    },
    doctor_id: {
      type: DataTypes.INTEGER
    },
    appointment_date: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.STRING
    },
    reason: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: false   // ✅ Important: tells Sequelize no createdAt, updatedAt
  });

  return Appointment;
};
