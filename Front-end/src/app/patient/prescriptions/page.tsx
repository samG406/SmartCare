'use client';

import React from 'react';
import PatientNavbar from '@/components/PatientNavbar';
import { formatDateUTC } from '@/lib/format';

const prescriptions = [
  { id: 'RX-1001', date: '2024-11-12', doctor: 'Dr. John Smith', meds: [
    { name: 'Atorvastatin 20mg', dosage: '1 tablet daily', duration: '30 days' },
    { name: 'Vitamin D3 1000 IU', dosage: '1 tablet daily', duration: '30 days' }
  ]},
  { id: 'RX-1002', date: '2024-12-01', doctor: 'Dr. Jane Doe', meds: [
    { name: 'Ibuprofen 400mg', dosage: '1 tablet after meals', duration: '5 days' }
  ]},
];

export default function PrescriptionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Prescriptions</h1>

        <div className="space-y-6">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white rounded-2xl shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{rx.id}</h2>
                  <p className="text-sm text-gray-600">Issued on {formatDateUTC(rx.date)} by {rx.doctor}</p>
                </div>
                <button className="mt-3 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Download PDF</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-600">
                    <tr>
                      <th className="px-4 py-3 text-left text-white text-sm font-semibold">Medicine</th>
                      <th className="px-4 py-3 text-left text-white text-sm font-semibold">Dosage</th>
                      <th className="px-4 py-3 text-left text-white text-sm font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rx.meds.map((m, i) => (
                      <tr key={i} className="hover:bg-blue-50">
                        <td className="px-4 py-3 text-gray-900">{m.name}</td>
                        <td className="px-4 py-3 text-gray-700">{m.dosage}</td>
                        <td className="px-4 py-3 text-gray-700">{m.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


