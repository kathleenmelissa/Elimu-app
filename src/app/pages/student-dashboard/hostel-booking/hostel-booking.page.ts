import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonBadge, IonSelect, IonSelectOption
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { bedOutline, checkmarkCircleOutline, trashOutline, locationOutline } from 'ionicons/icons';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs, addDoc, deleteDoc, doc, Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-hostel-booking',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonButton, IonIcon, IonBadge, IonSelect, IonSelectOption
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/student/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Hostel Booking</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="hostel-content">
      <div class="container">
        
        <!-- My Active Booking Section -->
        <div class="section-block" *ngIf="myBooking">
          <h3>My Active Room / Bed Booking</h3>
          <ion-card class="booked-card">
            <ion-card-content>
              <div class="booking-header">
                <div>
                  <h2>{{ myBooking.hostelName }}</h2>
                  <p><ion-icon name="location-outline"></ion-icon> Bed: {{ myBooking.bedNumber }}</p>
                </div>
                <ion-badge color="success">Active</ion-badge>
              </div>
              <ion-button fill="outline" color="danger" size="small" class="ion-margin-top" (click)="cancelBooking(myBooking.id)">
                <ion-icon name="trash-outline" slot="start"></ion-icon>
                Cancel Booking
              </ion-button>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Available Dormitories & Beds Section -->
        <div class="section-block ion-margin-top">
          <h3>Available Dormitories & Beds</h3>
          <p class="section-subtitle">Select a vacant bed in your preferred dormitory. Booking a room automatically adds the dormitory fee to your term account balance.</p>

          <div *ngIf="hostelsList.length === 0" class="empty-state">
            <p>No dormitories or vacant beds available at the moment.</p>
          </div>

          <div class="hostels-grid">
            <div *ngFor="let hostel of hostelsList" class="hostel-card">
              
              <div class="hostel-card-header">
                <h4>{{ hostel.name }}</h4>
                <span class="vacant-count">Vacant Beds: <strong>{{ hostel.vacantBedsCount }} / {{ hostel.totalBeds }}</strong></span>
              </div>

              <div class="hostel-meta-row">
                <span class="fee-text">Fee: <strong>KES {{ hostel.fee | number }}</strong></span>
                <span class="year-badge">{{ hostel.yearGroup || hostel.targetGroup || 'General' }}</span>
              </div>

              <!-- Bed Selection Dropdown -->
              <div class="dropdown-wrapper">
                <select [(ngModel)]="hostel.selectedBed" class="custom-bed-select">
                  <option [ngValue]="null" disabled>-- Choose Vacant Bed --</option>
                  <option *ngFor="let bed of hostel.vacantBeds" [ngValue]="bed">
                    {{ bed.bedName || bed.name || 'Bed ' + bed.number }}  {{ bed.roomNumber }}
                  </option>
                </select>
              </div>

              <button class="book-btn" [disabled]="myBooking || !hostel.selectedBed" (click)="bookBed(hostel)">
                Book Bed
              </button>

            </div>
          </div>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .hostel-content { --background: #f8fafc; }
    .container { padding: 20px; max-width: 900px; margin: 0 auto; }
    .section-block h3 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .section-subtitle { font-size: 13px; color: #64748b; margin-bottom: 16px; line-height: 1.4; }
    
    .empty-state { background: #ffffff; padding: 20px; border-radius: 12px; text-align: center; color: #64748b; font-size: 13px; border: 1px dashed #cbd5e1; }
    
    .booked-card { background: #ffffff; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); margin: 0 0 20px 0; border-left: 4px solid #22c55e; }
    .booking-header { display: flex; justify-content: space-between; align-items: flex-start; h2 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; } p { font-size: 13px; color: #64748b; margin: 0; display: flex; align-items: center; gap: 4px; } }

    /* Hostels Grid */
    .hostels-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .hostel-card { background: #ffffff; border-radius: 14px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between; }
    
    .hostel-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; h4 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; } .vacant-count { font-size: 12px; color: #475569; } }
    
    .hostel-meta-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; font-size: 13px; .fee-text { color: #0f172a; } .year-badge { color: #64748b; font-size: 12px; font-weight: 500; } }

    /* Custom Dropdown Styling */
    .dropdown-wrapper { margin-bottom: 14px; }
    .custom-bed-select { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; font-size: 13px; color: #0f172a; outline: none; transition: border-color 0.2s; &:focus { border-color: #3b82f6; } }

    /* Book Button */
    .book-btn { width: 100%; background: #2563eb; color: #ffffff; font-weight: 600; font-size: 14px; padding: 10px; border-radius: 8px; border: none; cursor: pointer; transition: background 0.2s; &:hover:not(:disabled) { background: #1d4ed8; } &:disabled { background: #94a3b8; cursor: not-allowed; } }
  `]
})
export class HostelBookingPage implements OnInit {
  myBooking: any = null;
  hostelsList: any[] = [];
  currentUserId: string = '';

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({ bedOutline, checkmarkCircleOutline, trashOutline, locationOutline });
  }

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        await this.loadHostels();
      }
    });
  }

async loadHostels() {
    try {
      const dormsSnap = await getDocs(collection(this.firestore, 'dorms'));
      const parsedHostels: any[] = [];

      dormsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const hostelName = data['hostelName'] || data['name'] || data['dormName'] || 'Windsor Block';
        const fee = data['fee'] || 6000;
        const yearGroup = data['yearGroup'] || data['targetGroup'] || '2nd Years';
       

        let beds: any[] = [];
        if (Array.isArray(data['beds'])) {
          // Filter vacant beds where isBooked is false and bookedBy is null/empty
          beds = data['beds']
            .filter((b: any) => !b.isBooked && !b.bookedBy)
            .map((b: any, i: number) => ({
              bedName: b.bedNumber || `Bed ${i + 1}`,
             
            }));
        }

        parsedHostels.push({
          id: docSnap.id,
          name: hostelName,
          fee: fee,
          yearGroup: yearGroup,
          vacantBeds: beds,
          vacantBedsCount: beds.length,
          totalBeds: Math.max(beds.length, (Array.isArray(data['beds']) ? data['beds'].length : 50)),
          selectedBed: null,
          ...data
        });
      });

      const bookingQuery = query(
        collection(this.firestore, 'studentDormBookings'),
        where('studentId', '==', this.currentUserId)
      );
      const bookingSnap = await getDocs(bookingQuery);

      this.myBooking = null;
      bookingSnap.forEach((docSnap) => {
        this.myBooking = { id: docSnap.id, ...docSnap.data() };
      });

      this.hostelsList = parsedHostels;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading hostels:', error);
    }
  }

  async bookBed(hostel: any) {
    if (!hostel.selectedBed) return;

    try {
      await addDoc(collection(this.firestore, 'studentDormBookings'), {
        studentId: this.currentUserId,
        dormId: hostel.id,
        hostelName: hostel.name,
    
        bedNumber: hostel.selectedBed.bedName || hostel.selectedBed.name || 'Bed 1',
        fee: hostel.fee,
        createdAt: Timestamp.now()
      });

      await this.loadHostels();
    } catch (error) {
      console.error('Error booking bed:', error);
    }
  }

  async cancelBooking(bookingId: string) {
    try {
      await deleteDoc(doc(this.firestore, 'studentDormBookings', bookingId));
      await this.loadHostels();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  }
}