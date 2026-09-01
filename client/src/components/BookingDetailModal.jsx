import {
  X,
  Calendar,
  Clock,
  MapPin,
  Car,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function BookingDetailModal({ booking, onClose }) {
  const startDate = booking.startTime ? new Date(booking.startTime) : null;
  const endDate = booking.endTime ? new Date(booking.endTime) : null;
  const createdDate = booking.createdAt ? new Date(booking.createdAt) : null;

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
      case "CONFIRMED":
      case "CHECKED_IN":
        return <CheckCircle size={20} color="#10b981" />;
      case "PENDING":
        return <AlertCircle size={20} color="#f59e0b" />;
      default:
        return <AlertCircle size={20} color="#6b7280" />;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "#dbeafe";
      case "COMPLETED":
        return "#d1fae5";
      case "CANCELLED":
        return "#fee2e2";
      case "PENDING":
        return "#fef3c7";
      case "CHECKED_IN":
        return "#ede9fe";
      default:
        return "#f3f4f6";
    }
  };

  const getStatusText = (status) => {
    const labels = {
      CONFIRMED: "Confirmed",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      PENDING: "Pending Payment",
      CHECKED_IN: "Checked In",
      EXPIRED: "Expired",
    };
    return labels[status] || status;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="booking-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-modal"
          onClick={onClose}
          aria-label="Close details"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="detail-modal-header">
          <div>
            <h2>{booking.parkingId?.name || "Parking Reservation"}</h2>
            <p className="detail-modal-address">
              <MapPin size={14} />{" "}
              {booking.parkingId?.address || "Address not available"}
            </p>
          </div>
          <div
            className="detail-status"
            style={{ backgroundColor: getStatusBgColor(booking.bookingStatus) }}
          >
            {getStatusIcon(booking.bookingStatus)}
            <span>{getStatusText(booking.bookingStatus)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="detail-modal-content">
          {/* Booking ID */}
          <div className="detail-section">
            <h3 className="detail-section-title">Booking Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Booking ID</label>
                <code className="detail-code">
                  {booking.bookingId || "N/A"}
                </code>
              </div>
              <div className="detail-item">
                <label>Booking Date</label>
                <p>{createdDate ? createdDate.toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="detail-section">
            <h3 className="detail-section-title">Reservation Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>
                  <Calendar size={14} /> Check-in Date
                </label>
                <p>{startDate ? startDate.toLocaleDateString() : "N/A"}</p>
              </div>
              <div className="detail-item">
                <label>
                  <Clock size={14} /> Check-in Time
                </label>
                <p>
                  {startDate
                    ? startDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </p>
              </div>
              <div className="detail-item">
                <label>
                  <Clock size={14} /> Check-out Time
                </label>
                <p>
                  {endDate
                    ? endDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </p>
              </div>
              <div className="detail-item">
                <label>Duration</label>
                <p>
                  {startDate && endDate
                    ? `${Math.round((endDate - startDate) / (1000 * 60 * 60))} hours`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="detail-section">
            <h3 className="detail-section-title">Vehicle Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>
                  <Car size={14} /> Vehicle Type
                </label>
                <p>
                  {booking.vehicleType
                    ? booking.vehicleType.charAt(0).toUpperCase() +
                      booking.vehicleType.slice(1)
                    : "N/A"}
                </p>
              </div>
              <div className="detail-item">
                <label>Vehicle Number</label>
                <p className="vehicle-plate">
                  {booking.vehicleNumber || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="detail-section">
            <h3 className="detail-section-title">Payment Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>
                  <CreditCard size={14} /> Amount
                </label>
                <p className="detail-amount">₹{booking.amount || "0"}</p>
              </div>
              <div className="detail-item">
                <label>Payment Status</label>
                <p>
                  <span
                    className="payment-status-badge"
                    style={{
                      backgroundColor:
                        booking.paymentStatus === "PAID"
                          ? "#d1fae5"
                          : "#fef3c7",
                      color:
                        booking.paymentStatus === "PAID"
                          ? "#065f46"
                          : "#92400e",
                    }}
                  >
                    {booking.paymentStatus || "PENDING"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Check-in/out History */}
          {(booking.checkedInAt || booking.checkedOutAt) && (
            <div className="detail-section">
              <h3 className="detail-section-title">Check-in/Check-out</h3>
              <div className="detail-timeline">
                {booking.checkedInAt && (
                  <div className="timeline-item">
                    <span className="timeline-dot"></span>
                    <div>
                      <strong>Checked In</strong>
                      <p>{new Date(booking.checkedInAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {booking.checkedOutAt && (
                  <div className="timeline-item">
                    <span className="timeline-dot"></span>
                    <div>
                      <strong>Checked Out</strong>
                      <p>{new Date(booking.checkedOutAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parking Details */}
          {booking.parkingId && (
            <div className="detail-section">
              <h3 className="detail-section-title">Parking Lot Details</h3>
              <div className="detail-grid">
                {booking.parkingId.bikePricePerHour && (
                  <div className="detail-item">
                    <label>Bike Price/Hour</label>
                    <p>₹{booking.parkingId.bikePricePerHour}</p>
                  </div>
                )}
                {booking.parkingId.carPricePerHour && (
                  <div className="detail-item">
                    <label>Car Price/Hour</label>
                    <p>₹{booking.parkingId.carPricePerHour}</p>
                  </div>
                )}
                {booking.parkingId.bikeCapacity && (
                  <div className="detail-item">
                    <label>Bike Capacity</label>
                    <p>{booking.parkingId.bikeCapacity} spaces</p>
                  </div>
                )}
                {booking.parkingId.carCapacity && (
                  <div className="detail-item">
                    <label>Car Capacity</label>
                    <p>{booking.parkingId.carCapacity} spaces</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="detail-modal-footer">
          <button className="primary-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
