'use client';

import React from 'react';
import PatientNavbar from '@/components/PatientNavbar';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Billing Details</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="1234 5678 9012 3456" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                  <input className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="MM/YY" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="123" />
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" className="px-6 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Pay Now</button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Consultation Fee</span><span>$150.00</span></div>
              <div className="flex justify-between"><span>Service Charge</span><span>$10.00</span></div>
              <div className="flex justify-between font-semibold border-t pt-3"><span>Total</span><span>$160.00</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


