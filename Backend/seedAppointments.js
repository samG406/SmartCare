const db = require("./app/models");
const Appointment = db.appointments;

const seed = async () => {
  await db.sequelize.sync(); // ensure DB is ready

  await Appointment.bulkCreate([
    {
      name: "John Doe",
      date: "2025-05-01",
      location: "NYC Clinic",
      email: "john@example.com",
      phone: "123-456-7890",
      image: "",
      status: "accepted"
    },
    {
      name: "Jane Smith",
      date: "2025-05-02",
      location: "LA Health Center",
      email: "jane@example.com",
      phone: "987-654-3210",
      image: "",
      status: "pending"
    },
    {
      name: "Sam Brown",
      date: "2025-05-03",
      location: "Texas Wellness",
      email: "sam@example.com",
      phone: "111-222-3333",
      image: "",
      status: "cancelled"
    },
    {
      name: "Lily Adams",
      date: "2025-05-04",
      location: "California Center",
      email: "lily@example.com",
      phone: "222-333-4444",
      image: "",
      status: "accepted"
    }
  ]);

  console.log("✅ Appointments with mixed statuses seeded successfully!");
  process.exit();
};

seed();
