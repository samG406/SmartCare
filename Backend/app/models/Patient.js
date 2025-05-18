module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define("Patient", {
    patient_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
    },
    gender: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    }
  }, {
    tableName: 'Patients',   // Important! match exact DB table name
    timestamps: false        // Important! because your table has no updatedAt/createdAt automatically
  });

  return Patient;
};
