import React from "react";
import heroImage from "../assets/homeimg.jpg";


function HeroSection() {
  return (
    <section className="hero-section text-center">
      <div className="hero-heading m-4">
        <h1>Search Doctor, Make an Appointment</h1>
        <p>
          Discover the best doctors, clinic & hospital the city nearest to you.
        </p>
      </div>
      {/* ✅ Search Bar */}
      <div className="hero-searchbar">
        <input
          type="text"
          placeholder="Search Doctors, Specialities, Diseases Etc"
        />
        <button>
        <i className="fas fa-search"></i>
        </button>
      </div>
      <div className="hero-image">
        <img src={heroImage} alt="Hero City Illustration" />
      </div>
      <div className="hero-specialities">
        <h2>Clinic and Specialities</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>

        <div className="speciality-scroll-wrapper">
          <div className="speciality-icons">
            <div className="speciality-item">
              <div className="speciality-icon">
                <img src="/icons/neuro.png" alt="Neurology" />
              </div>
              <p>Neurology</p>
            </div>
            <div className="speciality-item">
              <div className="speciality-icon">
                <img src="/icons/cardio.png" alt="Cardiology" />
              </div>
              <p>Cardiology</p>
            </div>
            <div className="speciality-item">
              <div className="speciality-icon">
                <img src="/icons/ortho.png" alt="Orthopedic" />
              </div>
              <p>Orthopedic</p>
            </div>
            <div className="speciality-item">
              <div className="speciality-icon">
                <img src="/icons/tooth.png" alt="Dentist" />
              </div>
              <p>Dentist</p>
            </div>
            <div className="speciality-item">
              <div className="speciality-icon">
                <img src="/icons/psychology.png" alt="Psychology" />
              </div>
              <p>Psychology</p>
            </div>
            <div className="speciality-item">
              <div className="speciality-icon">
                <img src="/icons/lungs.png" alt="Pulmonology" />
              </div>
              <p>Pulmonology</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
