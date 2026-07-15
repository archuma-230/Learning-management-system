# MuthuVerse LMS

A full-stack Learning Management System supporting Students and Tutors.

## Features
- **Student Role**: Browse courses, enroll, track progress, watch videos, generate completion certificates (PDF).
- **Tutor Role**: Dashboard to manage courses, create courses with thumbnails, add lectures.
- **Backend**: Node.js, Express, MongoDB, JWT Authentication, Multer for file uploads, PDFKit for certificates.
- **Frontend**: React (Vite), React Router, Context API, Axios, Bootstrap 5.

## Environment Variables
The `.env` file should be placed in `server/.env` with the following variables:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```
*(Note: A `.env` has been auto-generated for you based on your prompt credentials.)*

## How to Run

### 1. Run the Backend (Server)
1. Navigate to the server folder: `cd server`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
*(Runs on http://localhost:5000)*

### 2. Run the Frontend (Client)
1. Navigate to the client folder: `cd client`
2. Install dependencies: `npm install`
3. Start the Vite server: `npm run dev`
*(Usually runs on http://localhost:5173)*

### 3. Usage
- Go to the frontend URL.
- **Register** an account as a "Tutor" and create a course.
- **Register** another account as a "Student", enroll in the course, and view lectures.
- Once 100% complete, go to Certificates to generate and download a PDF.
