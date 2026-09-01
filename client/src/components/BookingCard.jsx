import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  QrCode,
  ChevronDown,
  Download,
  Copy,
} from "lucide-react";
import QRCode from "qrcode";

export default function BookingCard({ booking, onCancel, onViewDetails }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (booking.qrCodeData) {
      QRCode.toDataURL(booking.qrCodeData)
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [booking.qrCodeData]);

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(booking.bookingId || "N/A");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `booking-${booking.bookingId}.png`;
    link.click();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "#3b82f6"; // blue
      case "COMPLETED":
        return "#10b981"; // green
      case "CANCELLED":
        return "#ef4444"; // red
      case "PENDING":
        return "#f59e0b"; // amber
      case "CHECKED_IN":
        return "#8b5cf6"; // purple
      default:
        return "#6b7280"; // gray
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      CONFIRMED: "Confirmed",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      PENDING: "Pending",
      CHECKED_IN: "Checked In",
      EXPIRED: "Expired",
    };
    return labels[status] || status;
  };

  const canCancelBooking =
    booking.bookingStatus === "PENDING" ||
    booking.bookingStatus === "CONFIRMED" ||
    booking.bookingStatus === "COMPLETED";

  const getCancelHint = () => {
    if (booking.bookingStatus === "PENDING") return "Payment required";
    if (booking.bookingStatus === "CONFIRMED") return "Cancel available";
    if (booking.bookingStatus === "COMPLETED") return "Cancel available";
    return "Not cancelable";
  };

  const parkingName = booking.parkingId?.name || "Parking Reservation";
  const parkingAddress = booking.parkingId?.address || "Address not available";
  const startDate = booking.startTime ? new Date(booking.startTime) : null;
  const endDate = booking.endTime ? new Date(booking.endTime) : null;

  return (
    <div className="booking-card">
      <div className="booking-card-header">
        <div className="booking-card-title">
          <div className="parking-icon">
            <MapPin size={18} />
          </div>
          <div>
            <h3>{parkingName}</h3>
            <p className="booking-card-address">{parkingAddress}</p>
          </div>
        </div>
        <div
          className="booking-card-status"
          style={{ backgroundColor: getStatusColor(booking.bookingStatus) }}
        >
          {getStatusLabel(booking.bookingStatus)}
        </div>
      </div>

      <div className="booking-card-body">
        <div className="booking-info-grid">
          <div className="booking-info-item">
            <div className="booking-info-label">Booking ID</div>
            <div className="booking-info-value booking-id-display">
              <code>{booking.bookingId || "N/A"}</code>
              <button
                className="copy-button"
                onClick={handleCopyBookingId}
                title="Copy booking ID"
              >
                {copied ? "✓" : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="booking-info-item">
            <div className="booking-info-label">Vehicle</div>
            <div className="booking-info-value">
              <Car size={14} />{" "}
              {booking.vehicleType
                ? booking.vehicleType.charAt(0).toUpperCase() +
                  booking.vehicleType.slice(1)
                : "N/A"}
              {booking.vehicleNumber && (
                <span className="vehicle-number">
                  • {booking.vehicleNumber}
                </span>
              )}
            </div>
          </div>

          <div className="booking-info-item">
            <div className="booking-info-label">Date & Time</div>
            <div className="booking-info-value">
              <Calendar size={14} />
              {startDate && startDate.toLocaleDateString()}
              <br />
              <Clock size={12} />{" "}
              {startDate &&
                startDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
              -{" "}
              {endDate &&
                endDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </div>
          </div>

          <div className="booking-info-item">
            <div className="booking-info-label">Total Amount</div>
            <div className="booking-info-value booking-amount">
              ₹{booking.amount || "0"}
            </div>
          </div>
        </div>

        {booking.checkedInAt && (
          <div className="booking-checkin-info">
            ✓ Checked in at {new Date(booking.checkedInAt).toLocaleString()}
          </div>
        )}

        {booking.checkedOutAt && (
          <div className="booking-checkout-info">
            ✓ Checked out at {new Date(booking.checkedOutAt).toLocaleString()}
          </div>
        )}
      </div>

      <div className="booking-card-actions">
        <button
          className="card-action-btn qr-btn"
          onClick={() => setShowQR(!showQR)}
          title="Show QR code"
        >
          <QrCode size={16} /> QR Code
        </button>
        <button
          className="card-action-btn details-btn"
          onClick={() => onViewDetails(booking)}
          title="View full details"
        >
          <ChevronDown size={16} /> Details
        </button>
        {canCancelBooking ? (
          <button
            className="card-action-btn cancel-btn"
            onClick={() => onCancel(booking)}
            title="Cancel booking"
          >
            Cancel
          </button>
        ) : null}
      </div>

      {canCancelBooking && (
        <div className="booking-status-hint">{getCancelHint()}</div>
      )}

      {showQR && qrDataUrl && (
        <div className="booking-qr-section">
          <div className="qr-display">
            <img
              src={qrDataUrl}
              alt="Booking QR Code"
              className="qr-code-image"
            />
            <p className="qr-instruction">
              Scan this QR code at the parking lot to check-in
            </p>
            <button className="download-qr-btn" onClick={handleDownloadQR}>
              <Download size={14} /> Download QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
