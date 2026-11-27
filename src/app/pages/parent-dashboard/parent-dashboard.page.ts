import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonButton, IonButtons, IonIcon,
  IonBadge, IonText
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDoc, collection, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';

interface FeeTransaction {
  reference: string;
  mode: string;
  amount: number;
  status: string;
  dateStr: string;
}

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
    IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonButton, IonButtons, IonIcon,
    IonBadge, IonText
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-title>Parent Portal</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()">
            <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">

      <!-- Student Banner -->
      <ion-card class="student-banner ion-padding">
        <ion-card-header>
          <ion-card-subtitle color="light">Linked Student Profile</ion-card-subtitle>
          <ion-card-title style="color: white; font-size: 1.5rem;">{{ studentFullName }}</ion-card-title>
        </ion-card-header>
        <ion-card-content style="color: white; opacity: 0.9;">
          <p>Admission No: <strong>{{ studentAdm }}</strong> | Class: <strong>{{ studentClass }}</strong></p>
          <ion-badge color="success" style="margin-top: 0.5rem;">{{ studentStatus }}</ion-badge>
        </ion-card-content>
      </ion-card>

      <!-- Metrics Grid -->
      <ion-grid class="ion-no-padding">
        <ion-row>
          <!-- Fee Balance -->
          <ion-col size="12" size-md="4">
            <ion-card class="metric-card">
              <ion-card-content>
                <p class="metric-label">Fee Balance</p>
                <h2 class="metric-value">Ksh {{ feeBalance.toLocaleString() }}</h2>
                <ion-text [color]="feeStatusColor">
                  <p style="font-size: 0.8rem; font-weight: 500; margin-top: 4px;">{{ feeStatusText }}</p>
                </ion-text>
                <ion-button expand="block" color="success" size="small" style="margin-top: 1rem;" (click)="payFeesWithPaystack()">
                  Pay Fees via Paystack
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- Attendance Rate -->
          <ion-col size="12" size-md="4">
            <ion-card class="metric-card">
              <ion-card-content>
                <p class="metric-label">Attendance Rate</p>
                <h2 class="metric-value">{{ attendanceRate }}%</h2>
                <ion-text [color]="attendanceColor">
                  <p style="font-size: 0.8rem; font-weight: 500; margin-top: 4px;">CUE Requirement: Min 75%</p>
                </ion-text>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <!-- Published Results -->
          <ion-col size="12" size-md="4">
            <ion-card class="metric-card">
              <ion-card-content>
                <p class="metric-label">Published Results</p>
                <h2 class="metric-value">{{ publishedResultsCount }}</h2>
                <ion-text color="medium">
                  <p style="font-size: 0.8rem; font-weight: 500; margin-top: 4px;">Verified academic units</p>
                </ion-text>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Fee Payment Transactions History -->
      <ion-card style="margin-top: 1.5rem;">
        <ion-card-header>
          <ion-card-title style="font-size: 1.1rem;">Fee Payment Transactions History</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                  <th style="padding: 10px;">Reference Code</th>
                  <th style="padding: 10px;">Mode</th>
                  <th style="padding: 10px;">Amount Paid</th>
                  <th style="padding: 10px;">Status</th>
                  <th style="padding: 10px;">Date / Time</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let tx of feeTransactions" style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px;"><code>{{ tx.reference }}</code></td>
                  <td style="padding: 10px;">{{ tx.mode }}</td>
                  <td style="padding: 10px; font-weight: bold;">Ksh {{ tx.amount.toLocaleString() }}</td>
                  <td style="padding: 10px;">
                    <ion-badge color="success">{{ tx.status }}</ion-badge>
                  </td>
                  <td style="padding: 10px; font-size: 0.85rem; color: #64748b;">{{ tx.dateStr }}</td>
                </tr>
                <tr *ngIf="feeTransactions.length === 0">
                  <td colspan="5" style="text-align: center; padding: 1.5rem; color: #64748B;">No payment transactions found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Exam Results Section -->
      <ion-card style="margin-top: 1.5rem;">
        <ion-card-header>
          <ion-card-title style="font-size: 1.1rem;">Official Exam Results</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                  <th style="padding: 10px;">Unit / Subject</th>
                  <th style="padding: 10px;">Term</th>
                  <th style="padding: 10px;">Score</th>
                  <th style="padding: 10px;">Grade</th>
                  <th style="padding: 10px;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let res of examResults" style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px; font-weight: 600;">{{ res.subject }}</td>
                  <td style="padding: 10px;">{{ res.term }}</td>
                  <td style="padding: 10px;">{{ res.score }}</td>
                  <td style="padding: 10px; font-weight: bold;">{{ res.grade }}</td>
                  <td style="padding: 10px;">
                    <ion-badge [color]="res.isPublished ? 'success' : 'danger'">
                      {{ res.status }}
                    </ion-badge>
                  </td>
                </tr>
                <tr *ngIf="examResults.length === 0">
                  <td colspan="5" style="text-align: center; padding: 1.5rem; color: #64748B;">No exam results posted yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Recent Attendance Logs -->
      <ion-card style="margin-top: 1.5rem; margin-bottom: 2rem;">
        <ion-card-header>
          <ion-card-title style="font-size: 1.1rem;">Recent Attendance Logs</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                  <th style="padding: 10px;">Date</th>
                  <th style="padding: 10px;">Unit / Subject</th>
                  <th style="padding: 10px;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let att of attendanceLogs" style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px;">{{ att.date }}</td>
                  <td style="padding: 10px; font-weight: 600;">{{ att.subject }}</td>
                  <td style="padding: 10px;">
                    <ion-badge color="success">{{ att.status }}</ion-badge>
                  </td>
                </tr>
                <tr *ngIf="attendanceLogs.length === 0">
                  <td colspan="3" style="text-align: center; padding: 1.5rem; color: #64748B;">No attendance logs found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ion-card-content>
      </ion-card>

    </ion-content>
  `,
  styles: [`
    .student-banner { background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); border-radius: 12px; }
    .metric-card { border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .metric-label { font-size: 0.85rem; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 0.5rem; }
    .metric-value { font-size: 1.75rem; font-weight: 700; color: #0f172a; }
  `]
})
export class ParentDashboardPage implements OnInit {
  parentEmail: string = '';
  studentFullName: string = 'Loading Student...';
  studentAdm: string = '---';
  studentClass: string = '---';
  studentStatus: string = 'Enrolled';

  feeBalance: number = 0;
  feeStatusText: string = 'Checking account status...';
  feeStatusColor: string = 'medium';

  attendanceRate: number = 0;
  attendanceColor: string = 'medium';

  publishedResultsCount: number = 0;

  examResults: any[] = [];
  attendanceLogs: any[] = [];
  feeTransactions: FeeTransaction[] = [];

  private studentUidGlobal: string = '';
  private firebaseApp?: FirebaseApp;
  private db?: Firestore;
  private readonly paystackPublicKey = 'pk_test_d50375931335caad609f6ae4d3ff828bd0c066cc';

  private firebaseConfig = {
    apiKey: "AIzaSyCJKSBVleO-WCMBl1XUpRd1NDedAtKUsmI",
    authDomain: "elimu-database.firebaseapp.com",
    projectId: "elimu-database",
    storageBucket: "elimu-database.firebasestorage.app",
    messagingSenderId: "341586622750",
    appId: "1:341586622750:web:26634351fe5f55bdb5f10f",
    measurementId: "G-DT8VYBS3DV"
  };

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    addIcons({ logOutOutline });
  }

  ngOnInit() {
    this.initFirebaseAndAuth();
  }

  private getDbInstance(): Firestore {
    if (!this.firebaseApp) {
      this.firebaseApp = initializeApp(this.firebaseConfig);
    }
    if (!this.db) {
      this.db = getFirestore(this.firebaseApp);
    }
    return this.db;
  }

  private async logPaystackError(
    stage: 'script_load' | 'init_setup' | 'checkout_error' | 'firestore_save',
    error: any,
    payloadSummary?: Record<string, any>
  ) {
    const timestamp = new Date().toISOString();
    const errorMessage =
      error?.message ||
      error?.response?.data?.message ||
      (typeof error === 'string' ? error : JSON.stringify(error));

    console.error(`[PAYSTACK_LOG][${stage}][${timestamp}]`, {
      message: errorMessage,
      code: error?.code || error?.status || null,
      studentUid: this.studentUidGlobal || null,
      parentEmail: this.parentEmail || null,
      payload: payloadSummary || null,
      rawError: error
    });

    try {
      const db = this.getDbInstance();
      const logId = `ERR_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      await setDoc(doc(collection(db, 'paystackErrorLogs'), logId), {
        stage,
        message: errorMessage,
        code: error?.code || error?.status || null,
        studentUid: this.studentUidGlobal || null,
        parentEmail: this.parentEmail || null,
        payload: payloadSummary || null,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        createdAt: serverTimestamp()
      });
    } catch (logWriteErr) {
      console.warn('[PAYSTACK_LOG] Could not write error log to Firestore:', logWriteErr);
    }
  }

  initFirebaseAndAuth() {
    const db = this.getDbInstance();
    const auth = getAuth(this.firebaseApp!);

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.parentEmail = user.email || '';

      try {
        const parentSnap = await getDoc(doc(db, 'parents', user.uid));
        if (!parentSnap.exists()) {
          console.error('Parent profile configuration not found.');
          return;
        }

        const parentData = parentSnap.data();
        const studentId = parentData['studentId'];
        this.studentUidGlobal = studentId;

        if (!studentId) {
          this.studentFullName = 'No Student Linked';
          this.studentStatus = 'Unlinked';
          this.cdr.detectChanges();
          return;
        }

        const studentSnap = await getDoc(doc(db, 'students', studentId));
        if (!studentSnap.exists()) {
          this.studentFullName = 'Student Record Not Found';
          this.cdr.detectChanges();
          return;
        }

        const sData = studentSnap.data();
        this.studentFullName = sData['fullName'] || `${sData['firstName'] || ''} ${sData['lastName'] || ''}`.trim() || 'Student';
        this.studentAdm = sData['admissionNumber'] || sData['admissionNo'] || sData['admNo'] || 'N/A';
        this.studentClass = sData['className'] || sData['class'] || sData['form'] || 'Form 1';

        try {
          const feeSnap = await getDoc(doc(db, 'studentAccountBalances', studentId));
          if (feeSnap.exists()) {
            this.feeBalance = feeSnap.data()['balance'] || feeSnap.data()['outstandingBalance'] || 0;
          }
        } catch (e) {
          console.warn('Fee balance read error:', e);
        }

        if (this.feeBalance > 0) {
          this.feeStatusText = 'Balance pending clearance';
          this.feeStatusColor = 'danger';
        } else {
          this.feeStatusText = 'Account Fully Cleared';
          this.feeStatusColor = 'success';
        }

        const txMap = new Map<string, FeeTransaction>();
        try {
          const paySnap = await getDocs(collection(db, 'feePayments'));
          paySnap.forEach(d => {
            const t: any = d.data();
            if (t.studentUid === studentId || t.studentId === studentId || (t.parentEmail && this.parentEmail && t.parentEmail.toLowerCase() === this.parentEmail.toLowerCase())) {
              txMap.set(d.id, {
                reference: t.reference || d.id,
                mode: 'Paystack',
                amount: Number(t.amount) || 0,
                status: t.status || 'Successful',
                dateStr: t.createdAt?.toDate ? t.createdAt.toDate().toLocaleString() : 'Recent'
              });
            }
          });
        } catch (e) { console.warn('Fee payments read error:', e); }

        try {
          const feeTxSnap = await getDocs(collection(db, 'feeTransactions'));
          feeTxSnap.forEach(d => {
            const t: any = d.data();
            if (t.studentUid === studentId || t.studentId === studentId || (t.admissionNumber && this.studentAdm && t.admissionNumber === this.studentAdm)) {
              if (!txMap.has(d.id)) {
                txMap.set(d.id, {
                  reference: t.reference || t.transactionCode || d.id,
                  mode: t.paymentMode || 'Paystack',
                  amount: Number(t.amount) || 0,
                  status: t.status || 'Successful',
                  dateStr: t.submittedAt?.toDate ? t.submittedAt.toDate().toLocaleString() : 'Recent'
                });
              }
            }
          });
        } catch (e) { console.warn('Fee transactions read error:', e); }

        this.feeTransactions = Array.from(txMap.values());

        let resultsList: any[] = [];
        try {
          const allResSnap = await getDocs(collection(db, 'examResults'));
          allResSnap.forEach(d => {
            const r = d.data();
            if (r['studentUid'] === studentId || r['studentId'] === studentId || (r['admissionNumber'] && this.studentAdm && r['admissionNumber'] === this.studentAdm)) {
              resultsList.push(r);
            }
          });
        } catch (e) { console.warn('Exam results query failed', e); }

        this.publishedResultsCount = 0;
        this.examResults = resultsList.map(r => {
          const statusStr = (r['status'] || 'Published').toLowerCase();
          const isPublished = statusStr === 'published' || statusStr === 'active';
          if (isPublished) this.publishedResultsCount++;

          const scoreVal = r['score'] !== undefined ? r['score'] : (r['marks'] || '---');
          const gradeVal = r['grade'] || '---';

          return {
            subject: r['subject'] || r['unitName'] || 'Unit',
            term: r['academicTerm'] || r['term'] || 'Current Term',
            score: isPublished ? (scoreVal + (typeof scoreVal === 'number' ? '%' : '')) : '---',
            grade: isPublished ? gradeVal : '---',
            status: r['status'] || 'Published',
            isPublished: isPublished
          };
        });

        let attList: any[] = [];
        try {
          const allAttSnap = await getDocs(collection(db, 'attendance'));
          allAttSnap.forEach(d => {
            const a = d.data();
            if (a['studentUid'] === studentId || a['studentId'] === studentId) {
              attList.push(a);
            }
          });
        } catch (e) { console.warn('Attendance query failed', e); }

        if (attList.length > 0) {
          let presentCount = 0;
          this.attendanceLogs = attList.map(a => {
            const status = a['status'] || 'Present';
            if (status.toLowerCase() === 'present') presentCount++;
            return {
              date: a['dateStr'] || a['date'] || 'Recent',
              subject: a['subject'] || a['unit'] || 'Unit',
              status: status
            };
          });

          this.attendanceRate = Math.round((presentCount / attList.length) * 100);
          this.attendanceColor = this.attendanceRate >= 75 ? 'success' : 'danger';
        } else {
          this.attendanceRate = 0;
          this.attendanceColor = 'medium';
        }

        this.cdr.detectChanges();
      } catch (err) {
        console.error('Error loading parent dashboard data:', err);
      }
    });
  }

  payFeesWithPaystack() {
    if (!this.studentUidGlobal) {
      alert('Student data is still loading. Please wait a moment.');
      return;
    }

    const defaultAmt = this.feeBalance > 0 ? this.feeBalance : 5000;
    const amountInput = prompt(`Enter amount to pay in Ksh for ${this.studentFullName}:`, defaultAmt.toString());
    if (!amountInput || isNaN(Number(amountInput)) || Number(amountInput) <= 0) return;

    const amountInKsh = Number(amountInput);
    const amountInSubunits = Math.round(amountInKsh * 100);
    const payerEmail = (this.parentEmail || '').trim() || 'parent@elimu.com';
    const reference = 'ELIMU_' + Math.floor((Math.random() * 1000000000) + 1);
    const payloadSummary = {
      email: payerEmail,
      amountInKsh,
      amountInSubunits,
      currency: 'KES',
      reference
    };

    console.log('[PAYSTACK_LOG][attempt]', payloadSummary);

    const proceedWithPaystack = (paystackPop: any) => {
      const db = this.getDbInstance();

      try {
        if (typeof paystackPop?.setup !== 'function') {
          const setupErr = new Error('PaystackPop.setup is not a function.');
          void this.logPaystackError('init_setup', setupErr, payloadSummary);
          alert('Paystack checkout is unavailable right now.');
          return;
        }

        const handler = paystackPop.setup({
          key: this.paystackPublicKey,
          email: payerEmail,
          amount: amountInSubunits,
          currency: 'KES',
          ref: reference,
          callback: (response: any) => {
            const txRef = response?.reference || reference;
            alert('Payment successful! Reference: ' + txRef);

            (async () => {
              try {
                await setDoc(doc(collection(db, 'feePayments'), txRef), {
                  studentUid: this.studentUidGlobal,
                  parentEmail: payerEmail,
                  amount: amountInKsh,
                  reference: txRef,
                  status: 'Successful',
                  createdAt: serverTimestamp()
                });

                window.location.reload();
              } catch (err) {
                await this.logPaystackError('firestore_save', err, { ...payloadSummary, txRef });
              }
            })();
          },
          onClose: () => {
            console.log('Payment window closed.');
          }
        });

        handler.openIframe();
      } catch (initErr) {
        void this.logPaystackError('init_setup', initErr, payloadSummary);
        alert('Paystack initialization failed. Check console or paystackErrorLogs.');
      }
    };

    const existingPaystack = (window as any)['PaystackPop'];
    if (existingPaystack) {
      proceedWithPaystack(existingPaystack);
      return;
    }

    const scriptId = 'paystack-inline-js';
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        const loadedPaystack = (window as any)['PaystackPop'];
        if (loadedPaystack) {
          proceedWithPaystack(loadedPaystack);
        } else {
          const missingErr = new Error('PaystackPop global missing after script load.');
          void this.logPaystackError('script_load', missingErr, payloadSummary);
          alert('Paystack script loaded but failed to initialize.');
        }
      });
      existingScript.addEventListener('error', (ev) => {
        const netErr = new Error('Failed to load Paystack inline script.');
        const eventType = typeof ev === 'object' && ev !== null && 'type' in ev ? String((ev as Event).type) : 'error';
        void this.logPaystackError('script_load', netErr, { ...payloadSummary, eventType });
        alert('Paystack payment gateway script failed to load. Please check your internet connection or disable ad blockers.');
      });
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      const loadedPaystack = (window as any)['PaystackPop'];
      if (loadedPaystack) {
        proceedWithPaystack(loadedPaystack);
      } else {
        const missingErr = new Error('PaystackPop global missing after script load.');
        void this.logPaystackError('script_load', missingErr, payloadSummary);
        alert('Paystack script loaded but failed to initialize.');
      }
    };
    script.onerror = (ev) => {
      const netErr = new Error('Network or blocker prevented loading js.paystack.co.');
      const eventType = typeof ev === 'object' && ev !== null && 'type' in ev ? String((ev as Event).type) : 'error';
      void this.logPaystackError('script_load', netErr, { ...payloadSummary, eventType });
      alert('Paystack payment gateway script failed to load. Please check your internet connection or disable ad blockers.');
    };
    document.body.appendChild(script);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}