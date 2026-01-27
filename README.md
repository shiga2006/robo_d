# Navigo- Industrial Navigation Platform

An industrial-grade robot monitoring and navigation platform built with the MERN stack. This application allows operators to upload floor plans, mark delivery points, and manage robot paths in real-time.

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
