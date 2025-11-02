'use client';

import React from 'react';
import PatientNavbar from '@/components/PatientNavbar';
import { formatDateUTC } from '@/lib/format';

const records = [
  { id: 'REC-001', date: '2024-10-10', type: 'Blood Test', doctor: 'Dr. John Smith', notes: 'Routine check, all normal.' },
  { id: 'REC-002', date: '2024-11-05', type: 'X-Ray', doctor: 'Dr. Jane Doe', notes: 'No fractures detected.' },
];

export default function MedicalRecordsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Medical Records</h1>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-6 py-4 text-left text-white text-sm font-semibold">Record #</th>
                <th className="px-6 py-4 text-left text-white text-sm font-semibold">Date</th>
                <th className="px-6 py-4 text-left text-white text-sm font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-white text-sm font-semibold">Doctor</th>
                <th className="px-6 py-4 text-left text-white text-sm font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">{rec.id}</td>
                  <td className="px-6 py-4 text-gray-700">{formatDateUTC(rec.date)}</td>
                  <td className="px-6 py-4 text-gray-700">{rec.type}</td>
                  <td className="px-6 py-4 text-gray-700">{rec.doctor}</td>
                  <td className="px-6 py-4 text-gray-700">{rec.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


