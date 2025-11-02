'use client';

import React, { useState } from 'react';
import DoctorNavbar from '@/components/DoctorNavbar';
import { formatDateUTC } from '@/lib/format';

interface Invoice {
  invoiceNumber: string;
  patientName: string;
  service: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dateIssued: string;
  dueDate: string;
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const invoices: Invoice[] = [
    { invoiceNumber: 'INV-2024-001', patientName: 'Sarah Johnson', service: 'Consultation', amount: 150, status: 'paid', dateIssued: '2024-12-01', dueDate: '2024-12-15' },
    { invoiceNumber: 'INV-2024-002', patientName: 'Michael Chen', service: 'Follow-up', amount: 100, status: 'pending', dateIssued: '2024-12-10', dueDate: '2024-12-24' },
    { invoiceNumber: 'INV-2024-003', patientName: 'Emily Davis', service: 'Lab Tests', amount: 250, status: 'paid', dateIssued: '2024-11-25', dueDate: '2024-12-09' },
    { invoiceNumber: 'INV-2024-004', patientName: 'David Wilson', service: 'X-Ray', amount: 180, status: 'overdue', dateIssued: '2024-11-20', dueDate: '2024-12-04' },
    { invoiceNumber: 'INV-2024-005', patientName: 'Jessica Brown', service: 'Consultation', amount: 150, status: 'paid', dateIssued: '2024-12-05', dueDate: '2024-12-19' },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      overdue: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesFilter = filter === 'all' || inv.status === filter;
    const matchesSearch = inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen bg-blue-50">
      <DoctorNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Invoices
          </h1>
          <p className="text-gray-600">Track and manage your billing and payments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                <h2 className="text-3xl font-bold text-gray-900">${totalAmount.toLocaleString()}</h2>
              </div>
              <div className="text-4xl"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Paid</p>
                <h2 className="text-3xl font-bold text-gray-900">${totalPaid.toLocaleString()}</h2>
              </div>
              <div className="text-4xl"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Pending</p>
                <h2 className="text-3xl font-bold text-gray-900">${pendingAmount.toLocaleString()}</h2>
              </div>
              <div className="text-4xl"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Invoices</p>
                <h2 className="text-3xl font-bold text-gray-900">{invoices.length}</h2>
              </div>
              <div className="text-4xl"></div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-3">
              {(['all', 'paid', 'pending', 'overdue'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    filter === status
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">Invoice #</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Patient</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Service</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Date Issued</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{invoice.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {invoice.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900">{invoice.patientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{invoice.service}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">${invoice.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatDateUTC(invoice.dateIssued)}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg mt-8">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
