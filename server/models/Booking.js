import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parkingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingLot",
      required: true,
    },
    vehicleType: { type: String, enum: ["bike", "car"], required: true },
    vehicleNumber: { type: String, default: "", trim: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    razorpayOrderId: { type: String, default: "", index: true },
    razorpayPaymentId: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "REFUNDED"],
      default: "PENDING",
    },
    bookingStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CHECKED_IN",
        "COMPLETED",
        "CANCELLED",
        "EXPIRED",
      ],
      default: "PENDING",
    },
    qrCodeData: { type: String, default: "" },
  },
  { timestamps: true },
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ parkingId: 1, startTime: 1, endTime: 1 });

export default mongoose.model("Booking", bookingSchema);
