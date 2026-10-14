import nodemailer from "nodemailer";
import QRCode from "qrcode";

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number.parseInt(process.env.BREVO_SMTP_PORT, 10),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("Email service connection error:", error.message);
  } else {
    console.log("Email service is ready to send emails");
  }
});

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const emailLayout = (title, intro, content) => `
  <div style="margin:0;padding:32px 12px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(intro)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">
      <tr>
        <td style="padding:26px 32px;background:#102a43;color:#ffffff;">
          <div style="font-size:13px;font-weight:bold;letter-spacing:2px;color:#72e0c1;">SMARTPARK</div>
          <div style="margin-top:8px;font-size:25px;line-height:1.3;font-weight:700;">${escapeHtml(title)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px 18px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#475569;">${escapeHtml(intro)}</p>
          ${content}
        </td>
      </tr>
      <tr>
        <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;line-height:1.6;color:#64748b;">
          SmartPark · Parking made simpler<br />
          This is an automated message from SmartPark.
        </td>
      </tr>
    </table>
  </div>`;

const detailRows = (rows) => `
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    ${rows
      .map(
        ([label, value]) => `
          <tr>
            <td style="width:36%;padding:12px 14px;border-bottom:1px solid #e2e8f0;background:#f8fafc;font-size:13px;font-weight:700;color:#475569;vertical-align:top;">${escapeHtml(label)}</td>
            <td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;line-height:1.5;color:#172033;word-break:break-word;">${escapeHtml(value || "Not provided")}</td>
          </tr>`,
      )
      .join("")}
  </table>`;

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      html,
      attachments,
    });
    console.log(`Email sent to: ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    return { success: false, message: error.message };
  }
};

export const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  const qrCode = await QRCode.toBuffer(bookingDetails.qrCodeData, {
    type: "png",
    width: 240,
    margin: 1,
    errorCorrectionLevel: "M",
  });
  const content = `
    <div style="margin:0 0 18px;padding:15px 17px;border-radius:12px;background:#ecfdf5;color:#166534;font-size:15px;font-weight:700;">
      Your booking is confirmed!
    </div>
    ${detailRows([
      ["Booking ID", bookingDetails.bookingId],
      ["Customer name", bookingDetails.customerName],
      ["Phone number", bookingDetails.customerPhone],
      ["Vehicle number", bookingDetails.vehicleNumber],
      ["Time", bookingDetails.time],
      ["Parking name", bookingDetails.parkingLotName],
      ["Parking address", bookingDetails.parkingAddress],
    ])}
    <div style="margin-top:22px;text-align:center;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#334155;">Show this QR code when you arrive</p>
      <img src="cid:smartpark-booking-qr" width="200" height="200" alt="Booking QR code" style="display:block;width:200px;height:200px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;" />
    </div>`;
  const html = emailLayout(
    "Booking confirmed",
    `Your parking at ${bookingDetails.parkingLotName} is confirmed.`,
    content,
  );
  return sendEmail(userEmail, "Your SmartPark booking is confirmed", html, [
    {
      filename: "smartpark-booking-qr.png",
      content: qrCode,
      contentType: "image/png",
      cid: "smartpark-booking-qr",
    },
  ]);
};

export const sendAdminBookingNotification = (adminEmail, details) =>
  sendEmail(
    adminEmail,
    "New parking booking - SmartPark",
    emailLayout(
      "New booking received",
      `A new reservation was made for ${details.parkingLotName}.`,
      detailRows([
        ["Booking ID", details.bookingId],
        ["Customer", details.customerName],
        ["Customer email", details.customerEmail],
        ["Phone number", details.customerPhone],
        [
          "Vehicle",
          `${details.vehicleType} · ${details.vehicleNumber || "Not provided"}`,
        ],
        ["Time", details.time],
        ["Parking", details.parkingLotName],
        ["Address", details.parkingAddress],
        ["Amount", `₹${details.price}`],
      ]),
    ),
  );

export const sendBookingStatusEmail = (userEmail, details) =>
  sendEmail(
    userEmail,
    `Booking ${details.status} - SmartPark`,
    emailLayout(
      `Booking ${details.status.toLowerCase()}`,
      `Your booking at ${details.parkingLotName} has been updated.`,
      detailRows([
        ["Booking ID", details.bookingId],
        ["Parking", details.parkingLotName],
        ["Status", details.status],
      ]),
    ),
  );

export const sendBookingReminderEmail = (userEmail, details) =>
  sendEmail(
    userEmail,
    "Reminder: your SmartPark reservation is coming up",
    emailLayout(
      "Your parking is coming up",
      `Your reservation at ${details.parkingLotName} starts soon. Keep your booking QR code ready.`,
      detailRows([
        ["Booking ID", details.bookingId],
        ["Parking", details.parkingLotName],
        ["Start time", details.startTime],
      ]),
    ),
  );

export const sendCancellationEmail = (userEmail, bookingDetails) =>
  sendEmail(
    userEmail,
    "SmartPark booking cancelled",
    emailLayout(
      "Booking cancelled",
      `Your booking ${bookingDetails.bookingId} has been cancelled.`,
      `${detailRows([
        ["Booking ID", bookingDetails.bookingId],
        ["Cancelled on", new Date().toLocaleString()],
        ["Booking amount", `₹${bookingDetails.price}`],
      ])}
      <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#64748b;">If you paid for this booking, please contact SmartPark support about the refund. Refunds are not issued automatically by this cancellation action.</p>`,
    ),
  );

export const sendOwnerNotification = (adminEmail, requestDetails) =>
  sendEmail(
    adminEmail,
    "New parking partner request - SmartPark",
    emailLayout(
      "Partner request received",
      "A parking owner has submitted a request for review.",
      detailRows([
        ["Owner name", requestDetails.name],
        ["Email", requestDetails.email],
        ["Phone", requestDetails.phone],
        ["Location", requestDetails.location],
        ["Spaces available", requestDetails.spacesAvailable],
        ["Message", requestDetails.message],
      ]),
    ),
  );

export const sendPaymentReceipt = (userEmail, paymentDetails) =>
  sendEmail(
    userEmail,
    "SmartPark payment receipt",
    emailLayout(
      "Payment received",
      "Your payment was successful. Keep this receipt for your records.",
      detailRows([
        ["Booking ID", paymentDetails.bookingId],
        ["Transaction ID", paymentDetails.transactionId],
        ["Amount paid", `₹${paymentDetails.amount}`],
        ["Payment date", paymentDetails.date],
        ["Status", "Successful"],
      ]),
    ),
  );

export const sendWelcomeEmail = (userEmail, userName) =>
  sendEmail(
    userEmail,
    "Welcome to SmartPark",
    emailLayout(
      `Welcome to SmartPark, ${userName}!`,
      "Your account is ready. You can now find and book parking through SmartPark.",
      `<p style="margin:0;font-size:14px;line-height:1.8;color:#475569;">Search available lots, compare prices and availability, and keep your booking details together in one place.</p>`,
    ),
  );

export const sendOwnerRequestDecisionEmail = (userEmail, details) => {
  const approved = details.status === "APPROVED";
  return sendEmail(
    userEmail,
    approved
      ? "Your SmartPark partner request was approved"
      : "Update on your SmartPark partner request",
    emailLayout(
      approved ? "Partner request approved" : "Partner request not approved",
      approved
        ? `Your request for ${details.parkingName} has been approved.`
        : `Your request for ${details.parkingName} was not approved.`,
      `<p style="margin:0;font-size:14px;line-height:1.8;color:#475569;">${
        approved
          ? "You can now sign in to your admin dashboard to manage your parking listing."
          : "You can contact the SmartPark team if you need more information."
      }</p>`,
    ),
  );
};

export const sendCustomEmail = (userEmail, subject, html) =>
  sendEmail(
    userEmail,
    subject,
    emailLayout(subject, "An update from SmartPark.", html),
  );
