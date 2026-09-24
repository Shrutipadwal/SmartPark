import "dotenv/config";
import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import { Server } from "socket.io";
import { connectDatabase } from "./config/database.js";
import Booking from "./models/Booking.js";
import ParkingLot from "./models/ParkingLot.js";
import ParkingOwnerRequest from "./models/ParkingOwnerRequest.js";
import User from "./models/User.js";
import {
  getFirebaseAdminAuth,
  requireAdmin,
  requireFirebaseUser,
  requireSuperAdmin,
} from "./middleware/auth.js";
import {
  sendBookingConfirmation,
  sendCancellationEmail,
  sendPaymentReceipt,
  sendOwnerNotification,
  sendWelcomeEmail,
  sendCustomEmail,
  sendAdminBookingNotification,
  sendBookingStatusEmail,
  sendBookingReminderEmail,
} from "./services/emailService.js";

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 5000;
let databaseEnabled = false;
let demoUser = null;

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  ...(process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header are local tools such as PowerShell.
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by SmartPark CORS."));
    },
  }),
);

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
    return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

async function confirmPaidBooking(orderId, paymentId) {
  const booking = await Booking.findOneAndUpdate(
    {
      razorpayOrderId: orderId,
      bookingStatus: "PENDING",
      paymentStatus: "PENDING",
    },
    {
      $set: {
        razorpayPaymentId: paymentId,
        paymentStatus: "PAID",
        bookingStatus: "CONFIRMED",
      },
    },
    { returnDocument: "after" },
  );
  return booking;
}

// Webhooks need the original request bytes for HMAC verification.
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = request.headers["x-razorpay-signature"];
    if (!webhookSecret || !signature)
      return response
        .status(400)
        .json({ message: "Webhook signature is required." });
    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(request.body)
      .digest("hex");
    const received = Buffer.from(String(signature));
    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), received)
    )
      return response
        .status(400)
        .json({ message: "Invalid webhook signature." });
    try {
      const event = JSON.parse(request.body.toString("utf8"));
      if (event.event === "payment.captured" || event.event === "order.paid") {
        const payment = event.payload?.payment?.entity;
        const order = event.payload?.order?.entity;
        await confirmPaidBooking(
          payment?.order_id || order?.id,
          payment?.id || "webhook",
        );
      }
      return response.json({ received: true });
    } catch {
      return response.status(400).json({ message: "Invalid webhook payload." });
    }
  },
);

app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: [...allowedOrigins],
  },
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  const firebaseAuth = getFirebaseAdminAuth();
  if (!firebaseAuth || !token)
    return next(new Error("Authentication required"));
  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decoded.uid }).lean();
    if (!["ADMIN", "SUPER_ADMIN"].includes(user?.role)) {
      return next(new Error("Admin access required"));
    }
    socket.userId = user._id;
    socket.role = user.role;
    return next();
  } catch {
    return next(new Error("Invalid authentication token"));
  }
});

io.on("connection", (socket) => {
  if (socket.role === "ADMIN") socket.join(`admin:${socket.userId}`);
});

// Temporary seed data keeps the API useful before MongoDB is configured.
const parkingLots = [
  {
    id: "lot-1",
    name: "Riverside Market",
    address: "12 M.G. Road, Koregaon Park",
    distance: 0.3,
    bikeAvailable: 24,
    bikeCapacity: 40,
    carAvailable: 8,
    carCapacity: 18,
    bikePrice: 15,
    carPrice: 45,
    parkingType: "PAID",
    latitude: 18.5362,
    longitude: 73.8937,
  },
  {
    id: "lot-2",
    name: "Central Plaza Parking",
    address: "88 Bund Garden Road, Pune",
    distance: 0.7,
    bikeAvailable: 46,
    bikeCapacity: 60,
    carAvailable: 21,
    carCapacity: 30,
    bikePrice: 20,
    carPrice: 55,
    parkingType: "PAID",
    latitude: 18.5314,
    longitude: 73.8777,
  },
  {
    id: "lot-3",
    name: "Station Link Parking",
    address: "Near Pune Railway Station",
    distance: 1.1,
    bikeAvailable: 5,
    bikeCapacity: 50,
    carAvailable: 0,
    carCapacity: 25,
    bikePrice: 10,
    carPrice: 40,
    parkingType: "PAID",
    latitude: 18.5292,
    longitude: 73.8745,
  },
  {
    id: "lot-shukrawar-peth",
    name: "Shukrawar Peth Parking",
    address: "Shukrawar Peth, Pune",
    distance: 1.4,
    bikeAvailable: 32,
    bikeCapacity: 50,
    carAvailable: 12,
    carCapacity: 22,
    bikePrice: 15,
    carPrice: 50,
    parkingType: "PAID",
    latitude: 18.5108,
    longitude: 73.8553,
  },
];

function toParkingResponse(lot) {
  return {
    id: String(lot._id || lot.id),
    name: lot.name,
    address: lot.address,
    contactPhone: lot.contactPhone || "",
    distance: lot.distance || 0,
    bikeAvailable: lot.bikeAvailable,
    bikeCapacity: lot.bikeCapacity,
    carAvailable: lot.carAvailable,
    carCapacity: lot.carCapacity,
    bikePrice: lot.bikePricePerHour ?? lot.bikePrice,
    carPrice: lot.carPricePerHour ?? lot.carPrice,
    parkingType: lot.parkingType,
    latitude: lot.latitude,
    longitude: lot.longitude,
  };
}

async function seedDatabase() {
  // No seeded users or admins are created here. Users are created only when they log in.
}

async function expireStaleBookings() {
  if (!databaseEnabled) return;
  const staleBookings = await Booking.find({
    bookingStatus: { $in: ["PENDING", "CONFIRMED"] },
    endTime: { $lt: new Date() },
  }).lean();
  for (const booking of staleBookings) {
    const expired = await Booking.updateOne(
      { _id: booking._id, bookingStatus: { $in: ["PENDING", "CONFIRMED"] } },
      { $set: { bookingStatus: "EXPIRED" } },
    );
    if (expired.modifiedCount) {
      await ParkingLot.updateOne(
        { _id: booking.parkingId },
        { $inc: { [`${booking.vehicleType}Available`]: 1 } },
      );
    }
  }
}

async function sendUpcomingBookingReminders() {
  if (!databaseEnabled) return;
  const now = new Date();
  const reminderWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const booking = await Booking.findOneAndUpdate(
    {
      bookingStatus: "CONFIRMED",
      startTime: { $gt: now, $lte: reminderWindow },
      reminderSentAt: null,
    },
    { $set: { reminderSentAt: now } },
    { returnDocument: "after" },
  )
    .populate("userId", "name email")
    .populate("parkingId", "name")
    .lean();
  if (!booking?.userId?.email || !booking.parkingId?.name) return;
  await sendBookingReminderEmail(booking.userId.email, {
    bookingId: booking.bookingId,
    parkingLotName: booking.parkingId.name,
    startTime: booking.startTime.toLocaleString(),
  });
}

app.get("/", (_request, response) => {
  response.json({
    service: "smartpark-api",
    status: "running",
    health: "/api/health",
    parking: "/api/parking",
  });
});

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "smartpark-api" });
});

app.get("/api/users/me", requireFirebaseUser, (request, response) => {
  response.json({
    data: {
      id: request.dbUser._id,
      name: request.dbUser.name,
      email: request.dbUser.email,
      phone: request.dbUser.phone || "",
      photoURL: request.dbUser.photoURL,
      role: request.dbUser.role,
    },
  });
});

app.get("/api/bookings/my", requireFirebaseUser, async (request, response) => {
  if (!databaseEnabled) return response.json({ data: [] });
  await expireStaleBookings();
  const bookings = await Booking.find({ userId: request.dbUser._id })
    .populate("parkingId", "name address")
    .sort({ createdAt: -1 })
    .lean();
  response.json({ data: bookings });
});

app.patch(
  "/api/bookings/:id/cancel",
  requireFirebaseUser,
  async (request, response) => {
    if (!databaseEnabled || !mongoose.isValidObjectId(request.params.id))
      return response
        .status(400)
        .json({ message: "A valid booking ID is required." });
    const session = await mongoose.startSession();
    try {
      let cancelledBooking;
      await session.withTransaction(async () => {
        cancelledBooking = await Booking.findOneAndUpdate(
          {
            _id: request.params.id,
            userId: request.dbUser._id,
            bookingStatus: { $in: ["PENDING", "CONFIRMED", "COMPLETED"] },
          },
          { $set: { bookingStatus: "CANCELLED", paymentStatus: "REFUNDED" } },
          { returnDocument: "after", session },
        );
        if (!cancelledBooking) return;
        const availabilityKey = `${cancelledBooking.vehicleType}Available`;
        await ParkingLot.updateOne(
          { _id: cancelledBooking.parkingId },
          { $inc: { [availabilityKey]: 1 } },
          { session },
        );
      });
      if (!cancelledBooking)
        return response
          .status(409)
          .json({ message: "This booking cannot be cancelled." });

      // Send cancellation email in background (non-blocking)
      const user = await User.findById(request.dbUser._id).lean();
      if (user?.email) {
        sendCancellationEmail(user.email, {
          bookingId: cancelledBooking.bookingId,
          price: cancelledBooking.amount,
        }).catch((err) =>
          console.error("❌ Error sending cancellation email:", err.message),
        );
      }

      return response.json({
        data: { bookingId: cancelledBooking.bookingId, status: "CANCELLED" },
      });
    } finally {
      await session.endSession();
    }
  },
);

app.post(
  "/api/payments/create-order",
  requireFirebaseUser,
  async (request, response) => {
    if (!databaseEnabled)
      return response
        .status(503)
        .json({ message: "Database is not available." });
    const razorpay = getRazorpay();
    if (!razorpay)
      return response
        .status(503)
        .json({ message: "Razorpay is not configured." });
    const booking = await Booking.findOne({
      bookingId: request.body.bookingId,
      userId: request.dbUser._id,
      bookingStatus: "PENDING",
      paymentStatus: "PENDING",
    });
    if (!booking)
      return response
        .status(404)
        .json({ message: "Pending booking not found." });
    const order = await razorpay.orders.create({
      amount: Math.round(booking.amount * 100),
      currency: "INR",
      receipt: booking.bookingId,
      notes: { bookingId: booking.bookingId },
    });
    booking.razorpayOrderId = order.id;
    await booking.save();
    return response.json({
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  },
);

app.post(
  "/api/payments/verify",
  requireFirebaseUser,
  async (request, response) => {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = request.body;
    if (!orderId || !paymentId || !signature)
      return response
        .status(400)
        .json({ message: "Payment verification fields are required." });
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    if (expected !== signature)
      return response
        .status(400)
        .json({ message: "Invalid payment signature." });
    const ownedBooking = await Booking.findOne({
      razorpayOrderId: orderId,
      userId: request.dbUser._id,
    });
    if (!ownedBooking)
      return response
        .status(404)
        .json({ message: "Payment booking not found." });
    const booking = await confirmPaidBooking(orderId, paymentId);
    if (!booking)
      return response
        .status(409)
        .json({ message: "This booking is no longer awaiting payment." });

    const user = await User.findById(request.dbUser._id).lean();
    const parkingLot = await ParkingLot.findById(booking.parkingId).lean();
    const owner = parkingLot
      ? await User.findById(parkingLot.ownerId).lean()
      : null;
    const details = parkingLot
      ? {
          bookingId: booking.bookingId,
          parkingLotName: parkingLot.name,
          time: `${booking.startTime.toLocaleString()} - ${booking.endTime.toLocaleString()}`,
          price: booking.amount,
          customerName: user?.name || "Customer",
          customerEmail: user?.email || "Unavailable",
          customerPhone: user?.phone || "",
          vehicleType: booking.vehicleType,
          vehicleNumber: booking.vehicleNumber,
        }
      : null;
    if (user?.email) {
      if (details) {
        sendBookingConfirmation(user.email, {
          ...details,
          date: booking.startTime.toLocaleDateString(),
          duration: `${Math.max(1, Math.round((booking.endTime - booking.startTime) / 3600000))} hours`,
          qrCodeData: booking.qrCodeData,
        }).catch((err) =>
          console.error("❌ Error sending booking confirmation:", err.message),
        );
      }
      sendPaymentReceipt(user.email, {
        transactionId: paymentId,
        amount: booking.amount,
        date: new Date().toLocaleDateString(),
        bookingId: booking.bookingId,
      }).catch((err) =>
        console.error("❌ Error sending payment receipt:", err.message),
      );
    }
    if (owner?.email && details) {
      sendAdminBookingNotification(owner.email, details).catch((err) =>
        console.error(
          "❌ Error sending admin booking notification:",
          err.message,
        ),
      );
    }

    return response.json({
      data: {
        bookingId: booking.bookingId,
        status: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        qrCodeData: booking.qrCodeData,
      },
    });
  },
);

app.post(
  "/api/owner-requests",
  requireFirebaseUser,
  async (request, response) => {
    if (!databaseEnabled)
      return response
        .status(503)
        .json({ message: "Database is not available." });
    const {
      parkingName,
      address,
      contactPhone = "",
      message = "",
      latitude = 18.5204,
      longitude = 73.8567,
      bikeCapacity = 20,
      carCapacity = 10,
      bikePricePerHour = 15,
      carPricePerHour = 50,
    } = request.body;
    if (!parkingName?.trim() || !address?.trim() || !contactPhone?.trim()) {
      return response.status(400).json({
        message: "Parking name, address, and contact phone are required.",
      });
    }
    const capacities = [bikeCapacity, carCapacity].map(Number);
    const prices = [bikePricePerHour, carPricePerHour].map(Number);
    if (
      capacities.some((value) => !Number.isInteger(value) || value < 1) ||
      prices.some((value) => !Number.isFinite(value) || value < 0)
    )
      return response
        .status(400)
        .json({ message: "Parking capacities and prices are invalid." });
    const existing = await ParkingOwnerRequest.findOne({
      requesterId: request.dbUser._id,
      status: "APPROVED",
    });
    if (existing)
      return response
        .status(409)
        .json({ message: "Your account already has parking-owner access." });

    const ownerRequest = await ParkingOwnerRequest.create({
      requesterId: request.dbUser._id,
      parkingName,
      address,
      contactPhone: contactPhone.trim(),
      message,
      latitude: Number(latitude),
      longitude: Number(longitude),
      bikeCapacity: capacities[0],
      carCapacity: capacities[1],
      bikePricePerHour: prices[0],
      carPricePerHour: prices[1],
      status: "PENDING",
    });

    // Send notification email to admin in background (non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL || "admin@smartpark.com";
    const requester = await User.findById(request.dbUser._id).lean();
    if (adminEmail && requester?.email) {
      sendOwnerNotification(adminEmail, {
        name: requester.name || "Requester",
        email: requester.email,
        phone: requester.phone || "N/A",
        location: address,
        spacesAvailable: `Bike: ${capacities[0]}, Car: ${capacities[1]}`,
        message: message || "New parking owner request received",
      }).catch((err) =>
        console.error("❌ Error sending owner notification:", err.message),
      );
    }

    return response.status(201).json({
      data: {
        id: ownerRequest._id,
        status: ownerRequest.status,
        role: request.dbUser.role,
      },
    });
  },
);

app.get(
  "/api/admin/members",
  requireFirebaseUser,
  requireSuperAdmin,
  async (_request, response) => {
    if (!databaseEnabled)
      return response
        .status(503)
        .json({ message: "Database is not available." });
    const members = await User.find({ role: { $in: ["ADMIN", "SUPER_ADMIN"] } })
      .select("name email role createdAt")
      .sort({ role: 1, createdAt: -1 })
      .lean();
    const data = await Promise.all(
      members.map(async (member) => ({
        ...member,
        id: String(member._id),
        parkingCount: await ParkingLot.countDocuments({ ownerId: member._id }),
      })),
    );
    return response.json({ data });
  },
);

app.get(
  "/api/admin/owner-requests",
  requireFirebaseUser,
  requireSuperAdmin,
  async (_request, response) => {
    if (!databaseEnabled)
      return response
        .status(503)
        .json({ message: "Database is not available." });
    await expireStaleBookings();
    const requests = await ParkingOwnerRequest.find()
      .populate("requesterId", "name email")
      .sort({ createdAt: -1 })
      .lean();
    return response.json({ data: requests });
  },
);

app.patch(
  "/api/admin/owner-requests/:id",
  requireFirebaseUser,
  requireSuperAdmin,
  async (request, response) => {
    if (!databaseEnabled || !mongoose.isValidObjectId(request.params.id))
      return response
        .status(400)
        .json({ message: "A valid request ID is required." });
    const { decision } = request.body;
    if (!["APPROVED", "REJECTED"].includes(decision))
      return response
        .status(400)
        .json({ message: "Decision must be APPROVED or REJECTED." });
    const ownerRequest = await ParkingOwnerRequest.findOneAndUpdate(
      { _id: request.params.id, status: "PENDING" },
      { status: decision, reviewedAt: new Date() },
      { returnDocument: "after" },
    );
    if (!ownerRequest)
      return response
        .status(404)
        .json({ message: "Pending owner request not found." });
    if (decision === "APPROVED") {
      await User.updateOne(
        { _id: ownerRequest.requesterId },
        { $set: { role: "ADMIN" } },
      );
      await ParkingLot.create({
        ownerId: ownerRequest.requesterId,
        name: ownerRequest.parkingName,
        address: ownerRequest.address,
        latitude: ownerRequest.latitude,
        longitude: ownerRequest.longitude,
        bikeCapacity: ownerRequest.bikeCapacity,
        carCapacity: ownerRequest.carCapacity,
        bikeAvailable: ownerRequest.bikeCapacity,
        carAvailable: ownerRequest.carCapacity,
        bikePricePerHour: ownerRequest.bikePricePerHour,
        carPricePerHour: ownerRequest.carPricePerHour,
        parkingType: "PAID",
        openingTime: "08:00",
        closingTime: "22:00",
      });
    }

    const requester = await User.findById(ownerRequest.requesterId).lean();
    if (requester?.email) {
      const subject =
        decision === "APPROVED"
          ? "🎉 Parking Owner Request Approved!"
          : "❌ Parking Owner Request Rejected";
      const html =
        decision === "APPROVED"
          ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #27ae60;">✅ Your Request Has Been Approved!</h1>
            <p>Congratulations! Your parking owner request for <strong>${ownerRequest.parkingName}</strong> has been approved.</p>
            <p>You now have access to the admin panel to manage your parking lot.</p>
            <p style="color: #7f8c8d; font-size: 12px;">For support, contact us at support@smartpark.com</p>
          </div>
        `
          : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #e74c3c;">❌ Your Request Was Not Approved</h1>
            <p>Your parking owner request for <strong>${ownerRequest.parkingName}</strong> has been rejected.</p>
            <p>If you have questions, please contact our support team.</p>
            <p style="color: #7f8c8d; font-size: 12px;">For support, contact us at support@smartpark.com</p>
          </div>
        `;

      sendCustomEmail(requester.email, subject, html).catch((err) =>
        console.error("Error sending owner decision email:", err),
      );
    }

    return response.json({ data: { id: ownerRequest._id, status: decision } });
  },
);

app.get(
  "/api/admin/dashboard",
  requireFirebaseUser,
  requireAdmin,
  async (request, response) => {
    if (!databaseEnabled)
      return response
        .status(503)
        .json({ message: "Database is not available." });
    if (request.dbUser.role === "SUPER_ADMIN") {
      return response.json({
        data: {
          totalParkingLots: 0,
          totalBookings: 0,
          activeBookings: 0,
          availableBikeSlots: 0,
          availableCarSlots: 0,
        },
      });
    }
    await expireStaleBookings();
    const ownedParkingIds = await ParkingLot.find({
      ownerId: request.dbUser._id,
    }).distinct("_id");
    const [parkingCount, bookingCount, activeCount, parking] =
      await Promise.all([
        ownedParkingIds.length,
        Booking.countDocuments({ parkingId: { $in: ownedParkingIds } }),
        Booking.countDocuments({
          parkingId: { $in: ownedParkingIds },
          bookingStatus: { $in: ["CONFIRMED", "CHECKED_IN"] },
        }),
        ParkingLot.find({ _id: { $in: ownedParkingIds } })
          .select("name bikeAvailable carAvailable bikeCapacity carCapacity")
          .lean(),
      ]);
    response.json({
      data: {
        totalParkingLots: parkingCount,
        totalBookings: bookingCount,
        activeBookings: activeCount,
        availableBikeSlots: parking.reduce(
          (total, lot) => total + lot.bikeAvailable,
          0,
        ),
        availableCarSlots: parking.reduce(
          (total, lot) => total + lot.carAvailable,
          0,
        ),
      },
    });
  },
);

app.get(
  "/api/admin/parking",
  requireFirebaseUser,
  requireAdmin,
  async (request, response) => {
    if (!databaseEnabled)
      return response
        .status(503)
        .json({ message: "Database is not available." });
    const parking = await ParkingLot.find({ ownerId: request.dbUser._id })
      .sort({ createdAt: -1 })
      .lean();
    response.json({ data: parking.map(toParkingResponse) });
  },
);

app.get(
  "/api/admin/bookings",
  requireFirebaseUser,
  requireAdmin,
  async (request, response) => {
    if (!databaseEnabled)
      return response
        .status(503)
        .json({ message: "Database is not available." });
    if (request.dbUser.role === "SUPER_ADMIN")
      return response.json({ data: [] });
    const ownedParkingIds = await ParkingLot.find({
      ownerId: request.dbUser._id,
    }).distinct("_id");
    const bookings = await Booking.find({ parkingId: { $in: ownedParkingIds } })
      .populate("userId", "name email phone photoURL role")
      .populate("parkingId", "name address contactPhone")
      .sort({ createdAt: -1 })
      .lean();
    response.json({ data: bookings });
  },
);

app.post(
  "/api/admin/parking",
  requireFirebaseUser,
  requireAdmin,
  async (request, response) => {
    if (!databaseEnabled)
      return response
        .status(503)
        .json({ message: "Database is not available." });
    const {
      name,
      address,
      contactPhone = "",
      latitude,
      longitude,
      bikeCapacity,
      carCapacity,
      bikePricePerHour,
      carPricePerHour,
      openingTime = "08:00",
      closingTime = "22:00",
      parkingType = "PAID",
      description = "",
    } = request.body;
    const capacities = [bikeCapacity, carCapacity].map(Number);
    const prices = [bikePricePerHour, carPricePerHour].map(Number);
    if (
      !name ||
      !address ||
      !contactPhone.trim() ||
      capacities.some((value) => !Number.isInteger(value) || value < 1) ||
      prices.some((value) => !Number.isFinite(value) || value < 0)
    ) {
      return response.status(400).json({
        message:
          "Name, address, contact phone, positive capacities, and valid prices are required.",
      });
    }
    const parking = await ParkingLot.create({
      ownerId: request.dbUser._id,
      name,
      address,
      contactPhone: contactPhone.trim(),
      description,
      latitude: Number(latitude),
      longitude: Number(longitude),
      bikeCapacity: capacities[0],
      carCapacity: capacities[1],
      bikeAvailable: capacities[0],
      carAvailable: capacities[1],
      bikePricePerHour: prices[0],
      carPricePerHour: prices[1],
      openingTime,
      closingTime,
      parkingType,
    });
    response.status(201).json({ data: toParkingResponse(parking) });
  },
);

app.put(
  "/api/admin/parking/:id",
  requireFirebaseUser,
  requireAdmin,
  async (request, response) => {
    if (!databaseEnabled || !mongoose.isValidObjectId(request.params.id)) {
      return response
        .status(400)
        .json({ message: "A valid parking ID is required." });
    }
    const allowedFields = [
      "name",
      "description",
      "address",
      "contactPhone",
      "latitude",
      "longitude",
      "bikeCapacity",
      "carCapacity",
      "bikePricePerHour",
      "carPricePerHour",
      "openingTime",
      "closingTime",
      "parkingType",
    ];
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => request.body[field] !== undefined)
        .map((field) => [field, request.body[field]]),
    );
    if (updates.latitude !== undefined)
      updates.latitude = Number(updates.latitude);
    if (updates.longitude !== undefined)
      updates.longitude = Number(updates.longitude);
    if (updates.contactPhone !== undefined)
      updates.contactPhone = String(updates.contactPhone).trim();
    if (updates.bikeCapacity !== undefined)
      updates.bikeCapacity = Number(updates.bikeCapacity);
    if (updates.carCapacity !== undefined)
      updates.carCapacity = Number(updates.carCapacity);
    if (updates.bikePricePerHour !== undefined)
      updates.bikePricePerHour = Number(updates.bikePricePerHour);
    if (updates.carPricePerHour !== undefined)
      updates.carPricePerHour = Number(updates.carPricePerHour);
    if (
      updates.name === "" ||
      updates.address === "" ||
      [updates.bikePricePerHour, updates.carPricePerHour].some(
        (value) =>
          value !== undefined && (!Number.isFinite(value) || value < 0),
      ) ||
      [updates.bikeCapacity, updates.carCapacity].some(
        (value) =>
          value !== undefined && (!Number.isInteger(value) || value < 1),
      )
    ) {
      return response.status(400).json({
        message: "Name, address, and valid non-negative prices are required.",
      });
    }
    const currentParking = await ParkingLot.findOne({
      _id: request.params.id,
      ownerId: request.dbUser._id,
    });
    if (!currentParking)
      return response
        .status(404)
        .json({ message: "Owned parking lot not found." });
    if (
      updates.bikeCapacity !== undefined &&
      updates.bikeCapacity < currentParking.bikeAvailable
    )
      return response.status(400).json({
        message: "Bike capacity cannot be lower than current availability.",
      });
    if (
      updates.carCapacity !== undefined &&
      updates.carCapacity < currentParking.carAvailable
    )
      return response.status(400).json({
        message: "Car capacity cannot be lower than current availability.",
      });
    const parking = await ParkingLot.findOneAndUpdate(
      { _id: request.params.id, ownerId: request.dbUser._id },
      { $set: updates },
      { returnDocument: "after", runValidators: true },
    ).lean();
    if (!parking)
      return response
        .status(404)
        .json({ message: "Owned parking lot not found." });
    return response.json({ data: toParkingResponse(parking) });
  },
);

app.put(
  "/api/admin/parking/:id/availability",
  requireFirebaseUser,
  requireAdmin,
  async (request, response) => {
    if (!databaseEnabled || !mongoose.isValidObjectId(request.params.id)) {
      return response
        .status(400)
        .json({ message: "A valid parking ID is required." });
    }
    const bikeAvailable = Number(request.body.bikeAvailable);
    const carAvailable = Number(request.body.carAvailable);
    if (
      !Number.isInteger(bikeAvailable) ||
      !Number.isInteger(carAvailable) ||
      bikeAvailable < 0 ||
      carAvailable < 0
    ) {
      return response.status(400).json({
        message:
          "Availability must be whole numbers greater than or equal to zero.",
      });
    }
    const parking = await ParkingLot.findOne({
      _id: request.params.id,
      ownerId: request.dbUser._id,
    });
    if (!parking)
      return response
        .status(404)
        .json({ message: "Owned parking lot not found." });
    if (
      bikeAvailable > parking.bikeCapacity ||
      carAvailable > parking.carCapacity
    ) {
      return response
        .status(400)
        .json({ message: "Availability cannot exceed capacity." });
    }
    parking.bikeAvailable = bikeAvailable;
    parking.carAvailable = carAvailable;
    await parking.save();
    return response.json({ data: toParkingResponse(parking) });
  },
);

app.delete(
  "/api/admin/parking/:id",
  requireFirebaseUser,
  requireAdmin,
  async (request, response) => {
    if (!databaseEnabled || !mongoose.isValidObjectId(request.params.id)) {
      return response
        .status(400)
        .json({ message: "A valid parking ID is required." });
    }
    const deleted = await ParkingLot.findOneAndDelete({
      _id: request.params.id,
      ownerId: request.dbUser._id,
    });
    if (!deleted)
      return response
        .status(404)
        .json({ message: "Owned parking lot not found." });
    return response.status(204).send();
  },
);

app.get("/api/parking", async (request, response) => {
  const { search = "", vehicle = "car", sort = "distance" } = request.query;
  const searchTerm = String(search).toLowerCase();
  const availabilityKey = vehicle === "bike" ? "bikeAvailable" : "carAvailable";
  const priceKey = vehicle === "bike" ? "bikePrice" : "carPrice";
  if (databaseEnabled) {
    const databaseResults = await ParkingLot.find({
      ownerId: { $exists: true, $ne: null },
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { address: { $regex: searchTerm, $options: "i" } },
      ],
    }).lean();
    const results = databaseResults.map(toParkingResponse);
    results.sort((first, second) => {
      if (sort === "price")
        return (
          first[vehicle === "bike" ? "bikePrice" : "carPrice"] -
          second[vehicle === "bike" ? "bikePrice" : "carPrice"]
        );
      if (sort === "availability")
        return (
          second[vehicle === "bike" ? "bikeAvailable" : "carAvailable"] -
          first[vehicle === "bike" ? "bikeAvailable" : "carAvailable"]
        );
      return first.distance - second.distance;
    });
    return response.json({ data: results, count: results.length });
  }

  response.json({ data: [], count: 0 });
});

app.get("/api/parking/:id", async (request, response) => {
  if (!databaseEnabled) {
    return response.status(404).json({ message: "Parking lot not found." });
  }
  if (mongoose.isValidObjectId(request.params.id)) {
    const databaseLot = await ParkingLot.findOne({
      _id: request.params.id,
      ownerId: { $exists: true, $ne: null },
    }).lean();
    if (!databaseLot)
      return response.status(404).json({ message: "Parking lot not found." });
    return response.json({ data: toParkingResponse(databaseLot) });
  }
  return response.status(404).json({ message: "Parking lot not found." });
});

app.post("/api/bookings", requireFirebaseUser, async (request, response) => {
  const {
    parkingId,
    vehicleType = "car",
    vehicleNumber = "",
    phone = "",
    startTime: requestedStartTime,
    durationHours = 2,
  } = request.body;

  if (!String(phone).trim()) {
    return response
      .status(400)
      .json({ message: "A contact phone number is required." });
  }
  await User.updateOne(
    { _id: request.dbUser._id },
    { $set: { phone: String(phone).trim() } },
  );

  if (databaseEnabled) {
    if (
      !mongoose.isValidObjectId(parkingId) ||
      !["bike", "car"].includes(vehicleType) ||
      !Number.isInteger(Number(durationHours)) ||
      Number(durationHours) < 1 ||
      Number(durationHours) > 12
    ) {
      return response
        .status(400)
        .json({ message: "A valid parkingId and vehicleType are required." });
    }

    const availabilityKey =
      vehicleType === "bike" ? "bikeAvailable" : "carAvailable";
    const priceKey =
      vehicleType === "bike" ? "bikePricePerHour" : "carPricePerHour";
    const startTime = requestedStartTime
      ? new Date(requestedStartTime)
      : new Date();
    const endTime = new Date(
      startTime.getTime() + Number(durationHours) * 60 * 60 * 1000,
    );
    if (Number.isNaN(startTime.getTime()) || startTime < new Date()) {
      return response
        .status(400)
        .json({ message: "A valid future start time is required." });
    }
    await expireStaleBookings();
    const session = await mongoose.startSession();
    try {
      let booking;
      await session.withTransaction(async () => {
        const overlappingBookings = await Booking.countDocuments({
          parkingId,
          vehicleType,
          bookingStatus: { $in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        }).session(session);
        const updatedLot = await ParkingLot.findOneAndUpdate(
          {
            _id: parkingId,
            [availabilityKey]: { $gt: 0 },
            [`${vehicleType}Capacity`]: { $gt: overlappingBookings },
          },
          { $inc: { [availabilityKey]: -1 } },
          { returnDocument: "after", session },
        );
        if (!updatedLot) return;
        const bookingId = `SP-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        [booking] = await Booking.create(
          [
            {
              bookingId,
              userId: request.dbUser._id,
              parkingId: updatedLot._id,
              vehicleType,
              vehicleNumber: String(vehicleNumber).trim(),
              startTime,
              endTime,
              amount: updatedLot[priceKey] * Number(durationHours),
              paymentStatus: "PENDING",
              bookingStatus: "PENDING",
              qrCodeData: JSON.stringify({ bookingId, parkingId, vehicleType }),
            },
          ],
          { session },
        );
      });
      if (!booking)
        return response.status(409).json({
          message: "Sorry, this parking became unavailable for that time.",
        });

      const notification = await Booking.findById(booking._id)
        .populate("userId", "name email phone photoURL")
        .populate("parkingId", "name address contactPhone ownerId")
        .lean();
      if (notification?.parkingId?.ownerId) {
        io.to(`admin:${notification.parkingId.ownerId}`).emit(
          "reservation-created",
          notification,
        );
      }
      return response.status(201).json({
        data: {
          bookingId: booking.bookingId,
          parkingId,
          vehicleType,
          amount: booking.amount,
          status: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
        },
      });
    } catch (error) {
      return response
        .status(500)
        .json({ message: "Booking could not be saved." });
    } finally {
      await session.endSession();
    }
  }

  const parkingLot = parkingLots.find((lot) => lot.id === parkingId);
  if (!parkingLot)
    return response.status(404).json({ message: "Parking lot not found." });

  const availabilityKey =
    vehicleType === "bike" ? "bikeAvailable" : "carAvailable";
  // This synchronous guard models the single atomic reservation decision.
  // MongoDB will replace it with a conditional update inside a transaction.
  if (parkingLot[availabilityKey] < 1) {
    return response
      .status(409)
      .json({ message: "Sorry, this parking became unavailable." });
  }

  parkingLot[availabilityKey] -= 1;
  return response.status(201).json({
    data: {
      bookingId: `SP-${Date.now().toString().slice(-6)}`,
      parkingId,
      vehicleType,
      amount:
        (vehicleType === "bike" ? parkingLot.bikePrice : parkingLot.carPrice) *
        2,
      status: "CONFIRMED",
    },
  });
});

// Check-in endpoint
app.post("/api/checkin", requireFirebaseUser, async (request, response) => {
  const { bookingId } = request.body;

  if (!bookingId) {
    return response.status(400).json({ message: "Booking ID is required." });
  }

  if (databaseEnabled) {
    const booking = await Booking.findOne({
      bookingId,
      userId: request.dbUser._id,
    });

    if (!booking) {
      return response.status(404).json({ message: "Booking not found." });
    }

    if (booking.bookingStatus === "CHECKED_IN") {
      return response.status(409).json({ message: "Already checked in." });
    }

    if (booking.bookingStatus !== "CONFIRMED") {
      return response
        .status(409)
        .json({ message: "Booking must be confirmed before check-in." });
    }

    booking.bookingStatus = "CHECKED_IN";
    booking.checkedInAt = new Date();
    await booking.save();
    const checkInUser = await User.findById(request.dbUser._id).lean();
    const checkInParking = await ParkingLot.findById(booking.parkingId)
      .select("name")
      .lean();
    if (checkInUser?.email && checkInParking) {
      sendBookingStatusEmail(checkInUser.email, {
        bookingId: booking.bookingId,
        parkingLotName: checkInParking.name,
        status: "CHECKED IN",
      }).catch((err) =>
        console.error("❌ Error sending check-in email:", err.message),
      );
    }

    return response.json({
      data: {
        bookingId: booking.bookingId,
        status: booking.bookingStatus,
        checkedInAt: booking.checkedInAt,
        message: "Successfully checked in.",
      },
    });
  }

  return response.json({
    data: {
      bookingId,
      status: "CHECKED_IN",
      checkedInAt: new Date(),
      message: "Demo check-in successful.",
    },
  });
});

// Check-out endpoint
app.post("/api/checkout", requireFirebaseUser, async (request, response) => {
  const { bookingId } = request.body;

  if (!bookingId) {
    return response.status(400).json({ message: "Booking ID is required." });
  }

  if (databaseEnabled) {
    const booking = await Booking.findOne({
      bookingId,
      userId: request.dbUser._id,
    });

    if (!booking) {
      return response.status(404).json({ message: "Booking not found." });
    }

    if (booking.bookingStatus === "COMPLETED") {
      return response.status(409).json({ message: "Already checked out." });
    }

    if (booking.bookingStatus !== "CHECKED_IN") {
      return response
        .status(409)
        .json({ message: "Must be checked in before check-out." });
    }

    booking.bookingStatus = "COMPLETED";
    booking.checkedOutAt = new Date();
    await booking.save();
    const checkOutUser = await User.findById(request.dbUser._id).lean();
    const checkOutParking = await ParkingLot.findById(booking.parkingId)
      .select("name")
      .lean();
    if (checkOutUser?.email && checkOutParking) {
      sendBookingStatusEmail(checkOutUser.email, {
        bookingId: booking.bookingId,
        parkingLotName: checkOutParking.name,
        status: "COMPLETED",
      }).catch((err) =>
        console.error("❌ Error sending check-out email:", err.message),
      );
    }

    // Return the parking space
    await ParkingLot.findByIdAndUpdate(booking.parkingId, {
      $inc: { [`${booking.vehicleType}Available`]: 1 },
    });

    return response.json({
      data: {
        bookingId: booking.bookingId,
        status: booking.bookingStatus,
        checkedOutAt: booking.checkedOutAt,
        message: "Successfully checked out.",
      },
    });
  }

  return response.json({
    data: {
      bookingId,
      status: "COMPLETED",
      checkedOutAt: new Date(),
      message: "Demo check-out successful.",
    },
  });
});

app.use((_request, response) => {
  response.status(404).json({ message: "Route not found." });
});

async function startServer() {
  databaseEnabled = await connectDatabase();
  if (databaseEnabled) await seedDatabase();
  if (databaseEnabled) {
    setInterval(
      () => {
        sendUpcomingBookingReminders().catch((error) =>
          console.error("Error sending booking reminder:", error.message),
        );
      },
      60 * 60 * 1000,
    );
  }
  httpServer.listen(port, () => {
    console.log(`SmartPark API listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start SmartPark API:", error.message);
  process.exit(1);
});
