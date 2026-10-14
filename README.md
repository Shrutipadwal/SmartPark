# SmartPark

SmartPark is a parking booking platform that helps drivers find and reserve parking easily, while giving parking owners manages lots, availability, and bookings.

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
- choose whether the lot accepts bikes, cars, or both
- wait for review from the super admin
- after approval, manage parking availability and updates from the dashboard
- receive booking alerts by email for successful bookings across the platform

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

## Product Preview

Explore the main SmartPark screens and workflows:

| Driver experience | Parking partner experience | Super-admin experience |
| --- | --- | --- |
| Search and compare parking spaces | Apply to list a parking lot | Review partner applications |
| Choose vehicle type and booking time | Manage parking capacity and pricing | Approve or reject applications |
| Pay, view booking confirmation, and use the QR code | Monitor bookings and availability | |


1. Home Page: Introduces the platform and helps users understand its core purpose: finding and booking parking spaces through a single application.
<img width="1893" height="899" alt="Screenshot (482)" src="https://github.com/user-attachments/assets/c610b235-8986-4cb2-824c-39fad8e502e2" />

2. Parking Discovery, Details & Availability: Helps users explore parking options, review relevant details, and identify suitable parking spaces before making a reservation.
<img width="1865" height="903" alt="Screenshot (484)" src="https://github.com/user-attachments/assets/a394bd5b-f840-48b3-ac8e-ad8248364b4e" />

3. Reservation & Payment: Demonstrates the booking journey, allowing users to proceed with a selected parking space and complete the payment process.
<img width="1878" height="894" alt="Screenshot (514)" src="https://github.com/user-attachments/assets/a9769e27-de95-4e48-bc2a-4453070ca038" />
<img width="1862" height="887" alt="Screenshot (515)" src="https://github.com/user-attachments/assets/3d48bb12-6281-4068-9c8b-d983fbdf15c9" />

4. Booking Confirmation & QR: Provides users with booking details and a QR code intended to support the parking check-in process.
<img width="1869" height="904" alt="Screenshot (511)" src="https://github.com/user-attachments/assets/72dd9b09-f08a-48a3-a056-94871c42cae3" />
<img width="846" height="1212" alt="mail google com_mail_u_1__ik=31ca1fb866 view=pt search=all permthid=thread-f_1879019947199782194 simpl=msg-f_1879019947199782194" src="https://github.com/user-attachments/assets/1c95deaf-4059-44d3-b949-4e865458b4b1" />
<img width="846" height="1859" alt="mail google com_mail_u_1__ik=31ca1fb866 view=pt search=all permthid=thread-f_1879019947416141867 simpl=msg-f_1879019947416141867" src="https://github.com/user-attachments/assets/f658aeed-3046-48ab-8dff-61511ca2eaee" />

5. Check-In / Check-Out: Demonstrates how a reservation can be linked to the parking visit, helping manage entry and exit workflows.
<img width="846" height="1332" alt="localhost_5173_checkin" src="https://github.com/user-attachments/assets/6e0072a2-1057-44bc-9166-1c797ea656ac" />


---

## Summary

SmartPark is a simple and practical solution for managing parking more efficiently:

- drivers can book a space before they arrive
- parking owners can apply and manage their lots
- super admins control access and approval
- the system reduces parking confusion and helps manage real-time availability

This project is built as a working MVP for a smart parking management system.
