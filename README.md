# Navigo- Industrial Navigation Platform

An industrial-grade robot monitoring and navigation platform built with the MERN stack. This application allows operators to upload floor plans, mark delivery points, and manage robot paths in real-time.

Hardware Architecture – Industrial Mobile Robot

1. Overview
This project implements a compact industrial mobile robot designed for material transport in warehouse environments.

The hardware is designed for reliability, safety, and modular expansion, enabling autonomous navigation and operator control from a laptop.

3. System Architecture
   
The hardware follows a split-control architecture:
A high-level compute unit handles navigation and perception
A dedicated microcontroller handles real-time motor control and safety
This separation ensures stable operation even under high computational load.

5. Main Hardware Components
   
Compute Unit
Jetson Nano / Raspberry Pi
Runs ROS 2
Handles SLAM, navigation, and sensor processing
Communicates with the motor controller

Control Microcontroller
ESP32 / Arduino
Real-time motor control
Mode switching and safety logic
Load-based speed regulation
Communication with compute unit
Drive System
DC gear motors (Johnson / N20)
Differential or skid-steer configuration
Motor drivers (L298N for prototype, higher-current drivers recommended)
Encoders support accurate speed and motion control.
Power System
12V Li-ion battery pack
DC-DC buck converters for logic power
Separate power rails for motors and control electronics
Sensors
360° LiDAR (LD08 / LDS-01) – obstacle detection and mapping
Load cell + HX711 – real-time load measurement
Camera (optional) – QR/barcode detection and monitoring
Human Interface
16×2 LCD for load and status display
Physical switches for mode selection and emergency stop

7. Communication
   
Compute unit ↔ Microcontroller: USB Serial or Wi-Fi
Laptop ↔ Compute unit: ROS 2 teleoperation
Microcontroller ↔ Motors: PWM control

9. Safety Features
    
Hardware emergency stop
Manual override capability
Load-dependent speed limiting
Common ground and protected power distribution

11. Expandability
The design supports future extensions such as:
Multi-drop delivery points
Vision-based inspection
Fleet coordination
Industrial IoT dashboards

13. Summary
This hardware design provides a compact, robust, and scalable platform suitable for industrial automation and warehouse navigation applications.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Deployment**: Local Server (Express) + Vite Frontend

## Prerequisites

Before running the project locally, ensure you have:

- [Node.js](https://nodejs.org/) (v18 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally
- npm or yarn

## Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd robo_d
```

### 2. Setup Environment Variables
Create a `.env` file in the root directory:
```env
MONGODB_URI="mongodb://127.0.0.1:27017/robo_d"
```

### 3. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
cd ..
```

## Running the Application

You need to run both the backend and frontend servers simultaneously.

### 1. Start the Backend Server
In a new terminal:
```bash
cd server
npm run dev
```
The server will start on `http://127.0.0.1:5000`.

### 2. Start the Frontend Application
In another terminal:
```bash
npm run dev
```
The application will be accessible at `http://localhost:8080`.

## Project Structure

- `/src`: React frontend components, hooks, and pages.
- `/server`: Express backend application.
  - `/server/models`: Mongoose schemas for Maps, Nodes, and Connections.
  - `/server/uploads`: Local storage for uploaded map images.
- `/public`: Static assets.

## Features

- **Interactive Maps**: Upload and manage multiple facility floor plans.
- **Node Management**: Mark delivery points, waypoints, and charging stations.
- **Pathfinding**: Create and persist connections between nodes.
- **Robot Monitoring**: Real-time status tracking for the robot fleet.
- **MERN Architecture**: Full-stack implementation with MongoDB persistence.
