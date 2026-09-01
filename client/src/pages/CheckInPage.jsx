import { useState } from "react";
import { ArrowRight, QrCode } from "lucide-react";

export default function CheckInPage({ bookings, onCheckIn, onCheckOut }) {
  const [qrInput, setQrInput] = useState("");
  const [scannedBooking, setScannedBooking] = useState(null);
  const [message, setMessage] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleScan = () => {
    const booking = bookings.find(
      (b) =>
        b.bookingId === qrInput.trim() ||
        b.qrCodeData?.includes(qrInput.trim()),
    );

    if (!booking) {
      setMessage("❌ Booking not found. Please try again.");
      setScannedBooking(null);
      return;
    }

    if (booking.bookingStatus === "CHECKED_IN") {
      setIsCheckedIn(true);
    }

    setScannedBooking(booking);
    setMessage("");
    setQrInput("");
  };

  const handleCheckInAction = async () => {
    if (!scannedBooking) return;

    try {
      await onCheckIn(scannedBooking.bookingId);
      setIsCheckedIn(true);
      setMessage("✅ Check-in successful!");
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  };

  const handleCheckOutAction = async () => {
    if (!scannedBooking) return;

    try {
      await onCheckOut(scannedBooking.bookingId);
      setScannedBooking(null);
      setIsCheckedIn(false);
      setMessage("✅ Check-out successful! Parking space released.");
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  };

  const handleClear = () => {
    setScannedBooking(null);
    setQrInput("");
    setIsCheckedIn(false);
    setMessage("");
  };

  return (
    <section className="standalone-page checkin-page">
      <div className="checkin-container">
        <div className="checkin-header">
          <div className="checkin-icon">
            <QrCode size={32} />
          </div>
          <p className="eyebrow">Smart Parking</p>
          <h2>Check-in & Check-out</h2>
          <p className="checkin-description">
            Scan your QR code or enter your booking ID to check in or check out
          </p>
        </div>

        {!scannedBooking ? (
          <div className="checkin-form">
            <div className="qr-input-group">
              <input
                type="text"
                placeholder="Scan QR code or enter Booking ID"
                value={qrInput}
                onChange={(event) => setQrInput(event.target.value)}
                onKeyPress={(event) => event.key === "Enter" && handleScan()}
                autoFocus
                className="qr-input"
              />
              <button
                className="primary-button"
                onClick={handleScan}
                disabled={!qrInput.trim()}
              >
                Scan <ArrowRight size={17} />
              </button>
            </div>

            {message && (
              <p
                className={
                  message.includes("❌") ? "form-error" : "form-success"
                }
              >
                {message}
              </p>
            )}

            <div className="checkin-tips">
              <h3>Quick tips:</h3>
              <ul>
                <li>
                  Use your phone camera to scan the QR code from your booking
                  confirmation
                </li>
                <li>Or manually enter your Booking ID (starts with SP-)</li>
                <li>Your booking must be confirmed before check-in</li>
                <li>Check-out frees up the parking space for others</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="checkin-booking-info">
            <div className="booking-card">
              <div className="booking-status-badge">
                {isCheckedIn ? "Checked In ✓" : "Ready to Check In"}
              </div>
              <h3>{scannedBooking.bookingId}</h3>
              <div className="booking-details">
                {scannedBooking.parkingId && (
                  <p>
                    <strong>Parking Lot:</strong>{" "}
                    {scannedBooking.parkingId?.name || "Parking Location"}
                  </p>
                )}
                {scannedBooking.vehicleType && (
                  <p>
                    <strong>Vehicle:</strong>{" "}
                    {scannedBooking.vehicleType.charAt(0).toUpperCase() +
                      scannedBooking.vehicleType.slice(1)}
                  </p>
                )}
                {scannedBooking.vehicleNumber && (
                  <p>
                    <strong>Vehicle Number:</strong>{" "}
                    {scannedBooking.vehicleNumber}
                  </p>
                )}
                {scannedBooking.startTime && (
                  <p>
                    <strong>Start Time:</strong>{" "}
                    {new Date(scannedBooking.startTime).toLocaleString()}
                  </p>
                )}
                {scannedBooking.endTime && (
                  <p>
                    <strong>End Time:</strong>{" "}
                    {new Date(scannedBooking.endTime).toLocaleString()}
                  </p>
                )}
                {scannedBooking.checkedInAt && (
                  <p>
                    <strong>Checked In At:</strong>{" "}
                    {new Date(scannedBooking.checkedInAt).toLocaleString()}
                  </p>
                )}
              </div>

              {message && (
                <p
                  className={
                    message.includes("❌") ? "form-error" : "form-success"
                  }
                >
                  {message}
                </p>
              )}

              <div className="checkin-actions">
                {!isCheckedIn ? (
                  <button
                    className="primary-button full-width"
                    onClick={handleCheckInAction}
                  >
                    Check In <ArrowRight size={17} />
                  </button>
                ) : (
                  <button
                    className="primary-button full-width checkout-button"
                    onClick={handleCheckOutAction}
                  >
                    Check Out <ArrowRight size={17} />
                  </button>
                )}
                <button
                  className="text-button full-width"
                  onClick={handleClear}
                >
                  Scan Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .checkin-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .checkin-container {
          width: 100%;
          max-width: 500px;
          background: white;
          border-radius: 16px;
          padding: 40px 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .checkin-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .checkin-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: #f0f4ff;
          border-radius: 12px;
          color: #667eea;
          margin-bottom: 16px;
        }

        .checkin-header .eyebrow {
          color: #667eea;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .checkin-header h2 {
          font-size: 28px;
          color: #111;
          margin-bottom: 8px;
        }

        .checkin-description {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }

        .checkin-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .qr-input-group {
          display: flex;
          gap: 8px;
        }

        .qr-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          font-family: monospace;
          transition: border-color 0.2s;
        }

        .qr-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .checkin-tips {
          background: #f8f9ff;
          border-radius: 8px;
          padding: 16px;
          border-left: 4px solid #667eea;
        }

        .checkin-tips h3 {
          font-size: 14px;
          font-weight: 600;
          color: #111;
          margin-bottom: 8px;
        }

        .checkin-tips ul {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 13px;
          color: #666;
          line-height: 1.6;
        }

        .checkin-tips li {
          margin-bottom: 6px;
        }

        .checkin-tips li:last-child {
          margin-bottom: 0;
        }

        .checkin-booking-info {
          display: flex;
          justify-content: center;
        }

        .booking-card {
          width: 100%;
          padding: 24px;
          background: #f8f9ff;
          border-radius: 12px;
          border: 2px solid #e0e4ff;
        }

        .booking-status-badge {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .booking-card h3 {
          font-size: 18px;
          color: #111;
          margin-bottom: 16px;
          font-family: monospace;
          word-break: break-all;
        }

        .booking-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #555;
        }

        .booking-details p {
          margin: 0;
        }

        .booking-details strong {
          color: #333;
        }

        .checkin-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkout-button {
          background-color: #48bb78;
        }

        .checkout-button:hover {
          background-color: #38a169;
        }

        @media (max-width: 480px) {
          .checkin-container {
            padding: 24px 16px;
          }

          .checkin-header h2 {
            font-size: 24px;
          }

          .qr-input-group {
            flex-direction: column;
          }

          .qr-input {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
