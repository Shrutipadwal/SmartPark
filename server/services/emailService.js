import nodemailer from "nodemailer";

// Create transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: parseInt(process.env.BREVO_SMTP_PORT),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
});

// Test connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email service connection error:", error.message);
  } else {
    console.log("✅ Email service is ready to send emails");
  }
});

// Function to send booking confirmation
export const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: userEmail,
    subject: "Booking Confirmation - SmartPark Parking",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">✅ Booking Confirmed!</h1>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
          <p><strong>Parking Lot:</strong> ${bookingDetails.parkingLotName}</p>
          <p><strong>Date:</strong> ${bookingDetails.date}</p>
          <p><strong>Time:</strong> ${bookingDetails.time}</p>
          <p><strong>Duration:</strong> ${bookingDetails.duration}</p>
          <p><strong>Price:</strong> ₹${bookingDetails.price}</p>
        </div>
        <p>Thank you for booking with SmartPark! Your spot is reserved.</p>
        <p style="color: #7f8c8d; font-size: 12px;">For support, contact us at support@smartpark.com</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Booking confirmation email sent to:", userEmail);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    return { success: false, message: error.message };
  }
};

// Function to send booking cancellation
export const sendCancellationEmail = async (userEmail, bookingDetails) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: userEmail,
    subject: "Booking Cancelled - SmartPark Parking",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e74c3c;">❌ Booking Cancelled</h1>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
          <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Refund Amount:</strong> ₹${bookingDetails.price}</p>
        </div>
        <p>Your booking has been successfully cancelled.</p>
        <p>You will receive a refund within 3-5 business days to your original payment method.</p>
        <p style="color: #7f8c8d; font-size: 12px;">For support, contact us at support@smartpark.com</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Cancellation email sent to:", userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending cancellation email:", error.message);
    return { success: false, message: error.message };
  }
};

// Function to send parking owner request notification
export const sendOwnerNotification = async (ownerEmail, requestDetails) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: ownerEmail,
    subject: "New Parking Owner Request - SmartPark",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">🏢 New Parking Owner Request</h1>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${requestDetails.name}</p>
          <p><strong>Email:</strong> ${requestDetails.email}</p>
          <p><strong>Phone:</strong> ${requestDetails.phone || "N/A"}</p>
          <p><strong>Location:</strong> ${requestDetails.location}</p>
          <p><strong>Spaces Available:</strong> ${requestDetails.spacesAvailable || "N/A"}</p>
          <p><strong>Message:</strong></p>
          <p style="border-left: 4px solid #3498db; padding-left: 10px;">${requestDetails.message}</p>
        </div>
        <p>This is a new parking owner request received on SmartPark.</p>
        <p>Please review and respond to the owner as soon as possible.</p>
        <p style="color: #7f8c8d; font-size: 12px;">For support, contact us at support@smartpark.com</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Owner notification email sent to:", ownerEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending owner notification:", error.message);
    return { success: false, message: error.message };
  }
};

// Function to send payment receipt
export const sendPaymentReceipt = async (userEmail, paymentDetails) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: userEmail,
    subject: "Payment Receipt - SmartPark Parking",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #27ae60;">💳 Payment Receipt</h1>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
          <p><strong>Amount Paid:</strong> ₹${paymentDetails.amount}</p>
          <p><strong>Payment Date:</strong> ${paymentDetails.date}</p>
          <p><strong>Booking ID:</strong> ${paymentDetails.bookingId}</p>
          <p><strong>Status:</strong> ✅ Success</p>
        </div>
        <p>Thank you for your payment. Your booking is now confirmed.</p>
        <p>You can check in and check out using the SmartPark app with your booking ID or QR code.</p>
        <p style="color: #7f8c8d; font-size: 12px;">For support, contact us at support@smartpark.com</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Payment receipt sent to:", userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending payment receipt:", error.message);
    return { success: false, message: error.message };
  }
};

// Function to send welcome email
export const sendWelcomeEmail = async (userEmail, userName) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: userEmail,
    subject: "Welcome to SmartPark - Your Parking Solution",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">🎉 Welcome to SmartPark, ${userName}!</h1>
        <p>We're thrilled to have you join our community of smart parking users.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What you can do:</h3>
          <ul>
            <li>Browse available parking lots in your area</li>
            <li>Book parking spots in advance</li>
            <li>Pay securely with our integrated payment system</li>
            <li>Manage your bookings easily</li>
          </ul>
        </div>
        <p>Get started now and find your perfect parking spot!</p>
        <p style="color: #7f8c8d; font-size: 12px;">For support, contact us at support@smartpark.com</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Welcome email sent to:", userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending welcome email:", error.message);
    return { success: false, message: error.message };
  }
};

// Generic email function for custom emails
export const sendCustomEmail = async (userEmail, subject, html) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: userEmail,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to:", userEmail);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    return { success: false, message: error.message };
  }
};
