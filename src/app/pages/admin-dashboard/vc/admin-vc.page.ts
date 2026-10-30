import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonMenuButton, IonItem, IonInput, IonButton, IonSpinner, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline } from 'ionicons/icons';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

@Component({
  selector: 'app-vc-provision',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonMenuButton, IonItem, IonInput, IonButton, IonSpinner, IonIcon
  ],
  template: `
    <ion-header>
      <ion-toolbar class="header-gradient-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button menu="main-menu" class="menu-btn"></ion-menu-button>
        </ion-buttons>
        <ion-title>Provision VC Account</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="mobile-dashboard-content">
      <div class="dashboard-body">
        
        <div class="provision-card">
          <div class="card-title-group">
            <div class="icon-header-badge">
              <ion-icon name="shield-checkmark-outline"></ion-icon>
            </div>
            <div>
              <h2>Create Vice Chancellor Account</h2>
              <p>Assign full transaction authorization rights to a Vice Chancellor profile.</p>
            </div>
          </div>

          <form (submit)="createVcAccount($event)">
            <div class="form-group">
              <label for="vcName">Full Name</label>
              <input type="text" id="vcName" [(ngModel)]="vcName" name="vcName" placeholder="Prof. Jane Doe" required />
            </div>

            <div class="form-group">
              <label for="vcEmail">Official Email</label>
              <input type="email" id="vcEmail" [(ngModel)]="vcEmail" name="vcEmail" placeholder="vc&#64;elimu.ac.ke" required />
            </div>

            <div class="form-group">
              <label for="vcPassword">Assign Password</label>
              <input type="password" id="vcPassword" [(ngModel)]="vcPassword" name="vcPassword" placeholder="••••••••" minlength="6" required />
            </div>

            <button type="submit" class="btn-primary" [disabled]="isLoading">
              <ion-spinner name="crescent" *ngIf="isLoading" style="width: 18px; height: 18px; margin-right: 8px; vertical-align: middle;"></ion-spinner>
              {{ isLoading ? 'Creating Account...' : 'Provision VC Credentials' }}
            </button>
          </form>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .header-gradient-toolbar { --background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%); --color: #ffffff; }
    .menu-btn { color: #ffffff; }

    .mobile-dashboard-content { --background: #f8fafc; }
    .dashboard-body { padding: 30px 20px; display: flex; justify-content: center; align-items: center; min-height: 80vh; }

    .provision-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; width: 100%; max-width: 480px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    
    .card-title-group { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 1.5rem; }
    .icon-header-badge { width: 42px; height: 42px; background: #e0e7ff; color: #4f46e5; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
    
    h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; }
    p { font-size: 13px; color: #64748b; margin: 0; line-height: 1.4; }

    .form-group { margin-bottom: 1.25rem; }
    label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 0.4rem; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
    input { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f8fafc; color: #0f172a; outline: none; transition: border-color 0.2s; }
    input:focus { border-color: #2563eb; background: #ffffff; }

    .btn-primary { width: 100%; padding: 0.85rem; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
  `]
})
export class AdminVCPage {
  vcName = '';
  vcEmail = '';
  vcPassword = '';
  isLoading = false;

  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({ shieldCheckmarkOutline });
  }

  async createVcAccount(e: Event) {
    e.preventDefault();
    if (!this.vcName || !this.vcEmail || !this.vcPassword) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    const firebaseConfig = {
      apiKey: "AIzaSyCJKSBVleO-WCMBl1XUpRd1NDedAtKUsmI",
      authDomain: "elimu-database.firebaseapp.com",
      projectId: "elimu-database",
      storageBucket: "elimu-database.firebasestorage.app",
      messagingSenderId: "341586622750",
      appId: "1:341586622750:web:26634351fe5f55bdb5f10f"
    };

    try {
      // Initialize a secondary Firebase app instance to provision the VC user 
      // without interrupting the currently logged-in Admin session.
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryAppForVC");
      const secondaryAuth = getAuth(secondaryApp);
      const secondaryDb = getFirestore(secondaryApp);

      // Create user in Auth
      const cred = await createUserWithEmailAndPassword(secondaryAuth, this.vcEmail.trim(), this.vcPassword);
      const uid = cred.user.uid;

      // Write 'vc' role profile to Firestore
      await setDoc(doc(secondaryDb, "users", uid), {
        uid: uid,
        fullName: this.vcName.trim(),
        email: this.vcEmail.trim(),
        role: "vc",
        createdAt: serverTimestamp()
      });

      // Clean up secondary auth session
      await signOut(secondaryAuth);

      alert(`VC Account successfully created for ${this.vcName.trim()}!\n\nEmail: ${this.vcEmail.trim()}`);
      
      // Reset form
      this.vcName = '';
      this.vcEmail = '';
      this.vcPassword = '';
    } catch (err: any) {
      console.error("Error creating VC:", err);
      alert(`Creation failed: ${err.message}`);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}