import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  User, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { 
  ProductProjection, 
  OperatingExpense, 
  InvestmentItem, 
  FinancingConfig, 
  SensitivityConfig 
} from '../types';

// Firebase configuration from firebase-applet-config.json
const firebaseConfig = {
  projectId: "auspicious-water-xdpgw",
  appId: "1:1004461220757:web:a33d93d3ae743cae1c8c9c",
  apiKey: "AIzaSyA25S-ZjY1IW9LGxYTT5JEwicQ4jpV4Psg",
  authDomain: "auspicious-water-xdpgw.firebaseapp.com",
  storageBucket: "auspicious-water-xdpgw.firebasestorage.app",
  messagingSenderId: "1004461220757"
};

const databaseId = "ai-studio-d09bc394-02d7-4cbd-b892-ba9c50d028fa";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore using the specified database ID if present
export const db = getFirestore(app, databaseId);

export interface SavedModel {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  products: ProductProjection[];
  expenses: OperatingExpense[];
  investments: InvestmentItem[];
  financing: FinancingConfig;
  sensitivity: SensitivityConfig;
}

// Connection test helper
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connection verified successfully.");
    return true;
  } catch (error) {
    console.warn("Firebase test connection warning:", error);
    return false;
  }
}

// Authentication Helpers
export function setupAuthListener(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

export async function loginAnonymously() {
  try {
    const credential = await signInAnonymously(auth);
    return credential.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
}

export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

export async function logoutUser() {
  await signOut(auth);
}

// Firestore CRUD Helpers for FinancialModels
export async function saveFinancialModel(model: Omit<SavedModel, 'userId' | 'createdAt' | 'updatedAt'> & { userId?: string }) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Debe iniciar sesión para guardar modelos.");
  }

  const userId = currentUser.uid;
  const now = new Date().toISOString();

  const modelDocRef = doc(db, 'models', model.id);
  
  // Try to see if it already exists to preserve createdAt
  let createdAt = now;
  try {
    const existingSnap = await getDoc(modelDocRef);
    if (existingSnap.exists()) {
      createdAt = existingSnap.data().createdAt || now;
    }
  } catch (e) {
    // Ignore and use now
  }

  const fullModel: SavedModel = {
    ...model,
    userId,
    createdAt,
    updatedAt: now
  };

  await setDoc(modelDocRef, fullModel);
  return fullModel;
}

export async function loadFinancialModels(): Promise<SavedModel[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return [];
  }

  const modelsRef = collection(db, 'models');
  const q = query(
    modelsRef, 
    where('userId', '==', currentUser.uid),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const models: SavedModel[] = [];
  querySnapshot.forEach((doc) => {
    models.push(doc.data() as SavedModel);
  });
  return models;
}

export async function deleteFinancialModel(modelId: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Debe iniciar sesión para eliminar modelos.");
  }

  const modelDocRef = doc(db, 'models', modelId);
  await deleteDoc(modelDocRef);
}
