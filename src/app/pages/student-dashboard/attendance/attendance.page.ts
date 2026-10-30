import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonButton, IonIcon, IonSelect, IonSelectOption, IonBadge
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkboxOutline, alertCircleOutline, timeOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs, addDoc, Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonCard, IonCardContent, IonButton, IonIcon,
    IonSelect, IonSelectOption, IonBadge
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/student/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Class Attendance</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="attendance-content">
      <div class="container">
        
        <!-- Error / Device Restriction Alert -->
        <div *ngIf="errorMessage" class="alert-box error">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Success Message Alert -->
        <div *ngIf="successMessage" class="alert-box success">
          <ion-icon name="checkmark-circle-outline"></ion-icon>
          <span>{{ successMessage }}</span>
        </div>

        <!-- Mark Attendance Card -->
        <div class="section-block">
          <h3>Mark Present</h3>
          <p class="section-subtitle">Select your unit and mark attendance. Requires connection to the official School Wi-Fi network.</p>

          <ion-card class="form-card">
            <ion-card-content>
              <div class="input-group">
                <label>Select Unit / Subject</label>
                <select [(ngModel)]="selectedSubject" class="custom-select">
                  <option [ngValue]="null" disabled>-- Choose Unit --</option>
                  <option *ngFor="let unit of registeredUnits" [ngValue]="unit.name">
                    {{ unit.code }} - {{ unit.name }}
                  </option>
                </select>
              </div>

              <button class="mark-btn" [disabled]="isSubmitting || !selectedSubject" (click)="markAttendance()">
                {{ isSubmitting ? 'Verifying IP & Marking...' : 'Mark Present' }}
              </button>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Attendance History Section -->
        <div class="section-block ion-margin-top">
          <h3>My Attendance History</h3>

          <div *ngIf="attendanceHistory.length === 0" class="empty-state">
            <p>No attendance records found yet.</p>
          </div>

          <div class="history-list" *ngIf="attendanceHistory.length > 0">
            <div *ngFor="let record of attendanceHistory" class="history-card">
              <div class="history-left">
                <h4>{{ record.subject }}</h4>
                <p><ion-icon name="time-outline"></ion-icon> {{ record.dateFormatted }}</p>
                <p class="ip-text">IP: {{ record.ipAddress }}</p>
              </div>
              <ion-badge color="success">{{ record.status }}</ion-badge>
            </div>
          </div>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .attendance-content { --background: #f8fafc; }
    .container { padding: 20px; max-width: 700px; margin: 0 auto; }
    .section-block h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .section-subtitle { font-size: 13px; color: #64748b; margin-bottom: 12px; line-height: 1.4; }

    /* Alerts */
    .alert-box { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; ion-icon { font-size: 20px; flex-shrink: 0; } }
    .alert-box.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .alert-box.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

    /* Form Card */
    .form-card { background: #ffffff; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); margin: 0; border: 1px solid #e2e8f0; }
    .input-group { margin-bottom: 16px; label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; } }
    .custom-select { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; font-size: 14px; color: #0f172a; outline: none; &:focus { border-color: #3b82f6; } }

    .mark-btn { width: 100%; background: #2563eb; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px; border-radius: 8px; border: none; cursor: pointer; transition: background 0.2s; &:hover:not(:disabled) { background: #1d4ed8; } &:disabled { background: #94a3b8; cursor: not-allowed; } }

    /* History List */
    .history-list { display: flex; flex-direction: column; gap: 10px; }
    .history-card { background: #ffffff; border-radius: 12px; padding: 14px 16px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .history-left { h4 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; } p { font-size: 12px; color: #64748b; margin: 0 0 2px 0; display: flex; align-items: center; gap: 4px; } .ip-text { font-family: monospace; color: #475569; } }

    .empty-state { background: #ffffff; padding: 20px; border-radius: 12px; text-align: center; color: #64748b; font-size: 13px; border: 1px dashed #cbd5e1; }
  `]
})
export class AttendancePage implements OnInit {
  registeredUnits: any[] = [];
  attendanceHistory: any[] = [];
  selectedSubject: string | null = null;
  currentUserId: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  // School Wi-Fi Allowed IP Range or Mock Registered IP for testing
  private allowedSchoolIPPrefix = '197.232.'; 

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({ checkboxOutline, alertCircleOutline, timeOutline, checkmarkCircleOutline });
  }

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        await this.loadStudentData();
      }
    });
  }

  async loadStudentData() {
    try {
      // 1. Fetch student's registered units to populate dropdown
      const subQuery = query(
        collection(this.firestore, 'studentSubjects'),
        where('studentId', '==', this.currentUserId)
      );
      const subSnap = await getDocs(subQuery);
      this.registeredUnits = [];
      subSnap.forEach((docSnap) => {
        this.registeredUnits.push(docSnap.data());
      });

      // 2. Fetch student's attendance history from 'attendance' collection
      await this.loadAttendanceHistory();

    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
  }

  async loadAttendanceHistory() {
    try {
      const attQuery = query(
        collection(this.firestore, 'attendance'),
        where('studentId', '==', this.currentUserId)
      );
      const attSnap = await getDocs(attQuery);
      
      const history: any[] = [];
      attSnap.forEach((docSnap) => {
        const data = docSnap.data();
        let formattedDate = 'Recent';
        if (data['date'] && data['date'].toDate) {
          formattedDate = data['date'].toDate().toLocaleString();
        }

        history.push({
          id: docSnap.id,
          ...data,
          dateFormatted: formattedDate
        });
      });

      // Sort by newest check-in
      this.attendanceHistory = history.sort((a, b) => {
        return (b.date?.seconds || 0) - (a.date?.seconds || 0);
      });

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }

  async markAttendance() {
    if (!this.selectedSubject) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Fetch public IP address from ipify API
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const currentIp = data.ip;

      // IP Validation check (Ensure it connects via school network range or registered device IP)
      // Note: For local development testing, you can temporarily comment out this `if` block if testing on home Wi-Fi.
      if (!currentIp.startsWith(this.allowedSchoolIPPrefix)) {
        this.errorMessage = `Device Restricted: Attendance can only be marked from your registered device IP / School Wi-Fi. (Detected IP: ${currentIp})`;
        this.isSubmitting = false;
        this.cdr.detectChanges();
        return;
      }

      // Save attendance record to Firestore 'attendance' collection
      await addDoc(collection(this.firestore, 'attendance'), {
        studentId: this.currentUserId,
        subject: this.selectedSubject,
        ipAddress: currentIp,
        status: 'Present',
        date: Timestamp.now()
      });

      this.successMessage = 'Attendance marked successfully!';
      this.selectedSubject = null;
      await this.loadAttendanceHistory();

    } catch (error) {
      console.error('Error marking attendance:', error);
      this.errorMessage = 'Failed to verify IP or connect to network. Please try again.';
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }
}