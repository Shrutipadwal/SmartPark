import mongoose from "mongoose";

const parkingLotSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    address: { type: String, required: true, trim: true },
    contactPhone: { type: String, default: "", trim: true },
    distance: { type: Number, default: 0, min: 0 },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    bikeCapacity: { type: Number, required: true, min: 1 },
    carCapacity: { type: Number, required: true, min: 1 },
    bikeAvailable: { type: Number, required: true, min: 0 },
    carAvailable: { type: Number, required: true, min: 0 },
    bikePricePerHour: { type: Number, required: true, min: 0 },
    carPricePerHour: { type: Number, required: true, min: 0 },
    parkingType: { type: String, enum: ["FREE", "PAID"], default: "PAID" },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
  },
  { timestamps: true },
);

// Availability can never be larger than the configured capacity.
parkingLotSchema.path("bikeAvailable").validate(function (value) {
  return value <= this.bikeCapacity;
}, "Bike availability cannot exceed capacity.");
parkingLotSchema.path("carAvailable").validate(function (value) {
  return value <= this.carCapacity;
}, "Car availability cannot exceed capacity.");

export default mongoose.model("ParkingLot", parkingLotSchema);
