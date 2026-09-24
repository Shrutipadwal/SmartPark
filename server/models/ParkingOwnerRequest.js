import mongoose from "mongoose";

const parkingOwnerRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parkingName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contactPhone: { type: String, default: "", trim: true },
    message: { type: String, default: "", trim: true },
    latitude: { type: Number, default: 18.5204 },
    longitude: { type: Number, default: 73.8567 },
    bikeCapacity: { type: Number, default: 20, min: 1 },
    carCapacity: { type: Number, default: 10, min: 1 },
    bikePricePerHour: { type: Number, default: 15, min: 0 },
    carPricePerHour: { type: Number, default: 50, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

parkingOwnerRequestSchema.index({ requesterId: 1, status: 1 });

export default mongoose.model("ParkingOwnerRequest", parkingOwnerRequestSchema);
