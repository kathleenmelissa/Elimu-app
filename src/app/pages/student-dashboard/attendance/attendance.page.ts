import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonIcon, IonBadge, IonSpinner
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, timeOutline, checkmarkCircleOutline, wifiOutline } from 'ionicons/icons';
import { Auth, User, onAuthStateChanged } from '@angular/fire/auth';
import {
  Firestore, collection, query, where, getDocs, getDoc, addDoc, doc, serverTimestamp
} from '@angular/fire/firestore';

type NetState =
  | 'checking'
  | 'verified'
  | 'unconfigured'
  | 'wrong-network'
  | 'unregistered'
  | 'wrong-device'
  | 'error';

interface AttendanceRecord {
  id: string;
  subject: string;
  dateFormatted: string;
  sortKey: number;
  status: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonCard, IonCardContent, IonIcon, IonBadge, IonSpinner
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/student/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Class Attendance</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="attendance-content">
      <div class="container">

        <!-- Network / Device Status Banner -->
        <div class="net-banner" [ngClass]="bannerClass">
          <ion-icon [name]="netState === 'verified' ? 'checkmark-circle-outline' : (netState === 'checking' ? 'wifi-outline' : 'alert-circle-outline')"></ion-icon>
          <div class="net-text">
            <span>{{ netMessage }}</span>
          </div>
          <button class="recheck-btn" *ngIf="netState !== 'checking' && netState !== 'verified'" (click)="verifyNetworkAndDevice()">
            Re-check
          </button>
        </div>

        <!-- Error / Success -->
        <div *ngIf="errorMessage" class="alert-box error">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <span>{{ errorMessage }}</span>
        </div>
        <div *ngIf="successMessage" class="alert-box success">
          <ion-icon name="checkmark-circle-outline"></ion-icon>
          <span>{{ successMessage }}</span>
        </div>

        <!-- Mark Attendance -->
        <div class="section-block">
          <h3>Mark Present</h3>
          <p class="section-subtitle">Select your unit and mark attendance. Requires the School Wi-Fi network and your registered device.</p>

          <ion-card class="form-card">
            <ion-card-content>
              <div *ngIf="isLoading" class="loading-inline">
                <ion-spinner name="crescent"></ion-spinner> Loading your units...
              </div>

              <ng-container *ngIf="!isLoading">
                <div class="input-group">
                  <label>Select Unit / Subject</label>
                  <select [(ngModel)]="selectedSubject" class="custom-select" [disabled]="registeredUnits.length === 0">
                    <option [ngValue]="null" disabled>
                      {{ registeredUnits.length === 0 ? 'No registered units found. Register units first.' : '-- Choose Unit --' }}
                    </option>
                    <option *ngFor="let unit of registeredUnits" [ngValue]="unit">{{ unit }}</option>
                  </select>
                </div>

                <button class="mark-btn" [disabled]="!canMark" (click)="markAttendance()">
                  {{ isSubmitting ? 'Verifying network & marking...' : 'Mark Present' }}
                </button>
              </ng-container>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- History -->
        <div class="section-block ion-margin-top">
          <h3>My Attendance History</h3>

          <div *ngIf="!isLoading && attendanceHistory.length === 0" class="empty-state">
            <p>No attendance records found yet.</p>
          </div>

          <div class="history-list" *ngIf="attendanceHistory.length > 0">
            <div *ngFor="let record of attendanceHistory" class="history-card">
              <div class="history-left">
                <h4>{{ record.subject }}</h4>
                <p><ion-icon name="time-outline"></ion-icon> {{ record.dateFormatted }}</p>
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

    .net-banner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; background: #f1f5f9; color: #334155; }
    .net-banner ion-icon { font-size: 22px; flex-shrink: 0; }
    .net-text { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .net-banner.ok { background: #dcfce7; color: #166534; }
    .net-banner.warn { background: #fef3c7; color: #92400e; }
    .net-banner.bad { background: #fee2e2; color: #991b1b; }
    .recheck-btn { background: rgba(0,0,0,0.08); border: none; border-radius: 6px; padding: 6px 10px; font-size: 12px; font-weight: 600; color: inherit; cursor: pointer; }

    .alert-box { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
    .alert-box ion-icon { font-size: 20px; flex-shrink: 0; }
    .alert-box.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .alert-box.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

    .form-card { background: #ffffff; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); margin: 0; border: 1px solid #e2e8f0; }
    .loading-inline { display: flex; align-items: center; gap: 10px; color: #64748b; font-size: 13px; }
    .input-group { margin-bottom: 16px; }
    .input-group label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
    .custom-select { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; font-size: 14px; color: #0f172a; outline: none; }
    .custom-select:focus { border-color: #3b82f6; }

    .mark-btn { width: 100%; background: #2563eb; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px; border-radius: 8px; border: none; cursor: pointer; transition: background 0.2s; }
    .mark-btn:hover:not(:disabled) { background: #1d4ed8; }
    .mark-btn:disabled { background: #94a3b8; cursor: not-allowed; }

    .history-list { display: flex; flex-direction: column; gap: 10px; }
    .history-card { background: #ffffff; border-radius: 12px; padding: 14px 16px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .history-left h4 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; }
    .history-left p { font-size: 12px; color: #64748b; margin: 0 0 2px 0; display: flex; align-items: center; gap: 4px; }

    .empty-state { background: #ffffff; padding: 20px; border-radius: 12px; text-align: center; color: #64748b; font-size: 13px; border: 1px dashed #cbd5e1; }
  `]
})
export class AttendancePage {
  registeredUnits: string[] = [];
  attendanceHistory: AttendanceRecord[] = [];
  selectedSubject: string | null = null;

  currentUserId = '';
  studentData: any = {};

  private currentIp = ''; // used only for verification and saved with the record; never displayed
  netState: NetState = 'checking';
  netMessage = 'Checking network and device binding...';

  errorMessage = '';
  successMessage = '';
  isLoading = true;
  isSubmitting = false;

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  constructor() {
    addIcons({ alertCircleOutline, timeOutline, checkmarkCircleOutline, wifiOutline });
  }

  get canMark(): boolean {
    return this.netState === 'verified' && !!this.selectedSubject && !this.isSubmitting;
  }

  get bannerClass(): string {
    if (this.netState === 'verified') return 'ok';
    if (this.netState === 'unconfigured' || this.netState === 'unregistered') return 'warn';
    if (this.netState === 'wrong-network' || this.netState === 'wrong-device' || this.netState === 'error') return 'bad';
    return '';
  }

  // Ionic caches pages, so this runs every time the page is shown and always
  // loads the CURRENTLY logged-in student's data.
  async ionViewWillEnter() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.registeredUnits = [];
    this.attendanceHistory = [];
    this.selectedSubject = null;
    this.studentData = {};
    this.currentIp = '';
    this.cdr.detectChanges();

    const user = await this.waitForUser();
    if (!user) {
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }
    this.currentUserId = user.uid;

    try {
      // Student profile first: it holds the registered device IP
      try {
        const studentSnap = await getDoc(doc(this.firestore, 'students', user.uid));
        if (studentSnap.exists()) this.studentData = studentSnap.data();
      } catch (e) {
        console.warn('Could not read student profile:', e);
      }

      await Promise.all([
        this.verifyNetworkAndDevice(),
        this.loadRegisteredUnits(user.uid),
        this.loadAttendanceHistory(user.uid)
      ]);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
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

  // ---------- Units ----------
  private async loadRegisteredUnits(uid: string) {
    try {
      let rawList: any[] = [];

      const regSnap = await getDoc(doc(this.firestore, 'studentSubjects', uid));
      if (regSnap.exists()) {
        const d: any = regSnap.data();
        rawList = d.selectedSubjects || d.units || d.subjects || [];
      }

      if (rawList.length === 0 && this.studentData) {
        rawList = this.studentData.selectedSubjects || this.studentData.units || this.studentData.subjects || [];
      }

      const names = rawList.map((s: any) => {
        if (typeof s === 'string') return s.trim();
        if (s && s.name) return String(s.name).trim();
        if (s && s.subjectName) return String(s.subjectName).trim();
        return '';
      }).filter(Boolean);

      this.registeredUnits = [...new Set(names)];
    } catch (error) {
      console.error('Error loading units:', error);
      this.registeredUnits = [];
    }
  }

  // ---------- Network & device verification (same rules as the website) ----------
  private async fetchPublicIp(): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
      const data = await response.json();
      return String(data.ip || '').trim();
    } finally {
      clearTimeout(timer);
    }
  }

  async verifyNetworkAndDevice() {
    this.netState = 'checking';
    this.netMessage = 'Checking network and device binding...';
    this.cdr.detectChanges();

    try {
      // 1. Allowed school IP, set by admin in Firestore: settings/network.schoolIp
      let allowedSchoolIp = '';
      try {
        const cfg = await getDoc(doc(this.firestore, 'settings', 'network'));
        if (cfg.exists()) allowedSchoolIp = String(cfg.data()['schoolIp'] || '').trim();
      } catch (e) {
        console.warn('Could not read network settings:', e);
        this.netState = 'error';
        this.netMessage = 'Could not read the school network settings.';
        return;
      }

      // 2. This device's current public IP
      this.currentIp = await this.fetchPublicIp();

      // 3. Student's registered device IP
      const registeredDeviceIp = String(this.studentData.deviceIp || this.studentData.registeredIp || '').trim();

      // 4. Dual verification: school Wi-Fi IP AND registered device IP
      if (!allowedSchoolIp) {
        this.netState = 'unconfigured';
        this.netMessage = 'Attendance is currently unavailable. Please contact the school administrator.';
      } else if (this.currentIp !== allowedSchoolIp) {
        this.netState = 'wrong-network';
        this.netMessage = 'Access Denied: You are not connected to the School Wi-Fi network.';
      } else if (!registeredDeviceIp) {
        this.netState = 'unregistered';
        this.netMessage = 'Device Unregistered: Your device is not registered. Please visit the admin office to register your device.';
      } else if (this.currentIp !== registeredDeviceIp) {
        this.netState = 'wrong-device';
        this.netMessage = 'Device Restricted: Attendance can only be marked from your registered device.';
      } else {
        this.netState = 'verified';
        this.netMessage = 'Verified: Connected to School Wi-Fi & authorized device.';
      }
    } catch (err) {
      console.error('Network verification failed:', err);
      this.currentIp = '';
      this.netState = 'error';
      this.netMessage = 'Network Error: Could not verify your connection. Please try again.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  // ---------- History ----------
  private async loadAttendanceHistory(uid: string) {
    try {
      const col = collection(this.firestore, 'attendance');
      const queries = [
        query(col, where('studentUid', '==', uid)), // current schema (website + this app)
        query(col, where('studentId', '==', uid))   // older records saved by the previous app version
      ];

      const settled = await Promise.allSettled(queries.map(q => getDocs(q)));
      const found = new Map<string, any>();
      settled.forEach(res => {
        if (res.status === 'fulfilled') res.value.forEach(d => found.set(d.id, d.data()));
        else console.warn('Attendance query failed:', res.reason);
      });

      const history: AttendanceRecord[] = [];
      found.forEach((att: any, id: string) => {
        const ts = att.timestamp?.toDate ? att.timestamp.toDate()
                 : att.date?.toDate ? att.date.toDate()
                 : null;
        history.push({
          id,
          subject: att.subject || 'Unknown Unit',
          dateFormatted: ts ? ts.toLocaleString() : (att.dateStr || 'Recent'),
          sortKey: ts ? ts.getTime() : (att.dateStr ? new Date(att.dateStr).getTime() || 0 : 0),
          status: att.status || 'Present'
        });
      });

      this.attendanceHistory = history.sort((a, b) => b.sortKey - a.sortKey);
    } catch (error) {
      console.error('Error loading history:', error);
      this.attendanceHistory = [];
    }
  }

  // ---------- Mark attendance ----------
  async markAttendance() {
    if (!this.selectedSubject || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    try {
      // Re-check right now: the Wi-Fi may have changed since the page opened
      await this.verifyNetworkAndDevice();
      if (this.netState !== 'verified') {
        this.errorMessage = 'Security Error: Attendance requires both the School Wi-Fi network and your registered device.';
        return;
      }

      const subject = this.selectedSubject;
      const uid = this.currentUserId;
      const todayDate = new Date().toISOString().split('T')[0]; // same format as the website

      // One record per unit per day
      const existing = await getDocs(query(
        collection(this.firestore, 'attendance'),
        where('studentUid', '==', uid),
        where('subject', '==', subject),
        where('dateStr', '==', todayDate)
      ));
      if (!existing.empty) {
        this.errorMessage = `You have already marked attendance for ${subject} today.`;
        return;
      }

      const s = this.studentData;
      await addDoc(collection(this.firestore, 'attendance'), {
        studentUid: uid,
        admissionNumber: s.admissionNumber || s.admissionNo || s.admNo || 'N/A',
        studentName: s.fullName || s.name || 'Student',
        subject,
        dateStr: todayDate,
        ipAddress: this.currentIp,
        status: 'Present',
        timestamp: serverTimestamp()
      });

      this.successMessage = `Attendance successfully marked for ${subject}!`;
      this.selectedSubject = null;
      await this.loadAttendanceHistory(uid);

    } catch (error: any) {
      console.error('Error marking attendance:', error);
      this.errorMessage = 'Could not mark attendance. Please try again.';
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }
}