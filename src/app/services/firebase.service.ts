import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { Database, getDatabase, ref, set, get, push, remove, update, query, orderByChild, limitToLast, onValue, DataSnapshot } from 'firebase/database';
import { Observable } from 'rxjs';

interface OrderedQueryOptions {
  path: string;
  orderByChild: string;
  limitToLast: number;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db: any;

  constructor() {
    // Initialize Firebase
    const app = initializeApp({
      apiKey: "AIzaSyBDrWVBrXqKcxBRPKhIZxNcUDyTNBJYUGE",
      authDomain: "oscarenglish.firebaseapp.com",
      databaseURL: "https://oscarenglish-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "oscarenglish",
      storageBucket: "oscarenglish.appspot.com",
      messagingSenderId: "1011828469447",
      appId: "1:1011828469447:web:3e7c4c1b3f0f9f8c5a5b5e",
      measurementId: "G-QGVBQV0BK3"
    });

    // Get a reference to the database service
    this.db = getDatabase(app);
  }

  // Get data
  async getData(path: string): Promise<any> {
    const reference = ref(this.db, path);
    const snapshot = await get(reference);
    return snapshot.val();
  }

  // Create or update data
  async setData(path: string, data: any): Promise<void> {
    try {
      console.log('Setting data at path:', path);
      console.log('Data to set:', data);
      const reference = ref(this.db, path);
      console.log('Created reference for path:', path);
      await set(reference, data);
      console.log('Data set successfully');
    } catch (error) {
      console.error('Error setting data:', error);
      throw error;
    }
  }

  // Delete data
  async deleteData(path: string): Promise<void> {
    const reference = ref(this.db, path);
    await remove(reference);
  }

  // Update data
  async updateData(path: string, data: any): Promise<void> {
    const reference = ref(this.db, path);
    await update(reference, data);
  }

  // Push data
  async pushData(path: string, data: any): Promise<string> {
    const reference = ref(this.db, path);
    const newRef = push(reference);
    await set(newRef, data);
    return newRef.key!;
  }

  // Get data as observable
  getDataAsObservable(path: string): Observable<any> {
    const reference = ref(this.db, path);
    return new Observable((subscriber) => onValue(reference, (snapshot: DataSnapshot) => {
      subscriber.next(snapshot.val());
    }));
  }

  // Get data with ordering and pagination
  async getDataOrdered(options: OrderedQueryOptions): Promise<any> {
    console.log('Getting ordered data with options:', options);
    const dbRef = ref(this.db, options.path);
    console.log('Created database reference for path:', options.path);
    
    const queryRef = query(
      dbRef,
      orderByChild(options.orderByChild),
      limitToLast(options.limitToLast)
    );
    console.log('Created query with orderByChild and limitToLast');
    
    try {
      const snapshot = await get(queryRef);
      console.log('Got snapshot from Firebase');
      console.log('Snapshot exists:', snapshot.exists());
      if (snapshot.exists()) {
        console.log('Snapshot value:', snapshot.val());
      }
      return snapshot.val();
    } catch (error) {
      console.error('Error getting ordered data:', error);
      throw error;
    }
  }
}
