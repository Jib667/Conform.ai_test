# Conform.ai

A web application for streamlining medical form filling and processing.

## Features

- Smart form filling with AI validation
- Error prevention through real-time validation
- Time-saving dashboard for all patient forms
- User registration system for healthcare professionals

## Project Structure

- `frontend/`: React-based frontend application with Vite and Tailwind CSS
- `backend/`: Express.js backend with SQLite database

## Setup Instructions

### Quick Setup (Recommended)

1. Install all dependencies at once:
   ```
   npm run install:all
   ```

2. Start both servers simultaneously:
   ```
   npm run dev
   ```

   This will start both the backend server on http://localhost:5000 and the frontend server on http://localhost:5173

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the backend server:
   ```
   npm run dev
   ```
   
   The server will run on http://localhost:5000

#### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm run dev
   ```
   
   The application will be available at http://localhost:5173

### Important Note

Both the frontend and backend servers need to be running simultaneously for the application to work properly. The frontend Vite server is configured to proxy API requests to the backend server.

## Sign-Up Functionality

The application includes a sign-up form that collects:
- Full name
- Email address
- Healthcare title (with custom option)
- Hospital system (with custom option)

This information is stored in an SQLite database on the backend.

## Technologies Used

- React.js
- Vite
- Tailwind CSS
- Express.js
- SQLite 