import { useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, QrCode, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function CheckInPage({ bookings, onCheckIn, onCheckOut }) {
  const [qrInput, setQrInput] = useState("");
  const [scannedBooking, setScannedBooking] = useState(null);
  const [message, setMessage] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const scannerRef = useRef(null);

  useEffect(
    () => () => {
      const scanner = scannerRef.current;
      if (scanner?.isScanning) scanner.stop().catch(() => {});
    },
    [],
  );

  useEffect(() => {
    if (!cameraOpen) return undefined;

    let cancelled = false;
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (cancelled) return;
          await stopCamera();
          handleScan(decodedText);
        },
        () => {},
      )
      .catch((error) => {
        if (cancelled) return;
        stopCamera();
        setMessage(
          error?.name === "NotAllowedError"
            ? "Camera permission was denied. Enter your Booking ID instead."
            : "Camera could not start. Enter your Booking ID instead.",
        );
      });

    return () => {
      cancelled = true;
      if (scannerRef.current === scanner) scannerRef.current = null;
      if (scanner.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, [cameraOpen]);

  const handleScan = (value = qrInput) => {
    const scanValue = value.trim();
    const booking = bookings.find(
      (b) => b.bookingId === scanValue || b.qrCodeData?.includes(scanValue),
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

  const stopCamera = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setCameraOpen(false);
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
      scanner.clear();
    } catch {
      // The camera may already be closed by the browser.
    }
  };

  const startCamera = () => {
    setMessage("");
    setCameraOpen(true);
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
            {cameraOpen && <div id="qr-reader" className="qr-reader" />}
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
            {!cameraOpen ? (
              <button className="camera-button" onClick={startCamera}>
                <Camera size={17} /> Scan with camera
              </button>
            ) : (
              <button className="camera-button" onClick={stopCamera}>
                <X size={17} /> Close camera
              </button>
            )}

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
          background: linear-gradient(135deg, #edf8f1 0%, #f6faf7 100%);
          padding: 20px;
        }

        .checkin-container {
          width: 100%;
          max-width: 500px;
          background: #ffffff;
          border: 1px solid var(--line, #dfe4de);
          border-radius: 16px;
          padding: 40px 24px;
          box-shadow: 0 20px 50px rgba(35, 107, 84, 0.12);
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
          background: var(--mint, #dff1e8);
          border-radius: 12px;
          color: var(--green, #236b54);
          margin-bottom: 16px;
        }

        .checkin-header .eyebrow {
          color: var(--green, #236b54);
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .checkin-header h2 {
          font-size: 28px;
          color: var(--ink, #18211f);
          margin-bottom: 8px;
        }

        .checkin-description {
          color: var(--muted, #68726e);
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

        .qr-reader {
          width: 100%;
          overflow: hidden;
          border: 2px solid var(--line, #dfe4de);
          border-radius: 10px;
          background: #111;
        }

        .camera-button {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 14px;
          border: 1px solid var(--green, #236b54);
          border-radius: 8px;
          background: #fff;
          color: var(--green, #236b54);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .camera-button:hover {
          background: var(--mint, #dff1e8);
        }

        .qr-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid var(--line, #dfe4de);
          border-radius: 8px;
          font-size: 16px;
          font-family: monospace;
          transition:
            border-color 0.2s,
            box-shadow 0.2s;
          color: var(--ink, #18211f);
          background: #fff;
        }

        .qr-input:focus {
          outline: none;
          border-color: var(--green, #236b54);
          box-shadow: 0 0 0 3px rgba(35, 107, 84, 0.1);
        }

        .checkin-tips {
          background: var(--mint, #dff1e8);
          border-radius: 8px;
          padding: 16px;
          border-left: 4px solid var(--green, #236b54);
        }

        .checkin-tips h3 {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink, #18211f);
          margin-bottom: 8px;
        }

        .checkin-tips ul {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 13px;
          color: var(--muted, #68726e);
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
          background: #f8faf8;
          border-radius: 12px;
          border: 1px solid var(--line, #dfe4de);
        }

        .booking-status-badge {
          display: inline-block;
          background: var(--green, #236b54);
          color: #fff;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .booking-card h3 {
          font-size: 18px;
          color: var(--ink, #18211f);
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
          color: var(--muted, #68726e);
        }

        .booking-details p {
          margin: 0;
        }

        .booking-details strong {
          color: var(--ink, #18211f);
        }

        .checkin-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkout-button {
          background-color: var(--green, #236b54);
        }

        .checkout-button:hover {
          background-color: #1a5845;
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
