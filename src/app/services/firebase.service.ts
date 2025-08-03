import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  Database, 
  getDatabase, 
  ref, 
  set, 
  push, 
  remove, 
  update, 
  query, 
  orderByChild, 
  limitToLast, 
  onValue, 
  DataSnapshot, 
  get as getRTDB,
  child,
  equalTo
} from 'firebase/database';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  where, 
  query as firestoreQuery,
  Query,
  CollectionReference,
  DocumentData
} from 'firebase/firestore';
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
  private db: Database;
  private firestore: any; // Firestore instance

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

    // Get references to the database services
    this.db = getDatabase(app);
    this.firestore = getFirestore(app);
  }

  // Get data from Realtime Database
  async getData(path: string): Promise<any> {
    const reference = ref(this.db, path);
    const snapshot = await getRTDB(reference);
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

  // Collection and Document Methods
  async getCollection(collectionPath: string): Promise<any[]> {
    try {
      const colRef = collection(this.firestore, collectionPath);
      const querySnapshot = await getDocs(colRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting collection:', error);
      throw error;
    }
  }

  async getDocument(collectionPath: string, docId: string): Promise<any> {
    try {
      const docRef = doc(this.firestore, collectionPath, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  async addDocument(collectionPath: string, data: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, collectionPath), data);
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  async updateDocument(collectionPath: string, docId: string, data: any): Promise<void> {
    try {
      const docRef = doc(this.firestore, collectionPath, docId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, collectionPath, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async getCollectionWithQuery(collectionPath: string, conditions: [string, string, any][] = []): Promise<any[]> {
    try {
      const colRef = collection(this.firestore, collectionPath);
      let q: Query<DocumentData> = colRef;
      
      // Apply conditions if any
      conditions.forEach(([field, operator, value]) => {
        q = firestoreQuery(q, where(field, operator as any, value));
      });
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting collection with query:', error);
      throw error;
    }
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
      const snapshot = await getRTDB(queryRef);
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
