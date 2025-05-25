import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  push,
  remove,
  update,
  query,
  orderByChild,
  limitToLast,
  Database,
  DataSnapshot,
  Query,
  ThenableReference
} from 'firebase/database';
import { Observable, from } from 'rxjs';

export interface OrderedQueryOptions {
  path: string;
  orderByChild: string;
  limitToLast: number;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db!: Database;

  constructor() {
    const firebaseConfig = {
      databaseURL: 'https://oscarenglish-default-rtdb.asia-southeast1.firebasedatabase.app/'
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
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
    const reference = ref(this.db, path);
    await set(reference, data);
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

  // Push new data with auto-generated key
  async pushData(path: string, data: any): Promise<string> {
    const reference = ref(this.db, path);
    const newRef = await push(reference);
    await set(newRef, data);
    return newRef.key || '';
  }

  // Get data as Observable
  getDataAsObservable(path: string): Observable<any> {
    const reference = ref(this.db, path);
    return from(get(reference).then(snapshot => snapshot.val()));
  }

  // Get data with ordering and pagination
  async getDataOrdered(options: OrderedQueryOptions): Promise<any> {
    const dbRef = ref(this.db, options.path);
    const queryRef = query(
      dbRef,
      orderByChild(options.orderByChild),
      limitToLast(options.limitToLast)
    );
    const snapshot = await get(queryRef);
    return snapshot.val();
  }
}
