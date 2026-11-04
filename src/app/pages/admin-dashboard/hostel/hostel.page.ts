import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonButton, IonIcon, IonBadge, IonSpinner, AlertController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { bedOutline, checkmarkCircleOutline, trashOutline, locationOutline } from 'ionicons/icons';
import { Auth, User, onAuthStateChanged } from '@angular/fire/auth';
import {
  Firestore, collection, getDocs, getDoc, doc, runTransaction, serverTimestamp
} from '@angular/fire/firestore';

interface DormView {
  id: string;
  name: string;
  fee: number;
  description: string;
  yearGroup: string;
  vacantBeds: { bedNumber: string; roomNumber?: string }[];
  vacantBedsCount: number;
  totalBeds: number;
  selectedBed: string | null;
}

@Component({
  selector: 'app-hostel-booking',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonCard, IonCardContent, IonButton, IonIcon,
    IonBadge, IonSpinner
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/student/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Hostel Booking</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="hostel-content">
      <div class="container">

        <div *ngIf="isLoading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading dormitories...</p>
        </div>

        <div *ngIf="!isLoading && loadError" class="empty-state error-text">
          <p>{{ loadError }}</p>
        </div>

        <ng-container *ngIf="!isLoading && !loadError">

          <!-- My Active Booking -->
          <div class="section-block" *ngIf="myBooking">
            <h3>My Active Room / Bed Booking</h3>
            <ion-card class="booked-card">
              <ion-card-content>
                <div class="booking-header">
                  <div>
                    <h2>{{ myBooking.dormName || myBooking.hostelName }}</h2>
                    <p><ion-icon name="location-outline"></ion-icon> Bed: {{ myBooking.bedNumber }}</p>
                    <p class="fee-line">Fee charged: KES {{ myBooking.feeAmount | number }}</p>
                  </div>
                  <ion-badge color="success">Active</ion-badge>
                </div>
                <ion-button fill="outline" color="danger" size="small" class="ion-margin-top"
                            [disabled]="isBusy" (click)="confirmCancel()">
                  <ion-icon name="trash-outline" slot="start"></ion-icon>
                  Checkout / Drop Room
                </ion-button>
              </ion-card-content>
            </ion-card>
          </div>

          <!-- Available Dormitories -->
          <div class="section-block ion-margin-top">
            <h3>Available Dormitories & Beds</h3>
            <p class="section-subtitle">Select a vacant bed in your preferred dormitory. Booking a room automatically adds the dormitory fee to your term account balance.</p>

            <div *ngIf="hostelsList.length === 0" class="empty-state">
              <p>No dormitories configured by admin yet.</p>
            </div>

            <div class="hostels-grid">
              <div *ngFor="let hostel of hostelsList" class="hostel-card">

                <div class="hostel-card-header">
                  <h4>{{ hostel.name }}</h4>
                  <span class="vacant-count">Vacant: <strong>{{ hostel.vacantBedsCount }} / {{ hostel.totalBeds }}</strong></span>
                </div>

                <div class="hostel-meta-row">
                  <span class="fee-text">Fee: <strong>KES {{ hostel.fee | number }}</strong></span>
                  <span class="year-badge" *ngIf="hostel.yearGroup">{{ hostel.yearGroup }}</span>
                </div>

                <p class="dorm-desc">{{ hostel.description }}</p>

                <ng-container *ngIf="!myBooking">
                  <div class="dropdown-wrapper">
                    <select [(ngModel)]="hostel.selectedBed" class="custom-bed-select" [disabled]="hostel.vacantBeds.length === 0">
                      <option [ngValue]="null" disabled>
                        {{ hostel.vacantBeds.length === 0 ? 'No vacant beds' : '-- Choose Vacant Bed --' }}
                      </option>
                      <option *ngFor="let bed of hostel.vacantBeds" [ngValue]="bed.bedNumber">
                        {{ bed.bedNumber }}<span *ngIf="bed.roomNumber"> - {{ bed.roomNumber }}</span>
                      </option>
                    </select>
                  </div>

                  <button class="book-btn" [disabled]="isBusy || !hostel.selectedBed" (click)="bookBed(hostel)">
                    {{ isBusy ? 'Please wait...' : 'Book Bed' }}
                  </button>
                </ng-container>

                <div *ngIf="myBooking" class="already-booked">You already have an active booking.</div>

              </div>
            </div>
          </div>

        </ng-container>
      </div>
    </ion-content>
  `,
  styles: [`
    .hostel-content { --background: #f8fafc; }
    .container { padding: 20px; max-width: 900px; margin: 0 auto; }
    .section-block h3 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .section-subtitle { font-size: 13px; color: #64748b; margin-bottom: 16px; line-height: 1.4; }

    .loading-state { text-align: center; padding: 3rem 0; color: #64748b; font-size: 14px; }
    .empty-state { background: #ffffff; padding: 20px; border-radius: 12px; text-align: center; color: #64748b; font-size: 13px; border: 1px dashed #cbd5e1; }
    .error-text { color: #dc2626; }

    .booked-card { background: #ffffff; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); margin: 0 0 20px 0; border-left: 4px solid #22c55e; }
    .booking-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .booking-header h2 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; }
    .booking-header p { font-size: 13px; color: #64748b; margin: 0; display: flex; align-items: center; gap: 4px; }
    .booking-header .fee-line { margin-top: 2px; }

    .hostels-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .hostel-card { background: #ffffff; border-radius: 14px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 4px; }

    .hostel-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .hostel-card-header h4 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
    .vacant-count { font-size: 12px; color: #475569; }

    .hostel-meta-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; }
    .fee-text { color: #0f172a; }
    .year-badge { color: #64748b; font-size: 12px; font-weight: 500; }
    .dorm-desc { font-size: 12.5px; color: #64748b; margin: 0 0 12px 0; line-height: 1.4; }

    .dropdown-wrapper { margin-bottom: 14px; }
    .custom-bed-select { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; font-size: 13px; color: #0f172a; outline: none; transition: border-color 0.2s; }
    .custom-bed-select:focus { border-color: #3b82f6; }

    .book-btn { width: 100%; background: #2563eb; color: #ffffff; font-weight: 600; font-size: 14px; padding: 10px; border-radius: 8px; border: none; cursor: pointer; transition: background 0.2s; }
    .book-btn:hover:not(:disabled) { background: #1d4ed8; }
    .book-btn:disabled { background: #94a3b8; cursor: not-allowed; }

    .already-booked { font-size: 12.5px; color: #64748b; font-style: italic; margin-top: auto; }
  `]
})
export class HostelBookingPage {
  myBooking: any = null;
  hostelsList: DormView[] = [];
  currentUserId = '';

  isLoading = true;
  isBusy = false;
  loadError = '';

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);

  private readonly FEE_PER_UNIT = 10000; // KES 10,000 per registered unit

  constructor() {
    addIcons({ bedOutline, checkmarkCircleOutline, trashOutline, locationOutline });
  }

  // Ionic caches pages, so this runs every time the page is shown and always
  // loads the CURRENTLY logged-in student's booking.
  async ionViewWillEnter() {
    this.isLoading = true;
    this.loadError = '';
    this.myBooking = null;
    this.hostelsList = [];
    this.cdr.detectChanges();

    const user = await this.waitForUser();
    if (!user) {
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }
    this.currentUserId = user.uid;
    await this.loadHostels();
  }

  // Waits for Firebase to restore the session (auth.currentUser can be null at startup)
  private waitForUser(): Promise<User | null> {
    return new Promise(resolve => {
      const unsub = onAuthStateChanged(this.auth, user => {
        unsub();
        resolve(user);
      });
    });
  }

  async loadHostels() {
    try {
      // Same lookup as the website: studentDormBookings/{uid}
      const bookingSnap = await getDoc(doc(this.firestore, 'studentDormBookings', this.currentUserId));
      this.myBooking = bookingSnap.exists() ? { id: bookingSnap.id, ...bookingSnap.data() } : null;

      const dormsSnap = await getDocs(collection(this.firestore, 'dorms'));
      const parsed: DormView[] = [];

      dormsSnap.forEach(docSnap => {
        const data: any = docSnap.data();
        const beds: any[] = Array.isArray(data.beds) ? data.beds : [];
        const vacant = beds
          .filter(b => !b.isBooked)
          .map(b => ({ bedNumber: String(b.bedNumber), roomNumber: b.roomNumber }));

        parsed.push({
          id: docSnap.id,
          name: data.dormName || data.hostelName || data.name || 'Dormitory',
          fee: Number(data.feeAmount || data.fee || 0),
          description: data.description || 'Standard student accommodation.',
          yearGroup: data.yearGroup || data.targetGroup || '',
          vacantBeds: vacant,
          vacantBedsCount: vacant.length,
          totalBeds: beds.length,
          selectedBed: null
        });
      });

      this.hostelsList = parsed;
    } catch (error) {
      console.error('Error loading hostels:', error);
      this.loadError = 'Failed to load dormitories.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async bookBed(hostel: DormView) {
    if (!hostel.selectedBed || this.isBusy) return;

    const uid = this.currentUserId;
    const bedNumber = hostel.selectedBed;
    this.isBusy = true;
    this.cdr.detectChanges();

    try {
      // Student profile (outside the transaction)
      let studentData: any = {};
      try {
        const studentSnap = await getDoc(doc(this.firestore, 'students', uid));
        if (studentSnap.exists()) studentData = studentSnap.data();
      } catch (e) {}
      const admNo = studentData.admissionNumber || studentData.admissionNo || studentData.admNo || studentData.regNumber || 'N/A';
      const studentName = studentData.fullName || studentData.name || 'Student';
      const className = studentData.className || studentData.class || '';

      const dormRef = doc(this.firestore, 'dorms', hostel.id);
      const bookingRef = doc(this.firestore, 'studentDormBookings', uid);
      const subjRef = doc(this.firestore, 'studentSubjects', uid);
      const balRef = doc(this.firestore, 'studentAccountBalances', uid);

      // Atomic: two students can never take the same bed, and the bed, booking
      // and fee balance are all updated together or not at all.
      const result = await runTransaction(this.firestore, async tx => {
        // ---- all reads first ----
        const dormSnap = await tx.get(dormRef);
        const existingBooking = await tx.get(bookingRef);
        const subjSnap = await tx.get(subjRef);
        const balSnap = await tx.get(balRef);

        if (!dormSnap.exists()) throw new Error('Dormitory information not found.');
        if (existingBooking.exists()) throw new Error('You already have an active booking.');

        const dormData: any = dormSnap.data();
        const beds: any[] = Array.isArray(dormData.beds) ? dormData.beds : [];
        const idx = beds.findIndex(b => String(b.bedNumber) === bedNumber);
        if (idx === -1) throw new Error('That bed no longer exists.');
        if (beds[idx].isBooked) throw new Error('Sorry, that bed was just taken. Please choose another one.');

        const officialFee = Number(dormData.feeAmount || dormData.fee || 0);
        const dormName = dormData.dormName || dormData.hostelName || dormData.name || hostel.name;

        let unitsCount = 0;
        if (subjSnap.exists()) {
          const sd: any = subjSnap.data();
          const arr = sd.selectedSubjects || sd.units || sd.subjects || [];
          unitsCount = Array.isArray(arr) ? arr.length : 0;
        }
        const tuitionFee = unitsCount * this.FEE_PER_UNIT;
        const totalBill = tuitionFee + officialFee;
        const amountPaid = balSnap.exists() ? Number((balSnap.data() as any)['amountPaid'] || 0) : 0;

        // ---- then writes ----
        const updatedBeds = beds.map((b, i) =>
          i === idx ? { ...b, isBooked: true, bookedBy: uid } : b
        );
        tx.update(dormRef, { beds: updatedBeds });

        tx.set(bookingRef, {
          studentUid: uid,
          admissionNumber: admNo,
          studentName,
          dormId: hostel.id,
          dormName,
          bedNumber,
          feeAmount: officialFee,
          bookedAt: serverTimestamp()
        }, { merge: true });

        tx.set(balRef, {
          studentUid: uid,
          admissionNumber: admNo,
          studentName,
          ...(className ? { className } : {}),
          totalBill,
          amountPaid,
          balance: totalBill - amountPaid,
          tuitionFee,
          hostelFee: officialFee,
          updatedAt: serverTimestamp()
        }, { merge: true });

        return { dormName, officialFee };
      });

      await this.showAlert(
        'Booking Successful',
        `Booked ${bedNumber} in ${result.dormName}. The accommodation fee of KES ${result.officialFee.toLocaleString()} has been added to your fees.`
      );
    } catch (error: any) {
      console.error('Error booking bed:', error);
      await this.showAlert('Booking Failed', error?.message || 'Could not book the bed.');
    } finally {
      this.isBusy = false;
      await this.loadHostels();
    }
  }

  async confirmCancel() {
    const alert = await this.alertCtrl.create({
      header: 'Checkout of Room',
      message: 'Are you sure you want to checkout of your room? This will remove your booking and adjust your fee balance.',
      buttons: [
        { text: 'Keep Room', role: 'cancel' },
        { text: 'Checkout', role: 'destructive', handler: () => { this.cancelBooking(); } }
      ]
    });
    await alert.present();
  }

  async cancelBooking() {
    if (this.isBusy) return;

    const uid = this.currentUserId;
    this.isBusy = true;
    this.cdr.detectChanges();

    try {
      const bookingRef = doc(this.firestore, 'studentDormBookings', uid);
      const subjRef = doc(this.firestore, 'studentSubjects', uid);
      const balRef = doc(this.firestore, 'studentAccountBalances', uid);

      await runTransaction(this.firestore, async tx => {
        // ---- all reads first ----
        const bookingSnap = await tx.get(bookingRef);
        if (!bookingSnap.exists()) throw new Error('No active booking found.');
        const booking: any = bookingSnap.data();

        const dormRef = doc(this.firestore, 'dorms', booking.dormId);
        const dormSnap = await tx.get(dormRef);
        const subjSnap = await tx.get(subjRef);
        const balSnap = await tx.get(balRef);

        let unitsCount = 0;
        if (subjSnap.exists()) {
          const sd: any = subjSnap.data();
          const arr = sd.selectedSubjects || sd.units || sd.subjects || [];
          unitsCount = Array.isArray(arr) ? arr.length : 0;
        }
        const tuitionFee = unitsCount * this.FEE_PER_UNIT;
        const amountPaid = balSnap.exists() ? Number((balSnap.data() as any)['amountPaid'] || 0) : 0;

        // ---- then writes ----
        if (dormSnap.exists()) {
          const dormData: any = dormSnap.data();
          const beds: any[] = Array.isArray(dormData.beds) ? dormData.beds : [];
          const updatedBeds = beds.map(b =>
            String(b.bedNumber) === String(booking.bedNumber)
              ? { ...b, isBooked: false, bookedBy: null }
              : b
          );
          tx.update(dormRef, { beds: updatedBeds });
        }

        tx.set(balRef, {
          totalBill: tuitionFee,
          amountPaid,
          balance: tuitionFee - amountPaid,
          tuitionFee,
          hostelFee: 0,
          updatedAt: serverTimestamp()
        }, { merge: true });

        tx.delete(bookingRef);
      });

      await this.showAlert('Checked Out', 'Successfully checked out of accommodation.');
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      await this.showAlert('Error', error?.message || 'Could not cancel the booking.');
    } finally {
      this.isBusy = false;
      await this.loadHostels();
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}