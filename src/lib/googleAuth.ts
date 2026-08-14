import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Sheets and Drive File Scopes
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let cachedAccessToken: string | null = localStorage.getItem('pkbm_google_access_token');

/**
 * Initialize Firebase auth state listener
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in Admin with Google Popup to obtain OAuth token for Google Sheets
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses Google dari Firebase Auth.');
    }

    cachedAccessToken = credential.accessToken;
    localStorage.setItem('pkbm_google_access_token', cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error during Google Sign-in:', error);
    throw error;
  }
};

/**
 * Retrieve cached access token
 */
export const getAccessToken = (): string | null => {
  return cachedAccessToken || localStorage.getItem('pkbm_google_access_token');
};

/**
 * Log out and clear cached OAuth tokens
 */
export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  localStorage.removeItem('pkbm_google_access_token');
};
