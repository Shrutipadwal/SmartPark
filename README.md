# SmartPark

SmartPark is a parking booking platform that helps drivers find and reserve parking easily, while giving parking owners and admins a way to manage lots, availability, and bookings.

The app has 3 main roles:

- Driver / User: search for a parking space, choose vehicle type, select date and time, book the slot, pay, and get a QR code for check-in/check-out.
- Parking Owner / Partner: fill out a request form with parking details and apply to become a partner.
- Super Admin: reviews partner requests and approves or rejects them.

Once approved, the parking owner gets access to an admin dashboard where they can manage lot details, parking spaces, pricing, and availability.

---

## What SmartPark does

### For users

A user can:

- sign in with Google
- search nearby parking lots
- choose bike or car parking
- view parking availability and price
- select a date, time, and duration
- make a booking
- pay through a test payment flow
- receive a booking confirmation
- get a QR code or booking ID
- check in and check out

### For parking owners

A parking owner can:

- submit a partnership request
- enter basic parking information such as name, address, contact number, capacity, pricing, and vehicle type details
- wait for review from the super admin
- after approval, manage parking availability and updates from the dashboard

### For super admin

A super admin can:

- review all parking owner requests
- approve or reject the application
- give the owner access to manage their parking space

---

## Main application flow

### Driver flow

```text
Driver searches parking
        ↓
Driver selects vehicle type, date, time, duration
        ↓
Driver books the space
        ↓
Driver pays
        ↓
Booking is confirmed
        ↓
Driver receives QR code / booking ID
        ↓
Driver checks in and checks out
```

### Owner flow

```text
Owner fills partner form
        ↓
Owner submits parking details
        ↓
Super admin reviews request
        ↓
Approved owner gets admin access
        ↓
Owner updates parking details and availability
```

### Super admin flow

```text
Super admin checks owner requests
        ↓
Approves or rejects request
        ↓
Only approved owners get dashboard access
```

---

## Project structure

```text
SmartPark/
├── client/            # Frontend React app
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/            # Backend Express + MongoDB app
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── server.js
│   └── package.json
├── README.md
└── package.json
```

---

## Tech stack

### Frontend

- React
- Vite
- React Router
- Leaflet / Map UI
- Firebase authentication
- Razorpay checkout integration
- QR code scanning and generation

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- Firebase Admin
- Socket.IO
- Email services: Brevo SMTP via Nodemailer

---

## Email service

SmartPark uses Brevo SMTP to send booking-related emails such as:

- booking confirmation
- payment receipts
- cancellation emails
- reminder emails
- owner/admin notifications

This is configured in the backend with Nodemailer and the Brevo SMTP credentials.

---

## How the app is organized

This is a full-stack app with two major parts:

1. User booking system
   - driver finds spaces
   - reserves a slot
   - pays and confirms booking
   - checks in / checks out

2. Parking owner management system
   - owner applies to become a partner
   - super admin reviews request
   - approved owner manages parking data and availability

So in short, SmartPark is a parking reservation platform with a separate partner onboarding and admin approval flow.

---

## Setup

### Install frontend dependencies

```bash
cd client
npm install
```

### Install backend dependencies

```bash
cd server
npm install
```

### Run frontend

```bash
cd client
npm run dev
```

### Run backend

```bash
cd server
npm run dev
```

---

## Screenshots

Add screenshots of the following here:

- Driver search and parking listing page
- Booking form with date, time, and vehicle selection
- Payment / confirmation screen
- QR code booking confirmation
- Check-in / check-out page
- Partner request form
- Admin dashboard
- Super admin approval screen

Example placeholder:

```md
## Screenshot 1
![Driver booking page](./screenshots/driver-booking.png)

## Screenshot 2
![Partner request form](./screenshots/partner-form.png)
```

---

## Summary

SmartPark is a simple and practical solution for managing parking more efficiently:

- drivers can book a space before they arrive
- parking owners can apply and manage their lots
- super admins control access and approval
- the system reduces parking confusion and helps manage real-time availability

This project is built as a working MVP for a smart parking management system.
