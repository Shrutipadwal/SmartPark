import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import User from "../models/User.js";
import { sendWelcomeEmail } from "../services/emailService.js";

export function getFirebaseAdminAuth() {
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    return null;
  }

  const firebaseAdminApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });

  return getAuth(firebaseAdminApp);
}

export async function requireFirebaseUser(request, response, next) {
  const firebaseAuth = getFirebaseAdminAuth();
  const token = request.headers.authorization?.replace("Bearer ", "");

  if (!firebaseAuth || !token) {
    return response
      .status(401)
      .json({ message: "Authentication is required." });
  }

  try {
    request.user = await firebaseAuth.verifyIdToken(token);
    const isConfiguredSuperAdmin =
      request.user.email?.toLowerCase() ===
      process.env.ADMIN_EMAIL?.toLowerCase();
    const existingUser = await User.findOne({ firebaseUid: request.user.uid })
      .select("_id")
      .lean();
    request.dbUser = await User.findOneAndUpdate(
      { firebaseUid: request.user.uid },
      {
        firebaseUid: request.user.uid,
        name: request.user.name || request.user.email || "SmartPark User",
        email: request.user.email,
        photoURL: request.user.picture || "",
        ...(isConfiguredSuperAdmin ? { role: "SUPER_ADMIN" } : {}),
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    if (!existingUser && request.dbUser.email) {
      sendWelcomeEmail(request.dbUser.email, request.dbUser.name).catch(
        (error) => console.error("Error sending welcome email:", error.message),
      );
    }
    return next();
  } catch {
    return response
      .status(401)
      .json({ message: "Invalid or expired authentication token." });
  }
}

export function requireAdmin(request, response, next) {
  if (!["ADMIN", "SUPER_ADMIN"].includes(request.dbUser?.role)) {
    return response.status(403).json({ message: "Admin access is required." });
  }
  return next();
}

export function requireSuperAdmin(request, response, next) {
  if (request.dbUser?.role !== "SUPER_ADMIN") {
    return response
      .status(403)
      .json({ message: "Super-admin access is required." });
  }
  return next();
}
