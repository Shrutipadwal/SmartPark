# 🚗 SmartPark

SmartPark is a full-stack parking discovery and reservation platform designed to help drivers find reliable parking faster, reserve a space in advance, and manage their booking experience without stress.

The platform brings together three key groups:

- Drivers looking for nearby parking
- Parking owners who want to list and manage spaces
- Admins who monitor parking availability and bookings

The goal is simple: reduce the time spent circling for parking and make the entire parking experience more predictable, faster, and easier to manage.

---

## Table of Contents

- [Overview](#overview)
- [Why SmartPark Exists](#why-smartpark-exists)
- [Core Features](#core-features)
- [How It Works](#how-it-works)
- [User Journey](#user-journey)
- [Admin Workflow](#admin-workflow)
- [Partner Workflow](#partner-workflow)
- [Booking and Confirmation Flow](#booking-and-confirmation-flow)
- [Real-Time Updates](#real-time-updates)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Setup Instructions](#setup-instructions)
- [Run the Project](#run-the-project)
- [Security Notes](#security-notes)

---

## Overview

SmartPark helps users:

- discover nearby parking lots
- compare availability and price
- choose the right vehicle category
- reserve a space by time and duration
- complete a test payment flow
- receive booking confirmation
- check in with QR code or booking ID
- check out when leaving

It also helps parking owners and admin teams:

- add and manage parking lots
- update prices and capacity
- keep availability current
- monitor bookings
- review new owner requests
- manage the overall parking operation from a dashboard

---

## Why SmartPark Exists

Finding parking in busy cities can be frustrating because users often:

- drive around looking for an open lot
- arrive only to find the space is full
- compare uncertain pricing manually
- lose time during peak travel periods
- struggle to remember booking details when they reach the site

SmartPark solves this by giving users a single place to search, reserve, confirm, and manage parking.

---

## Core Features

### User Features

- Google Sign-In using Firebase
- Search parking lots by area or destination
- View parking location details and price information
- Choose bike or car parking categories
- View parking availability before booking
- Reserve a space for selected date and duration
- Pay through a sandbox/test payment flow
- Receive booking confirmation and QR data
- View and manage personal bookings
- Cancel eligible bookings
- Check in and check out using QR or booking ID

### Admin Features

- Admin dashboard for overview metrics
- Add, edit, and delete parking lots
- Update capacity and pricing
- Adjust current availability
- View booking records and statuses
- Receive new reservation notifications
- Review requests from parking owners

### Partner Features

- Parking owners can request partnership access
- Owners submit parking information for review
- Admins can approve or reject partner requests
- Approved partners manage their parking listings in the platform

---

## How It Works

SmartPark follows a simple customer flow:

```text
User searches for parking
        ↓
User compares locations and availability
        ↓
User selects vehicle and duration
        ↓
User reserves the lot
        ↓
Payment is verified
        ↓
Booking is confirmed
        ↓
User checks in on arrival
        ↓
User checks out when leaving
```

On the operational side:

```text
Admin or owner updates parking information
        ↓
Availability and pricing are stored
        ↓
User views updated lot data
        ↓
Booking is created against live availability
        ↓
Check-in and check-out update the live state
```

---

## User Journey

```text
1. Sign in with Google
2. Search for parking near the destination
3. Compare availability, price, and distance
4. Select a parking lot
5. Choose vehicle type and booking duration
6. Continue to payment
7. Receive booking confirmation
8. Use QR code or booking ID to check in
9. Check out after leaving
```

This flow is designed to reduce uncertainty and save user time before and during arrival.

---

## Admin Workflow

Admins can manage the platform from the dashboard:

```text
Admin signs in
        ↓
Dashboard loads booking and lot data
        ↓
Admin adds or edits parking lots
        ↓
Admin updates capacity and availability
        ↓
Admin monitors reservations and statuses
        ↓
Admin reviews partner requests
```

This lets the admin team keep parking information accurate and maintain day-to-day operations.

---

## Partner Workflow

Parking owners can become partners in the system by applying through the partner flow:

```text
Owner clicks Partner with us
        ↓
Owner signs in if required
        ↓
Owner submits parking request details
        ↓
Admin reviews the request
        ↓
Admin approves or rejects the request
        ↓
Approved owner manages parking listings
```

This structure supports a scalable model where verified parking owners can list and manage spaces in the platform.

---

## Booking and Confirmation Flow

The booking process is one of the most important parts of the app:

```text
User selects a lot and time
        ↓
User fills in vehicle and contact details
        ↓
Booking request is created
        ↓
Payment order is generated
        ↓
Payment is verified
        ↓
Booking becomes confirmed
        ↓
QR code and booking ID are generated
```

Once confirmed, the user can:

- view the booking
- check in on arrival
- retrieve a QR code
- cancel eligible bookings
- monitor the current booking status

---

## Real-Time Updates

SmartPark uses real-time communication to keep the platform responsive.

This helps in scenarios such as:

- a new booking arrives
- admin availability is updated
- a space is released after check-out
- reservation events are pushed to the admin dashboard

The real-time layer improves the user experience by reducing manual refreshes and keeping important live data current.

---

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Leaflet + React Leaflet
- Lucide Icons
- Firebase client SDK
- Axios

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- Firebase Admin SDK
- Socket.IO
- Razorpay SDK
- Nodemailer

### Functionality Add-ons

- Google authentication
- QR code generation and scanning
- payment verification flow
- admin dashboard logic
- role-based access handling

---

## Project Structure

```text
SmartPark/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── firebase/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── BookingStyles.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── scripts/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── README.md
├── .gitignore
└── package.json
```

---

## Environment Variables

The project uses environment variables for sensitive configuration.

### Client (.env)

Example values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000/api
```

### Server (.env)

Example values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartpark
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

> This project supports a local demo-friendly setup and also allows production-style config when credentials are provided.

---

## Setup Instructions

### 1. Clone the repo

```bash
git clone <repository-url>
cd SmartPark
```

### 2. Install client dependencies

```bash
cd client
npm install
```

### 3. Install server dependencies

```bash
cd ../server
npm install
```

### 4. Configure environment files

Create the necessary `.env` files in both the client and server folders using the examples above.

### 5. Start the backend

```bash
cd server
npm run dev
```

### 6. Start the frontend

```bash
cd client
npm run dev
```

---

## Run the Project

### Frontend

```bash
cd client
npm run dev
```

### Backend

```bash
cd server
npm run dev
```

### Production build

```bash
cd client
npm run build
```

---

## Security Notes

SmartPark follows a basic security model for a real-world product:

- Firebase authentication is used for login
- protected API routes should validate the user session
- admin-only actions should verify role permissions
- payment and booking data should be validated on the server
- secrets should never be committed to source control

---

## What Makes SmartPark Valuable

SmartPark is valuable because it makes parking easier for both drivers and operators.

For drivers, it reduces wasted time and improves certainty before arrival.

For parking managers, it brings structure to availability, booking, and operational flow.

For admins, it simplifies monitoring and coordination across multiple parking operations.

This makes the app useful not just as a demo, but as a real product concept for smart urban mobility and parking management.

---

## Future Improvements

Potential improvements for the next version include:

- live map clustering for large parking areas
- better price optimization logic
- user push notifications
- automatic booking expiry handling
- advanced admin analytics
- smarter demand forecasting
- multi-lot search filters
- mobile-first polish and app-style UX improvements

---

## Summary

SmartPark is a practical parking reservation platform built to make parking easier, faster, and more transparent for users while giving owners and admins better control over their spaces.

It combines booking, payment, role-based access, QR-based entry, and operational management in one product flow.

---

Built for smarter parking, simpler arrival, and better space management.
