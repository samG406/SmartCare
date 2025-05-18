import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import "../../index.css";

const Checkout = () => {
  const location = useLocation();
  const bookingData = location.state || {};
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nameOnCard: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    paymentMethod: 'credit-card',
    termsAccepted: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle payment submission here
  };

  return (
    <div className="checkout-container">
      <div className="checkout-form">
        <div className="personal-info-section">
          <h2>Personal Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone"
              />
            </div>
          </div>
        </div>

        <div className="payment-section">
          <h2>Payment Method</h2>
          <div className="payment-methods">
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="credit-card"
                checked={formData.paymentMethod === 'credit-card'}
                onChange={handleInputChange}
              />
              <span>Credit Card</span>
            </label>
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={formData.paymentMethod === 'paypal'}
                onChange={handleInputChange}
              />
              <span>Paypal</span>
            </label>
          </div>

          {formData.paymentMethod === 'credit-card' && (
            <div className="credit-card-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name on Card</label>
                  <input
                    type="text"
                    name="nameOnCard"
                    value={formData.nameOnCard}
                    onChange={handleInputChange}
                    placeholder="Name on Card"
                  />
                </div>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9876 5432"
                  />
                </div>
              </div>
              <div className="form-row three-cols">
                <div className="form-group">
                  <label>Expiry Month</label>
                  <input
                    type="text"
                    name="expiryMonth"
                    value={formData.expiryMonth}
                    onChange={handleInputChange}
                    placeholder="MM"
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Year</label>
                  <input
                    type="text"
                    name="expiryYear"
                    value={formData.expiryYear}
                    onChange={handleInputChange}
                    placeholder="YY"
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="CVV"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="terms-section">
            <label className="terms-checkbox">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
              />
              <span>I have read and accept <a href="#">Terms & Conditions</a></span>
            </label>
          </div>

          <button 
            className="confirm-pay-button"
            disabled={!formData.termsAccepted}
            onClick={handleSubmit}
          >
            Confirm and Pay
          </button>
        </div>
      </div>

      <div className="booking-summary">
        <h2>Booking Summary</h2>
        <div className="doctor-info">
          <img src="/doctor-thumb-02.jpg" alt={bookingData.doctorName} />
          <div className="doctor-details">
            <h3>{bookingData.doctorName}</h3>
            <div className="rating">★★★★☆ 35</div>
            <p className="location">{bookingData.doctorLocation}</p>
          </div>
        </div>
        
        <div className="appointment-details">
          <div className="detail-row">
            <span>Date</span>
            <span>{bookingData.appointmentDate}</span>
          </div>
          <div className="detail-row">
            <span>Time</span>
            <span>{bookingData.appointmentTime}</span>
          </div>
          <div className="detail-row">
            <span>Consulting Fee</span>
            <span>${bookingData.consultingFee}</span>
          </div>
          <div className="detail-row">
            <span>Booking Fee</span>
            <span>${bookingData.bookingFee}</span>
          </div>
          <div className="detail-row">
            <span>Video Call</span>
            <span>${bookingData.videoCall}</span>
          </div>
          <div className="detail-row total">
            <span>Total</span>
            <span>${bookingData.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 