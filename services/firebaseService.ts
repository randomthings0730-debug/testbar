
// Fixed: Using named imports for firebase/app to resolve property existence issues.
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { UserProfile, StudyTask, Flashcard, PracticeLog } from '../types';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDra23ynAEQuMK-sCck_vHhqBgCaTXYw20",
  authDomain: "barexam-master.firebaseapp.com",
  projectId: "barexam-master",
  storageBucket: "barexam-master.firebasestorage.app",
  messagingSenderId: "960918440496",
  appId: "1:960918440496:web:c25543fba4b24ced3efbf5",
  measurementId: "G-S7BHQ1KS70"
};

const USER_DOC_ID = 'personal_study_profile';

export interface AppData {
  profile: UserProfile;
  tasks: StudyTask[];
  cards: Flashcard[];
  mbePracticed: Record<string, number>;
  practiceLogs: PracticeLog[];
}

let db: Firestore | null = null;

// Fixed: Correctly initialize Firebase app using the modular v9 named exports to fix 'Property getApps does not exist' error.
const initDb = () => {
  if (db) return db;
  try {
    const apps = getApps();
    const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
    db = getFirestore(app);
    return db;
  } catch (e) {
    console.warn("Firestore initialization failed. Using local-only mode.", e);
    return null;
  }
};

export async function saveAppData(data: AppData) {
  // Always save to local storage first for immediate availability
  localStorage.setItem('barExamData', JSON.stringify({ ...data, lastSynced: new Date().toISOString() }));

  const database = initDb();
  if (!database) return;

  try {
    const userDoc = doc(database, 'users', USER_DOC_ID);
    await setDoc(userDoc, {
      ...data,
      lastSynced: new Date().toISOString()
    }, { merge: true });
  } catch (error: any) {
    console.warn("Cloud sync deferred (Service potentially unavailable):", error?.message);
  }
}

export async function loadAppData(): Promise<AppData | null> {
  // Priority 1: Check Local Storage for immediate startup
  const localDataStr = localStorage.getItem('barExamData');
  let localData: AppData | null = null;
  if (localDataStr) {
    try {
      localData = JSON.parse(localDataStr);
    } catch (e) {
      console.error("Local data corrupted", e);
    }
  }

  // Priority 2: Try Cloud (if online and available)
  const database = initDb();
  if (database) {
    try {
      const userDoc = doc(database, 'users', USER_DOC_ID);
      const snap = await getDoc(userDoc);
      if (snap.exists()) {
        const cloudData = snap.data() as AppData;
        return cloudData;
      }
    } catch (error: any) {
      console.warn("Could not reach cloud storage, using local backup.", error?.message);
    }
  }

  return localData;
}
