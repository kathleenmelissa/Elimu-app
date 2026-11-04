import { Component, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonIcon, IonBadge
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { receiptOutline } from 'ionicons/icons';
import { Auth, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, onSnapshot, Unsubscribe } from '@angular/fire/firestore';

interface AccountData {
  admissionNumber: string;
  className: string;
  totalBill: number;
  tuitionFee: number;
  hostelFee: number;
  amountPaid: number;
  balance: number;
  lastPaymentMode: string;
  lastReference: string;
}

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonCard, IonCardContent, IonIcon, IonBadge
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/student/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Fee Statement & Balances</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="fees-content">
      <div class="container">

        <div *ngIf="loading" class="empty-state">
          <p>Loading account financial data...</p>
        </div>

        <div *ngIf="!loading && !accountData" class="empty-state">
          <p>No billing record has been generated for your account yet.
             Register your units first, or contact the accounts office.</p>
        </div>

        <div *ngIf="!loading && accountData" class="fee-dashboard">

          <!-- Balance Summary Card -->
          <div class="balance-card">
            <div class="balance-info">
              <span class="label">Current Balance Due</span>
              <h2>KES {{ accountData.balance | number }}</h2>
              <p>Admission No: <strong>{{ accountData.admissionNumber }}</strong> | Class: {{ accountData.className }}</p>
            </div>
            <div class="balance-badge-box">
              <ion-badge [color]="accountData.balance > 0 ? 'danger' : 'success'">
                {{ accountData.balance > 0 ? 'Balance Due' : 'Cleared' }}
              </ion-badge>
            </div>
          </div>

          <!-- Fee Breakdown -->
          <div class="section-block ion-margin-top">
            <h3>Term Fee Breakdown</h3>
            <ion-card class="breakdown-card">
              <ion-card-content>
                <div class="fee-row">
                  <span>Total Bill / Term Assessment</span>
                  <strong>KES {{ accountData.totalBill | number }}</strong>
                </div>
                <div class="fee-row">
                  <span>Tuition Fee</span>
                  <span>KES {{ accountData.tuitionFee | number }}</span>
                </div>
                <div class="fee-row">
                  <span>Dormitory / Hostel Fee</span>
                  <span>KES {{ accountData.hostelFee | number }}</span>
                </div>
                <div class="fee-row paid-row">
                  <span>Total Amount Paid</span>
                  <strong class="text-success">- KES {{ accountData.amountPaid | number }}</strong>
                </div>
                <div class="fee-row total-row">
                  <span>Net Balance</span>
                  <strong [class.text-danger]="accountData.balance > 0" [class.text-success]="accountData.balance <= 0">
                    KES {{ accountData.balance | number }}
                  </strong>
                </div>
              </ion-card-content>
            </ion-card>
          </div>

          <!-- Last Payment -->
          <div class="section-block ion-margin-top" *ngIf="accountData.amountPaid > 0">
            <h3>Recent Transaction Record</h3>
            <div class="transaction-box">
              <div class="txn-left">
                <div class="txn-icon"><ion-icon name="receipt-outline"></ion-icon></div>
                <div>
                  <h4>{{ accountData.lastPaymentMode }} Payment</h4>
                  <p>Ref: <strong>{{ accountData.lastReference }}</strong></p>
                </div>
              </div>
              <div class="txn-right">
                <span class="txn-amount">+ KES {{ accountData.amountPaid | number }}</span>
                <span class="txn-status">Verified</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .fees-content { --background: #f8fafc; }
    .container { padding: 20px; max-width: 700px; margin: 0 auto; }
    .section-block h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }

    .empty-state { background: #ffffff; padding: 24px; border-radius: 12px; text-align: center; color: #64748b; font-size: 13px; border: 1px dashed #cbd5e1; margin-top: 20px; }

    .balance-card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 24px; color: #ffffff; display: flex; justify-content: space-between; align-items: flex-start; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .balance-info .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; }
    .balance-info h2 { font-size: 28px; font-weight: 800; margin: 6px 0; color: #f8fafc; }
    .balance-info p { font-size: 13px; color: #cbd5e1; margin: 0; }

    .breakdown-card { background: #ffffff; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); margin: 0; border: 1px solid #e2e8f0; }
    .fee-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
    .paid-row { color: #16a34a; }
    .total-row { font-size: 16px; font-weight: 700; border-top: 2px solid #e2e8f0; border-bottom: none; margin-top: 4px; padding-top: 14px; color: #0f172a; }
    .text-success { color: #16a34a; }
    .text-danger { color: #dc2626; }

    .transaction-box { background: #ffffff; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .txn-left { display: flex; align-items: center; gap: 12px; }
    .txn-left h4 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0; }
    .txn-left p { font-size: 12px; color: #64748b; margin: 0; }
    .txn-icon { background: #eff6ff; color: #2563eb; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .txn-right { display: flex; flex-direction: column; align-items: flex-end; }
    .txn-amount { font-size: 15px; font-weight: 700; color: #16a34a; }
    .txn-status { font-size: 11px; background: #f0fdf4; color: #16a34a; padding: 2px 6px; border-radius: 4px; font-weight: 600; margin-top: 2px; }
  `]
})
export class FeesPage implements OnDestroy {
  accountData: AccountData | null = null;
  loading = true;

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  private balanceUnsub?: Unsubscribe;

  constructor() {
    addIcons({ receiptOutline });
  }

  // Ionic caches pages, so ngOnInit does NOT run again when a different
  // student logs in. ionViewWillEnter runs every time the page is shown.
  async ionViewWillEnter() {
    this.stopListening();
    this.accountData = null;
    this.loading = true;
    this.cdr.detectChanges();

    const user = await this.waitForUser();
    if (!user) {
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }
    this.listenToBalance(user.uid);
  }

  ionViewWillLeave() {
    this.stopListening();
  }

  ngOnDestroy() {
    this.stopListening();
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

  // Same lookup as the website: studentAccountBalances/{uid}, updated in real time
  private listenToBalance(uid: string) {
    this.balanceUnsub = onSnapshot(
      doc(this.firestore, 'studentAccountBalances', uid),
      snap => {
        if (snap.exists()) {
          const d: any = snap.data();
          this.accountData = {
            admissionNumber: d.admissionNumber || 'N/A',
            className: d.className || '-',
            totalBill: Number(d.totalBill || 0),
            tuitionFee: Number(d.tuitionFee || 0),
            hostelFee: Number(d.hostelFee || 0),
            amountPaid: Number(d.amountPaid || 0),
            balance: Number(d.balance || 0),
            lastPaymentMode: d.lastPaymentMode || 'M-Pesa',
            lastReference: d.lastReference || 'N/A'
          };
        } else {
          this.accountData = null;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      err => {
        console.error('Error fetching fee balance:', err);
        this.accountData = null;
        this.loading = false;
        this.cdr.detectChanges();
      }
    );
  }

  private stopListening() {
    this.balanceUnsub?.();
    this.balanceUnsub = undefined;
  }
}