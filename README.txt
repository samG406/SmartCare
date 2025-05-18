# SmartHealthcare Full Project - Setup Instructions

---

## 🔹 FRONTEND (React)

1. Open Terminal:
   cd Frontend
   npm install
   npm start

2. App will run at: http://localhost:3000

---

## 🔹 BACKEND (Node.js + Sequelize + MySQL)

1. Open a new terminal tab:
   cd Backend
   npm install
   npm start

2. Backend runs at: http://localhost:7070

---

## ✅ SAMPLE USERS FOR TESTING

Doctor:
• Email: simbha@gmail.com  
• Password: simbha

Patient:
• Email: kumarmohi10@gmail.com  
• Password: ranbir

Admin:
• (Create via DB manually if needed)

---

📌 Make sure MySQL is running with a database named: `SmartHealthcare`.

✅ Auto table creation & sync is enabled.

---

## 🗂️ DATABASE IMPORT INSTRUCTIONS

1. Open MySQL:
   mysql -u root -p

2. Create DB:
   CREATE DATABASE SmartHealthcare;

3. Exit MySQL, then import:
   mysql -u root -p SmartHealthcare < SmartHealthcare.sql

Password: Enter 
