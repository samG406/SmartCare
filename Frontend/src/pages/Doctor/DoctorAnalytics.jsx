import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF4C4C"];

function DoctorAnalytics() {
  const [stats, setStats] = useState({ accepted: 0, pending: 0, cancelled: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:7070/api/appointments/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics stats:", error.message);
      }
    };

    fetchStats();
  }, []);

  const pieData = [
    { name: "Accepted", value: stats.accepted },
    { name: "Pending", value: stats.pending },
    { name: "Cancelled", value: stats.cancelled }
  ];

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4">Appointment Status Overview</h3>

      <div className="row">
        <div className="col-md-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DoctorAnalytics;
