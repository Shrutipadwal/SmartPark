# SmartPark

SmartPark is a parking booking platform that helps drivers find and reserve parking, while helping parking owners manage their lots, availability, and bookings.

The app has three main roles:

- **Driver:** Search for a parking space, choose a vehicle type and booking time, make a reservation, and use the booking QR code for check-in and check-out.
- **Parking owner / partner:** Submit a request with parking-lot details and, after approval, manage the lot through the dashboard.
- **Super admin:** Review partner requests and approve or reject them.

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
- pay through Razorpay (test or live mode, depending on the configured credentials)
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
- receive email updates about their partnership request

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

SmartPark uses Brevo SMTP via Nodemailer to send emails such as:

- booking confirmation
- payment receipts
- cancellation emails
- reminder emails
- owner/admin notifications

Configure the Brevo SMTP settings in `server/.env` to enable email delivery. The application can still be run without configuring email, but email notifications will not be available.

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

## Getting started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm
- MongoDB, running locally or available through MongoDB Atlas
- A Firebase project with Google sign-in enabled
- Razorpay credentials (use test credentials for development)

### Configure environment variables

Create local environment files from the examples:

```text
client/.env.example → client/.env
server/.env.example → server/.env
```

Copy the files using your preferred file manager or shell. Set the values in each `.env` file:

- **Client:** Add your Firebase web-app configuration and set `VITE_API_URL=http://localhost:5000/api` for the local backend.
- **Server:** Set `MONGODB_URI`, the Firebase Admin credentials, and `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
- **Email (optional):** Set the `BREVO_SMTP_*` and `SENDER_EMAIL` values in `server/.env` to enable email delivery.

The server template also includes optional settings for the port, allowed client origin, admin email, and Razorpay webhooks. Never commit `.env` files or put private keys and API secrets in the client environment; values prefixed with `VITE_` are exposed to the browser.

### Install dependencies

Run these commands from the project root:

```bash
cd client
npm install
cd ../server
npm install
```

### Start the application

Start the backend and frontend in separate terminals from the project root.

**Terminal 1 — backend**

```bash
cd server
npm run dev
```

**Terminal 2 — frontend**

```bash
cd client
npm run dev
```

Open the local URL printed by Vite in the frontend terminal. The backend uses port `5000` by default.

---

## Product Preview

Explore the main SmartPark screens and workflows:

| Driver experience | Parking partner experience | Super-admin experience |
| --- | --- | --- |
| Search and compare parking spaces | Apply to list a parking lot | Review partner applications |
| Choose vehicle type and booking time | Manage parking capacity and pricing | Approve or reject applications |
| Pay, view booking confirmation, and use the QR code | Monitor bookings and availability | Manage partner access |


1. Home Page: Introduces the platform and helps users understand its core purpose: finding and booking parking spaces through a single application.
<img width="1893" height="899" alt="Screenshot (482)" src="https://github.com/user-attachments/assets/c610b235-8986-4cb2-824c-39fad8e502e2" />

2. Parking Discovery, Details & Availability: Helps users explore parking options, review relevant details, and identify suitable parking spaces before making a reservation.
<img width="1865" height="903" alt="Screenshot (484)" src="https://github.com/user-attachments/assets/a394bd5b-f840-48b3-ac8e-ad8248364b4e" />

3. Reservation & Payment: Demonstrates the booking journey, allowing users to proceed with a selected parking space and complete the payment process.
<img width="1878" height="894" alt="Screenshot (514)" src="https://github.com/user-attachments/assets/a9769e27-de95-4e48-bc2a-4453070ca038" />
<img width="1862" height="887" alt="Screenshot (515)" src="https://github.com/user-attachments/assets/3d48bb12-6281-4068-9c8b-d983fbdf15c9" />

4. Booking Confirmation & QR: Provides users with booking details and a QR code intended to support the parking check-in process.
<img width="1869" height="904" alt="Screenshot (511)" src="https://github.com/user-attachments/assets/72dd9b09-f08a-48a3-a056-94871c42cae3" />
<img width="1837" height="899" alt="Screenshot (513)" src="https://github.com/user-attachments/assets/1b530ee9-e27c-4d67-8f9d-a451d17322e6" />
<img width="1617" height="579" alt="Screenshot (518)" src="https://github.com/user-attachments/assets/02572855-15fc-4055-a431-40ef7764fb7e" />

5. My Bookings & Cancellation: Allows users to view their bookings and cancel a reservation before the scheduled booking time. This gives users flexibility to manage their parking reservations when their plans change.
<img width="1867" height="898" alt="Screenshot (512)" src="https://github.com/user-attachments/assets/5e3321c0-8aaa-4caf-93f6-8945eee8795d" />
<img width="1482" height="629" alt="Screenshot (516)" src="https://github.com/user-attachments/assets/ee9b07ff-3b55-4540-a1fa-fdaa1c036155" />


6. Check-In / Check-Out: Demonstrates how a reservation can be linked to the parking visit, helping manage entry and exit workflows.
<img width="1875" height="894" alt="Screenshot (494)" src="https://github.com/user-attachments/assets/e581a334-e703-4781-909d-918e815f38bc" />

7. Partner Admin Dashboard: Allows approved admins to add and manage parking locations, including relevant parking details, capacity, pricing, and availability. This enables them to maintain parking information and manage parking operations through a centralized dashboard.
<img width="1860" height="904" alt="Screenshot (519)" src="https://github.com/user-attachments/assets/d1592bd3-1d2b-49d5-ab9d-36f34b2004f3" />
<img width="1882" height="731" alt="Screenshot (521)" src="https://github.com/user-attachments/assets/3aece890-1b85-4c50-a881-ac2004791790" />


8. Super Admin: Allows reviewing requests from partner admins and approving or rejecting them. This creates a controlled access process and helps ensure that administrative privileges are granted only after approval.
<img width="1875" height="900" alt="Screenshot (522)" src="https://github.com/user-attachments/assets/92353f1a-78bc-47bb-b54f-798fef3dcf46" />



---

## Summary

SmartPark is a simple and practical solution for managing parking more efficiently:

- drivers can book a space before they arrive
- parking owners can apply and manage their lots
- super admins control access and approval
- the system reduces parking confusion and helps manage parking availability

This project is built as a working MVP for a smart parking management system.
