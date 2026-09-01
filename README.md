# 🚗 SmartPark

### Find. Book. Park.

SmartPark is a full-stack parking discovery and reservation platform that helps users find nearby parking, check parking availability and pricing, and reserve a parking space before reaching their destination.

Parking administrators can manage parking locations, vehicle capacity, pricing, availability, and bookings through a dedicated admin dashboard.

The goal of SmartPark is simple: **reduce the time and stress users spend searching for parking.**

---

## 📌 Table of Contents

* [Problem](#-problem)
* [Solution](#-solution)
* [Key Features](#-key-features)
* [How SmartPark Works](#-how-smartpark-works)
* [User Flow](#-user-flow)
* [Admin Flow](#-admin-flow)
* [Real-Time Availability](#-real-time-availability)
* [Booking System](#-booking-system)
* [Tech Stack](#-tech-stack)
* [Project Structure](#-project-structure)
* [Authentication](#-authentication)
* [Security](#-security)
* [Getting Started](#-getting-started)
* [Environment Variables](#-environment-variables)
* [API Overview](#-api-overview)
* [Screenshots](#-screenshots)
* [Future Improvements](#-future-improvements)
* [Project Highlights](#-project-highlights)

---

# 🎯 Problem

Finding parking in busy areas can be difficult and time-consuming.

For example, a user visiting a crowded market, shopping area, hospital, railway station, or tourist location may have to:

1. Reach the destination.
2. Search for a parking lot.
3. Find out whether it has space.
4. Compare prices.
5. Sometimes travel to another parking location if the first one is full.

This wastes **time, fuel, and effort** and creates unnecessary stress.

There is also no guarantee that a parking space will still be available when the user reaches the location.

---

# 💡 Solution

SmartPark provides a single platform where users can:

* Find nearby parking.
* View parking locations on a map.
* Check available spaces.
* Compare prices.
* Select two-wheeler or four-wheeler parking.
* Select parking duration.
* Reserve a parking space in advance.
* Complete a test/sandbox payment.
* Receive booking confirmation.
* Manage their bookings.

Parking administrators can:

* Add and manage parking locations.
* Set parking capacity.
* Set prices for different vehicle types.
* Update current availability.
* View bookings.
* Manage parking operations.

---

# ✨ Key Features

## 👤 User Features

### 🔐 Google Login

Users can sign in using their Google account through Firebase Authentication.

### 📍 Find Nearby Parking

Users can search for parking near their destination.

### 🗺️ Map Integration

Parking locations can be displayed on a map to help users understand where the parking facility is located.

### 🅿️ Parking Availability

Users can see the current availability of:

* Two-wheeler spaces
* Four-wheeler spaces

### 💰 Pricing

Users can view separate pricing for:

* Two-wheelers
* Four-wheelers

### 🚗 Vehicle Selection

Users can select the type of vehicle they want to park.

### ⏰ Duration Selection

Users can select the date, start time, and parking duration.

### 📅 Advance Booking

Users can reserve a parking space before reaching the parking location.

### 💳 Payment

The application supports a test/sandbox payment flow for booking confirmation.

### ✅ Booking Confirmation

After a successful booking, users receive booking details including:

* Booking ID
* Parking location
* Vehicle type
* Date
* Start time
* End time
* Amount
* Booking status

### 📖 My Bookings

Users can view their current and previous bookings.

### ❌ Booking Cancellation

Users can cancel eligible bookings according to the application's booking rules.

---

# 👨‍💼 Admin Features

## 🔐 Admin Login

Administrators use Google Sign-In through Firebase Authentication.

## 🏢 Add Parking Location

Admins can add parking facilities with information such as:

* Parking name
* Location
* Address
* Two-wheeler capacity
* Four-wheeler capacity
* Two-wheeler price
* Four-wheeler price
* Opening time
* Closing time
* Parking type

## ✏️ Manage Parking

Admins can update parking information when required.

## 📊 Manage Availability

Admins can update the number of occupied/available spaces.

For example:

```text
Two Wheelers

Capacity: 100
Occupied: 72
Available: 28
```

If a vehicle enters:

```text
Occupied: 72 → 73
Available: 28 → 27
```

The updated information is stored in the backend and reflected on the user side.

## 📋 Manage Bookings

Admins can view parking reservations and their current status.

## 🚗 Check-In / Check-Out

The booking lifecycle can be managed through check-in and check-out.

---

# 🔄 How SmartPark Works

The application has two main sides:

```text
                    SmartPark
                       |
              -------------------
              |                 |
            USER              ADMIN
              |                 |
        Find Parking       Manage Parking
              |                 |
        Check Availability  Update Availability
              |                 |
        Select Vehicle      Manage Bookings
              |                 |
        Select Duration          |
              |                 |
            Payment               |
              |                 |
           Booking ---------------
              |
       Availability Updated
```

Both sides work with the same backend and database.

This ensures that the information displayed to users is based on the current parking data.

---

# 👤 User Flow

```text
Google Login
     ↓
User Dashboard
     ↓
Search Destination
     ↓
View Nearby Parking
     ↓
View Map
     ↓
Select Parking
     ↓
Check Availability
     ↓
Select Vehicle
     ↓
Select Date & Duration
     ↓
Calculate Price
     ↓
Payment
     ↓
Booking Confirmed
     ↓
View Booking
```

---

# 👨‍💼 Admin Flow

```text
Google Login
     ↓
Admin Dashboard
     ↓
Add Parking Location
     ↓
Set Capacity
     ↓
Set Pricing
     ↓
Set Location
     ↓
Manage Parking
     ↓
Update Availability
     ↓
View Bookings
     ↓
Manage Check-In / Check-Out
```

---

# ⚡ Real-Time Availability

One of the important features of SmartPark is keeping parking availability synchronized between the admin and user sides.

The basic flow is:

```text
Admin updates availability
          ↓
       Backend
          ↓
       MongoDB
          ↓
   Real-time event
          ↓
     User Interface
```

For example:

```text
Before:

🚗 Available: 15

Admin updates parking:

15 → 14

After:

🚗 Available: 14
```

The application uses **Socket.IO** for real-time communication where implemented.

This avoids requiring users to manually refresh the page to see availability changes.

---

# 🅿️ Parking Availability States

Parking availability is represented using simple states.

### 🟢 Available

Enough parking spaces are available.

### 🟡 Limited

Only a small number of spaces are available.

### 🔴 Full

No spaces are currently available.

Example:

```text
Total Capacity: 100
Available: 45

Status: 🟢 Available
```

```text
Total Capacity: 100
Available: 12

Status: 🟡 Limited
```

```text
Total Capacity: 100
Available: 0

Status: 🔴 Full
```

---

# 📅 Booking System

The booking system allows users to reserve a parking space for a specific period.

Example:

```text
Parking:
Tulshibaug Parking

Vehicle:
Four Wheeler

Date:
21 August

Time:
3:00 PM – 5:00 PM

Price:
₹50/hour

Duration:
2 hours

Total:
₹100
```

Before creating a booking, the backend checks the current availability.

---

# 🔒 Preventing Double Booking

A major backend requirement is preventing multiple users from reserving the same available space.

For example:

```text
Available Spaces = 1
```

Two users try to book at the same time.

The backend must ensure:

```text
User A → Booking successful ✅

User B → Booking rejected ❌
```

The availability check and reservation update should be handled safely on the server/database side rather than relying only on the frontend.

This prevents incorrect availability and double reservations.

---

# ⏰ Booking Expiration

A booking can have a defined start and end time.

For reservations that are not used within the allowed time/grace period, the booking can be marked as expired and the reserved space can be released.

Example:

```text
Booking:
3:00 PM – 5:00 PM

Grace Period:
15 minutes

User does not arrive

        ↓

Booking expires

        ↓

Slot released

        ↓

Slot becomes available again
```

---

# 💳 Payment Flow

SmartPark uses a test/sandbox payment flow for development.

```text
Select Parking
      ↓
Select Vehicle
      ↓
Select Duration
      ↓
Calculate Amount
      ↓
Payment
      ↓
Payment Successful
      ↓
Create Booking
      ↓
Booking Confirmation
```

The backend should verify the booking information before creating the final reservation.

---

# 🎟️ Booking Confirmation

After a successful booking, the user can see:

```text
--------------------------------
       PARKING CONFIRMED ✓
--------------------------------

Booking ID:
SP-28491

Parking:
Tulshibaug Parking

Vehicle:
Four Wheeler

Date:
21 August

Time:
3:00 PM – 5:00 PM

Amount:
₹100

Status:
CONFIRMED
--------------------------------
```

If QR-based check-in is implemented, the booking can also contain a QR code for verification.

---

# 🔐 Authentication & Roles

Firebase Authentication is used for Google Sign-In.

There are two application roles:

```text
USER
ADMIN
```

### User

Users can:

* Search parking
* View parking details
* Check availability
* Create bookings
* View their bookings
* Cancel eligible bookings

### Admin

Admins can:

* Add parking
* Update parking
* Manage availability
* View bookings
* Manage parking operations

The backend verifies the authenticated Firebase user before allowing access to protected resources.

---

# 🛡️ Security

SmartPark follows basic security practices for a full-stack application.

### Authentication

Firebase Authentication is used for user login.

### Authorization

Admin-only functionality is protected using role-based authorization.

### Protected APIs

Private API routes require authentication.

### Server-Side Validation

Important values such as:

* Price
* Availability
* Booking information

are validated on the backend.

### Double Booking Protection

The backend checks availability before creating a reservation and uses database-safe logic to reduce the possibility of conflicting bookings.

### Environment Variables

Sensitive information such as:

* Database credentials
* Firebase server credentials
* Payment credentials
* API keys

should be stored in environment variables rather than committed to GitHub.

---

# 🛠️ Tech Stack

| Technology                | Purpose                             |
| ------------------------- | ----------------------------------- |
| React.js                  | Frontend application                |
| Tailwind CSS              | UI styling                          |
| React Router              | Page navigation                     |
| Node.js                   | Backend runtime                     |
| Express.js                | REST API development                |
| MongoDB                   | Application database                |
| Mongoose                  | MongoDB object modeling             |
| Firebase Authentication   | Google Sign-In                      |
| Firebase Admin SDK        | Backend authentication verification |
| Socket.IO                 | Real-time availability updates      |
| Maps API                  | Parking location and map            |
| Axios                     | API communication                   |
| Payment Gateway / Sandbox | Test payment processing             |

---

# 📁 Project Structure

```text
smartpark/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── user/
│   │   │   └── admin/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── firebase/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── .env.example
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── sockets/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

# 🗄️ Database Structure

SmartPark uses MongoDB.

## Users

Stores information about authenticated users.

```text
users

- firebaseUid
- name
- email
- profileImage
- role
- createdAt
```

---

## Parking Lots

Stores parking facility information.

```text
parkingLots

- name
- ownerId
- address
- latitude
- longitude
- bikeCapacity
- carCapacity
- bikeAvailable
- carAvailable
- bikePricePerHour
- carPricePerHour
- parkingType
- openingTime
- closingTime
- createdAt
- updatedAt
```

---

## Bookings

Stores user reservations.

```text
bookings

- bookingId
- userId
- parkingId
- vehicleType
- vehicleNumber
- startTime
- endTime
- amount
- paymentStatus
- bookingStatus
- createdAt
- updatedAt
```

Possible booking statuses:

```text
PENDING
CONFIRMED
CHECKED_IN
COMPLETED
CANCELLED
EXPIRED
```

---

# 🔌 API Overview

## Parking APIs

```text
GET     /api/parking
GET     /api/parking/:id
POST    /api/parking
PUT     /api/parking/:id
DELETE  /api/parking/:id
```

## Availability APIs

```text
GET     /api/parking/:id/availability
PUT     /api/parking/:id/availability
```

## Booking APIs

```text
POST    /api/bookings
GET     /api/bookings/my
GET     /api/bookings/:id
PUT     /api/bookings/:id/cancel
```

## Admin APIs

```text
GET     /api/admin/dashboard
GET     /api/admin/parking
GET     /api/admin/bookings
```

> API routes may vary depending on the final implementation. Refer to the server code for the current API structure.

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd smartpark
```

---

## 2. Install Frontend Dependencies

```bash
cd client
npm install
```

---

## 3. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

---

# 🔑 Environment Variables

SmartPark uses environment variables for configuration and sensitive credentials.

Create:

```text
client/.env
server/.env
```

Do not commit these files to GitHub.

---

## Client Environment Variables

Example:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Add other variables required by your actual frontend implementation.

---

## Server Environment Variables

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

PAYMENT_KEY_ID=your_payment_key
PAYMENT_KEY_SECRET=your_payment_secret
```

Add other variables required by your actual backend implementation.

---

# ▶️ Running the Application

## Start Backend

```bash
cd server
npm run dev
```

or, depending on the project configuration:

```bash
npm start
```

---

## Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

The terminal will display the local frontend URL.

For example:

```text
http://localhost:5173
```

The backend may run on a different port depending on the configuration.

---

# 🧪 Testing the Main Flow

A basic end-to-end test can be performed using the following flow.

## User Test

```text
1. Sign in with Google
2. Search for a destination
3. View nearby parking
4. Select a parking location
5. Select vehicle type
6. Select duration
7. Check calculated price
8. Complete test payment
9. Confirm booking
10. View booking in My Bookings
```

## Admin Test

```text
1. Sign in as admin
2. Open Admin Dashboard
3. Add a parking location
4. Set capacity and pricing
5. Update availability
6. Check the user side
7. Create a user booking
8. Check the booking from Admin Dashboard
9. Update/check booking status
```

## Real-Time Test

```text
1. Open Admin Dashboard
2. Open User parking page in another browser/tab
3. Change parking availability from Admin
4. Verify the User side receives the updated availability
```

---

# 🔄 Example End-to-End Scenario

Suppose:

```text
Parking:
Tulshibaug Parking

Four Wheeler Capacity:
20

Currently Available:
5
```

A user books one four-wheeler space.

The system changes:

```text
Available:
5 → 4
```

The booking is stored in MongoDB.

The admin can see the booking.

Other users can see:

```text
🚗 4 spaces available
```

When the parking space is released after the booking is completed/cancelled/expired:

```text
Available:
4 → 5
```

This demonstrates how the user, admin, booking and availability systems work together.

---

# 🧠 Important Development Concepts Used

SmartPark demonstrates several practical full-stack development concepts:

### Frontend

* Component-based UI
* React state management
* Routing
* Forms
* API integration
* Responsive design

### Backend

* REST APIs
* Authentication middleware
* Role-based authorization
* Request validation
* Business logic
* Error handling

### Database

* MongoDB
* Mongoose models
* Relationships between users, parking and bookings
* Availability management

### Real-Time Communication

* Socket.IO
* Server-to-client availability updates

### Authentication

* Firebase Google Authentication
* Firebase token verification

### Booking Logic

* Availability validation
* Price calculation
* Booking lifecycle
* Double-booking prevention
* Booking expiration

---

# 🚀 Future Improvements

The current system can be extended with:

* 📷 Automatic vehicle detection using cameras
* 🚘 Number plate recognition
* 📡 IoT-based parking sensors
* 🔔 Push notifications
* 📱 Mobile application
* 📊 Advanced parking analytics
* 💰 Dynamic pricing based on demand
* 🧭 Improved navigation and estimated arrival time
* ⭐ Parking ratings and reviews
* 🤖 Parking availability prediction

These features are considered future improvements and are not required for the core MVP.

---

# 🌟 Project Highlights

The main focus of SmartPark is not simply displaying parking locations.

The project combines:

```text
Authentication
      +
Parking Management
      +
Real-Time Availability
      +
Booking
      +
Payment
      +
Database
      +
Role-Based Access
```

The most important system relationship is:

```text
ADMIN
  ↓
Manage Parking
  ↓
MongoDB
  ↓
Availability
  ↓
USER
  ↓
Booking
  ↓
MongoDB
  ↓
Availability Updated
  ↓
ADMIN + USERS
```

This creates a complete end-to-end parking reservation workflow.

---

# 📌 Project Summary

**SmartPark** is a full-stack web application designed to make parking easier and more predictable.

Users can discover nearby parking, check availability and pricing, and reserve a parking space before reaching their destination.

Admins can manage parking locations, capacities, prices, availability, and bookings.

The project demonstrates practical implementation of:

* React
* Node.js
* Express
* MongoDB
* Firebase Authentication
* REST APIs
* Socket.IO
* Maps integration
* Booking systems
* Payment integration
* Role-based authorization
* Real-time data synchronization

---

# 👩‍💻 Author

**Shruti Padwal**

Built as a full-stack development project to solve a real-world parking problem.
