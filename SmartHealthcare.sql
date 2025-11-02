-- MySQL dump 10.13  Distrib 9.2.0, for macos14.7 (arm64)
--
-- Host: localhost    Database: SmartHealthcare
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Appointments`
--

DROP TABLE IF EXISTS `Appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `doctor_id` int DEFAULT NULL,
  `appointment_date` datetime NOT NULL,
  `status` varchar(100) DEFAULT NULL,
  `reason` text NOT NULL,
  PRIMARY KEY (`appointment_id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`patient_id`),
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `Doctors` (`doctor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Appointments`
--

LOCK TABLES `Appointments` WRITE;
/*!40000 ALTER TABLE `Appointments` DISABLE KEYS */;
INSERT INTO `Appointments` VALUES (1,1,1,'2025-02-15 10:30:00','accepted',''),(2,2,2,'2025-02-16 14:00:00','cancelled',''),(3,1,2,'2025-03-05 10:00:00','Cancelled',''),(4,1,2,'2025-03-05 10:00:00','Cancelled',''),(5,1,2,'2025-03-05 10:00:00','Accepted','Routine Checkup'),(6,3,1,'2025-03-07 14:30:00','Scheduled','Follow-up Checkup'),(7,1,1,'2025-04-29 10:00:00','accepted','Routine check-up'),(8,2,1,'2025-04-29 14:00:00','pending','Dental cleaning'),(9,3,1,'2025-04-28 09:00:00','cancelled','Root canal consultation'),(10,4,1,'2025-05-01 11:30:00','pending','General check-up'),(11,5,1,'2025-05-02 16:00:00','accepted','Tooth extraction'),(12,1,1,'2025-04-30 09:30:00','accepted','General consultation'),(13,2,1,'2025-04-30 11:00:00','accepted','Dental cleaning'),(14,3,1,'2025-04-30 15:15:00','cancelled','Follow-up checkup');
/*!40000 ALTER TABLE `Appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Doctors`
--

DROP TABLE IF EXISTS `Doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Doctors` (
  `doctor_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`doctor_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Doctors`
--

LOCK TABLES `Doctors` WRITE;
/*!40000 ALTER TABLE `Doctors` DISABLE KEYS */;
INSERT INTO `Doctors` VALUES (1,'Dr. John Doe','General Physician','john.doe@hospital.com','1112223333','2025-02-17 01:59:43',NULL),(2,'Dr. Updated','Neurology','dr.updated@example.com','555-555-5555','2025-02-17 01:59:43',NULL),(3,'Dr. Smith','Cardiology','dr.smith@hospital.com','123-456-7890','2025-03-03 02:22:31',NULL);
/*!40000 ALTER TABLE `Doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MedicalRecords`
--

DROP TABLE IF EXISTS `MedicalRecords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MedicalRecords` (
  `record_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `doctor_id` int DEFAULT NULL,
  `diagnosis` text NOT NULL,
  `prescription` text,
  `record_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`record_id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `medicalrecords_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`patient_id`),
  CONSTRAINT `medicalrecords_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `Doctors` (`doctor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MedicalRecords`
--

LOCK TABLES `MedicalRecords` WRITE;
/*!40000 ALTER TABLE `MedicalRecords` DISABLE KEYS */;
INSERT INTO `MedicalRecords` VALUES (1,1,1,'Updated Hypertension Diagnosis','Updated Prescription','2025-02-17 01:59:46'),(2,2,2,'Migraine','Sumatriptan 50mg as needed','2025-02-17 01:59:46');
/*!40000 ALTER TABLE `MedicalRecords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Patients`
--

DROP TABLE IF EXISTS `Patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Patients` (
  `patient_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`patient_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Patients`
--

LOCK TABLES `Patients` WRITE;
/*!40000 ALTER TABLE `Patients` DISABLE KEYS */;
INSERT INTO `Patients` VALUES (1,'Updated Name','updated@example.com','9876543210','1990-01-01','Male','Updated Address','2025-02-17 01:59:43'),(2,'Jane Smith','jane.smith@example.com','987-654-3210','1985-08-20','Female','456 Park Ave, CA','2025-02-17 01:59:43'),(3,'New Patient','new.patient@example.com','1234567890','1990-01-01','Male','123 Test Street','2025-02-21 01:12:12'),(4,'Test Patient','test.patient@example.com','9876543210','1992-05-10','Male','456 Test Lane','2025-02-21 01:28:12'),(5,'John Doe','john.doe@example.com','123-456-7890','1990-01-01','Male','123 Main St, NY','2025-03-03 02:17:07');
/*!40000 ALTER TABLE `Patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Doctor','Patient') DEFAULT 'Patient',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'John Admin','admin@example.com','$2b$10$DNx9vp2InTsttMxrxQzhROQAnrDDN9AxKqkwAAdeEASElyIZfEiiK','Admin','2025-02-21 19:10:24','2025-05-05 00:24:39'),(2,'John Doe','john.doe@example.com','$2b$10$5n/kFS3dsx8V8jfP7HE60.JvfBES7N5pq4ulBGFFD7XrVE41uEBu.','Admin','2025-02-28 01:17:30','2025-05-05 00:24:39'),(3,'Test User','testuser@example.com','123456','Patient','2025-04-09 06:04:32','2025-05-05 00:24:39'),(8,'New User','newuser123@example.com','abc123','Patient','2025-04-10 19:24:27','2025-05-05 00:24:39'),(12,'Mohit Kumar','kumarmohi1@gmail.com','ranbir','Patient','2025-04-10 22:51:56','2025-05-05 00:24:39'),(15,'Rohit kumar','mohitkumar.lnu@my.liu.edu','$2b$10$kCEC4l2Y0QrF08Hc.ewtee42aIGFilLQbmmJh0CO3aXKyvHXlGjlC','Patient','2025-05-05 00:26:35','2025-05-05 00:26:35'),(16,'Mohit Kumar','kumarmohi10@gmail.com','$2b$10$14kQf5sLGANLr8H7TOsTp.nQ0a8x4yz4rJLDDZfTCIVbak3yvISyC','Patient','2025-05-05 00:30:27','2025-05-05 00:30:27'),(18,'simbha ','simbha@gmail.com','$2b$10$Rqup9CeuQ10MJi9lZPML5umNt88ZCg7MZOREu8zkk/cQnBD78zAz.','Doctor','2025-05-05 02:12:12','2025-05-05 02:12:12'),(19,'sapna ','sapna@gmail.com','$2b$10$aljQmG.DKiX04.eE3to/zedQUqjhmis4ySWSexwvJaJXt6G5Mjwy.','Doctor','2025-05-05 03:10:03','2025-05-05 03:10:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-04 23:21:42
