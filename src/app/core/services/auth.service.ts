import { Injectable, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'teacher' | 'accountant' | 'student';
  fullName?: string;
  displayName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  user$: Observable<User | null> = new Observable((subscriber) => {
    return onAuthStateChanged(this.auth, (u) => subscriber.next(u));
  });

  async login(email: string, pass: string): Promise<UserProfile> {
    // Wrap async operations in runInInjectionContext to maintain the DI context across awakes
    return runInInjectionContext(this.injector, async () => {
      const credential = await signInWithEmailAndPassword(this.auth, email, pass);
      const uid = credential.user.uid;

      const userDocRef = doc(this.firestore, `users/${uid}`);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        console.log('User profile fetched:', data);
        return data;
      } else {
        console.warn(`No Firestore profile found for UID: ${uid}. Defaulting to student role.`);
        return { uid, email, role: 'student', fullName: 'Student User' };
      }
    });
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }
}