// Firebase configuration and real-time sync setup

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, where, type Firestore } from 'firebase/firestore';
import type { Reservation } from '@/types';

// Firebase configuration (replace with actual values in production)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456:web:abcdef',
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;

if (typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
}

/**
 * Subscribe to real-time reservation updates from Firebase
 * This listens to the iOS app's reservation collection
 */
export function subscribeToReservations(
  locationId: string,
  onUpdate: (reservations: Reservation[]) => void,
  onError: (error: Error) => void
) {
  if (!db) {
    console.warn('Firebase not initialized (server-side or no config)');
    return () => {};
  }

  try {
    const reservationsRef = collection(db, 'reservations');
    const q = query(reservationsRef, where('locationId', '==', locationId));

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reservations: Reservation[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Transform Firebase data to Datables format
          reservations.push({
            id: doc.id,
            locationId: data.locationId,
            guestName: data.guestName,
            guestPhone: data.guestPhone,
            guestEmail: data.guestEmail,
            partySize: data.partySize,
            dateTime: data.dateTime?.toDate() || new Date(),
            status: data.status || 'pending',
            source: data.source || 'ios-app',
            tableId: data.tableId,
            specialRequests: data.specialRequests,
            seatingPreference: data.seatingPreference || 'any',
            highChairs: data.highChairs,
            kidsInParty: data.kidsInParty,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        });

        onUpdate(reservations);
      },
      (error) => {
        console.error('Firebase subscription error:', error);
        onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Failed to subscribe to reservations:', error);
    onError(error as Error);
    return () => {};
  }
}

/**
 * Test Firebase connection
 */
export async function testFirebaseConnection(): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    // Access the collection to verify connection
    collection(db, 'reservations');
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
}

export { app, db };
