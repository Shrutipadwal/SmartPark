import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import User from "../models/User.js";

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
    request.dbUser = await User.findOneAndUpdate(
      { firebaseUid: request.user.uid },
      {
        firebaseUid: request.user.uid,
        name: request.user.name || request.user.email || "SmartPark User",
        email: request.user.email,
        photoURL: request.user.picture || "",
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    return next();
  } catch {
    return response
      .status(401)
      .json({ message: "Invalid or expired authentication token." });
  }
}

export function requireAdmin(request, response, next) {
  if (request.dbUser?.role !== "ADMIN") {
    return response.status(403).json({ message: "Admin access is required." });
  }
  return next();
}
