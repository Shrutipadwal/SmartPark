import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  getIdToken,
} from "firebase/auth";
import { auth, firebaseConfigured } from "../firebase/config";

const googleProvider = new GoogleAuthProvider();

export function watchAuthState(onChange) {
  if (!auth) {
    onChange(null);
    return () => {};
  }
  return onAuthStateChanged(auth, onChange);
}

export async function signInWithGoogle() {
  if (!firebaseConfigured) {
    throw new Error(
      "Firebase is not configured yet. Add the VITE_FIREBASE values to client/.env.",
    );
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export function signOutUser() {
  return auth ? signOut(auth) : Promise.resolve();
}

export function getCurrentUserToken(user, forceRefresh = false) {
  return user ? getIdToken(user, forceRefresh) : null;
}
