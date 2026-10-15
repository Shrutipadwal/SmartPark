# SmartPark

Finding parking can be frustrating: drivers may need to search multiple places, have little information about availability or prices, and still be unsure whether a space will be free when they arrive. Parking owners, meanwhile, need a straightforward way to list their spaces and keep parking details and bookings organized.

SmartPark addresses these challenges with one platform for discovering and booking parking and managing parking lots. Drivers can compare available options, choose a vehicle type and booking time, pay through the configured Razorpay flow, and use a booking QR code for check-in and check-out. Parking owners can apply to join the platform and, once approved, manage their lot details, capacity, pricing, and availability from a dashboard. A super admin reviews partner applications before dashboard access is granted.

The goal is to make it easier for drivers to plan where to park and to help parking owners manage their operations in one place.

## Table of contents

- [How SmartPark helps](#how-smartpark-helps)
- [User roles](#user-roles)
- [What SmartPark does](#what-smartpark-does)
- [Main application flow](#main-application-flow)
- [Project structure](#project-structure)
- [Tech stack](#tech-stack)
- [Email service](#email-service)
- [How the app is organized](#how-the-app-is-organized)
- [Getting started](#getting-started)
- [Product preview and screenshots](#product-preview)
- [Summary](#summary)

## How SmartPark helps

- **Drivers:** Find parking options, review availability and prices, and book ahead instead of searching without knowing what is available.
- **Parking owners:** Apply to list a parking lot and manage its information and availability from a dedicated dashboard after approval.
- **Super admins:** Review partner applications and control which owners receive dashboard access.

SmartPark brings these steps together in a single parking booking and management application.

## User roles

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

Create local environment files by copying the examples:

```text
client/.env.example → client/.env
server/.env.example → server/.env
```

Replace the example values with your own credentials. These settings are important for the app's database, authentication, payments, and optional email features.

#### Client variables (`client/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Yes for local development | Backend API URL. Use `http://localhost:5000/api` when running the backend locally. |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase web-app API key. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase project authentication domain. |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID. |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase web-app ID. |

Get the Firebase web-app values from your Firebase project settings. Enable Google sign-in in Firebase Authentication.

#### Server variables (`server/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes for database-backed features | MongoDB connection string for local MongoDB or MongoDB Atlas. |
| `FIREBASE_PROJECT_ID` | Yes for authentication | Firebase project ID used by Firebase Admin. |
| `FIREBASE_CLIENT_EMAIL` | Yes for authentication | Service-account client email from Firebase Admin credentials. |
| `FIREBASE_PRIVATE_KEY` | Yes for authentication | Service-account private key. In `.env`, preserve line breaks as `\n` if your key is provided on one line. |
| `RAZORPAY_KEY_ID` | Yes for payments | Razorpay key ID. Use test credentials for development. |
| `RAZORPAY_KEY_SECRET` | Yes for payments | Secret paired with the Razorpay key ID. |
| `PORT` | No | Backend port; defaults to `5000`. |
| `CLIENT_ORIGIN` | No | Allowed frontend origin(s), comma-separated if there are multiple. Local Vite origins are allowed by default. |
| `ADMIN_EMAIL` | Recommended | Email address that should receive super-admin privileges. Defaults to `admin@smartpark.com` if unset. |
| `RAZORPAY_WEBHOOK_SECRET` | Only if using webhooks | Secret configured for Razorpay webhook signature verification. |
| `BREVO_SMTP_HOST` | Only if enabling email | Brevo SMTP hostname, usually `smtp-relay.brevo.com`. |
| `BREVO_SMTP_PORT` | Only if enabling email | Brevo SMTP port, usually `587`. |
| `BREVO_SMTP_USER` | Only if enabling email | Brevo SMTP account username. |
| `BREVO_SMTP_PASSWORD` | Only if enabling email | Brevo SMTP key/password. |
| `SENDER_EMAIL` | Only if enabling email | Verified sender email address configured in Brevo. |

For full functionality, configure MongoDB, all three Firebase Admin values, and the Razorpay key pair. Set all five Brevo variables together to use email notifications. Never commit `.env` files or place private keys, Razorpay secrets, or SMTP credentials in the client environment. All variables prefixed with `VITE_` are included in the browser build; only use them for Firebase web-app configuration and other public client settings.

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
