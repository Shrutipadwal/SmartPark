// ============================================
// EMAIL SERVICE INTEGRATION EXAMPLES
// ============================================
// This file shows where and how to use the email service in your routes

// ============================================
// 1. BOOKING CONFIRMATION
// ============================================
// Add this to your booking creation route (e.g., in routes/bookings.js or server.js)

/*
import { sendBookingConfirmation } from '../services/emailService.js';

// After successful booking creation
const booking = await Booking.create({
  userId: req.user.id,
  parkingLotId: req.body.parkingLotId,
  date: req.body.date,
  startTime: req.body.startTime,
  endTime: req.body.endTime,
  // ... other fields
});

// Send confirmation email
const user = await User.findById(req.user.id);
await sendBookingConfirmation(user.email, {
  bookingId: booking._id,
  parkingLotName: booking.parkingLotName,
  date: booking.date,
  time: `${booking.startTime} - ${booking.endTime}`,
  duration: calculateDuration(booking.startTime, booking.endTime),
  price: booking.totalPrice,
});

res.status(201).json({ success: true, booking });
*/

// ============================================
// 2. BOOKING CANCELLATION
// ============================================
// Add this to your booking cancellation route

/*
import { sendCancellationEmail } from '../services/emailService.js';

// When cancelling a booking
const booking = await Booking.findByIdAndUpdate(
  req.params.bookingId,
  { status: 'cancelled' },
  { new: true }
);

const user = await User.findById(req.user.id);

// Send cancellation email
await sendCancellationEmail(user.email, {
  bookingId: booking._id,
  price: booking.totalPrice,
});

res.json({ success: true, message: 'Booking cancelled successfully' });
*/

// ============================================
// 3. PAYMENT RECEIPT
// ============================================
// Add this to your payment success endpoint (after Razorpay verification)

/*
import { sendPaymentReceipt } from '../services/emailService.js';

// After successful payment verification
const booking = await Booking.findByIdAndUpdate(
  bookingId,
  { paymentStatus: 'paid', status: 'confirmed' },
  { new: true }
);

const user = await User.findById(booking.userId);

// Send payment receipt
await sendPaymentReceipt(user.email, {
  transactionId: razorpayPaymentId,
  amount: booking.totalPrice,
  date: new Date().toLocaleDateString(),
  bookingId: booking._id,
});

res.json({ success: true, message: 'Payment received' });
*/

// ============================================
// 4. WELCOME EMAIL (User Registration)
// ============================================
// Add this to your user registration route

/*
import { sendWelcomeEmail } from '../services/emailService.js';

// After user registration
const user = await User.create({
  name: req.body.name,
  email: req.body.email,
  password: hashedPassword,
  // ... other fields
});

// Send welcome email
await sendWelcomeEmail(user.email, user.name);

res.status(201).json({ success: true, user });
*/

// ============================================
// 5. PARKING OWNER REQUEST NOTIFICATION
// ============================================
// Add this to your parking owner request route

/*
import { sendOwnerNotification } from '../services/emailService.js';

// When a new owner request is received
const ownerRequest = await ParkingOwnerRequest.create({
  name: req.body.name,
  email: req.body.email,
  phone: req.body.phone,
  location: req.body.location,
  spacesAvailable: req.body.spacesAvailable,
  message: req.body.message,
});

// Send notification to admin/business email
const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartpark.com';
await sendOwnerNotification(adminEmail, {
  name: ownerRequest.name,
  email: ownerRequest.email,
  phone: ownerRequest.phone,
  location: ownerRequest.location,
  spacesAvailable: ownerRequest.spacesAvailable,
  message: ownerRequest.message,
});

res.status(201).json({ success: true, message: 'Request submitted' });
*/

// ============================================
// COMPLETE EXAMPLE: Booking Route with Email
// ============================================
// Copy this as a reference for a complete route

/*
import express from 'express';
import { sendBookingConfirmation, sendCancellationEmail } from '../services/emailService.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

const router = express.Router();

// Create booking
router.post('/bookings', async (req, res) => {
  try {
    const booking = await Booking.create({
      userId: req.user.id,
      parkingLotId: req.body.parkingLotId,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      totalPrice: req.body.totalPrice,
    });

    // Get user email
    const user = await User.findById(req.user.id);

    // Send confirmation email
    const emailResult = await sendBookingConfirmation(user.email, {
      bookingId: booking._id,
      parkingLotName: 'Parking Lot Name', // Get from parking lot data
      date: booking.date,
      time: `${booking.startTime} - ${booking.endTime}`,
      duration: '2 hours', // Calculate based on start/end time
      price: booking.totalPrice,
    });

    res.status(201).json({
      success: true,
      booking,
      emailSent: emailResult.success,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel booking
router.delete('/bookings/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { status: 'cancelled' },
      { new: true }
    );

    const user = await User.findById(req.user.id);

    // Send cancellation email
    await sendCancellationEmail(user.email, {
      bookingId: booking._id,
      price: booking.totalPrice,
    });

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
*/

// ============================================
// ENVIRONMENT VARIABLES CHECKLIST
// ============================================
/*
✅ Add these to your .env file:

BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_account_email@example.com
BREVO_SMTP_PASSWORD=your_generated_brevo_api_key
SENDER_EMAIL=noreply@smartpark.com
ADMIN_EMAIL=admin@smartpark.com (optional, for owner requests)

Where to get credentials:
1. Go to Brevo.com and create account
2. Verify your email
3. Go to Settings → SMTP & API
4. Generate SMTP key
5. Copy the SMTP credentials
*/

// ============================================
// TESTING THE EMAIL SERVICE
// ============================================
/*
To test if emails are working, you can manually call:

import { sendWelcomeEmail } from '../services/emailService.js';

// In your terminal or test file:
await sendWelcomeEmail('your_email@example.com', 'Test User');

Check:
1. Your terminal for success/error messages
2. Your email inbox (and spam folder)
*/
