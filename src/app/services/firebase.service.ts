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
  Database,
  DataSnapshot 
} from 'firebase/database';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db: Database;

  constructor() {
    const firebaseConfig = {
      databaseURL: 'https://oscarenglish-default-rtdb.asia-southeast1.firebasedatabase.app/'
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    this.db = getDatabase(app);
  }

  // Create or update data
  async setData(path: string, data: any): Promise<void> {
    const reference = ref(this.db, path);
    return set(reference, data);
  }

  // Read data once
  async getData(path: string): Promise<any> {
    const reference = ref(this.db, path);
    const snapshot = await get(reference);
    return snapshot.val();
  }

  // Read data as Observable (real-time updates)
  getDataAsObservable(path: string): Observable<any> {
    return new Observable(observer => {
      const reference = ref(this.db, path);
      const unsubscribe = get(reference)
        .then((snapshot: DataSnapshot) => {
          observer.next(snapshot.val());
        })
        .catch((error: any) => {
          observer.error(error);
        });
      
      // Cleanup subscription
      return () => unsubscribe;
    });
  }

  // Push new data to a list
  async pushData(path: string, data: any): Promise<string> {
    const reference = ref(this.db, path);
    const newRef = push(reference);
    await set(newRef, data);
    return newRef.key || '';
  }

  // Update specific fields
  async updateData(path: string, data: any): Promise<void> {
    const reference = ref(this.db, path);
    return update(reference, data);
  }

  // Delete data
  async deleteData(path: string): Promise<void> {
    const reference = ref(this.db, path);
    return remove(reference);
  }
}
