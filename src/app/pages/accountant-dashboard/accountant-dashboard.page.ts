import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonIcon,
  IonButtons, IonMenuButton, IonSpinner, MenuController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  walletOutline, logOutOutline, schoolOutline, receiptOutline, statsChartOutline
} from 'ionicons/icons';
import { Auth, User, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { Firestore, collection, getDocs, doc, setDoc, addDoc, onSnapshot, query, where, serverTimestamp } from '@angular/fire/firestore';

interface StudentAccount {
  uid: string;
  admissionNumber: string;
  studentName: string;
  unitsCount: number;
  tuitionFee: number;
  hostelName: string | null;
  hostelFee: number;
  totalBill: number;
  amountPaid: number;
  balance: number;
  paymentMode: string;
  referenceCode: string;
  paymentAmount: number | '';
}

interface PendingTransaction {
  id: string;
  dateStr: string;
  admissionNumber: string;
  studentName: string;
  paymentMode: string;
  transactionCode: string;
  amount: number;
}

@Component({
  selector: 'app-accountant-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, RouterLinkActive,
    IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonLabel, IonIcon,
    IonButtons, IonMenuButton, IonSpinner
  ],
  template: `
    <ion-split-pane content-id="accountant-main-content">

      <!-- Accountant Sidebar -->
      <ion-menu content-id="accountant-main-content" menuId="accountant-menu" side="start">
        <ion-header>
          <ion-toolbar class="sidebar-toolbar">
            <div class="brand-container">
              <ion-icon name="wallet-outline" class="brand-icon"></ion-icon>
              <ion-title class="brand-title">Finance Portal</ion-title>
            </div>
          </ion-toolbar>
        </ion-header>

        <ion-content class="sidebar-content">
          <ion-list lines="none" class="nav-list">
            <ion-item routerLink="/accountant/dashboard" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="wallet-outline" slot="start"></ion-icon>
              <ion-label>Fee Management</ion-label>
            </ion-item>
            <ion-item routerLink="/accountant/expenses" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="receipt-outline" slot="start"></ion-icon>
              <ion-label>School Expenses</ion-label>
            </ion-item>
            <ion-item routerLink="/accountant/analytics" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="stats-chart-outline" slot="start"></ion-icon>
              <ion-label>Financial Analytics</ion-label>
            </ion-item>
            <ion-item button (click)="logout()" class="nav-item logout-item">
              <ion-icon name="log-out-outline" slot="start" color="danger"></ion-icon>
              <ion-label color="danger">Logout</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-menu>

      <!-- Main Content -->
      <ion-content id="accountant-main-content" class="main-content-wrapper">
        <ion-header>
          <ion-toolbar class="header-gradient-toolbar">
            <ion-buttons slot="start">
              <ion-menu-button menu="accountant-menu" class="menu-btn" (click)="toggleMenu()"></ion-menu-button>
            </ion-buttons>
            <ion-title>Accountant & Fee Management Dashboard</ion-title>
          </ion-toolbar>
        </ion-header>

        <div class="content-body">
          
          <!-- Overview Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Total Students Billable</span>
              <span class="stat-value">{{ totalStudentsCount }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Tuition Fee Rate Per Unit</span>
              <span class="stat-value">KES 10,000</span>
            </div>
          </div>

          <!-- Student Accounts Table Card -->
          <div class="card">
            <div class="card-title">Student Fee Accounts & Unit Billing</div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Adm No.</th>
                    <th>Student Name</th>
                    <th>Registered Units</th>
                    <th>Tuition Fee (KES)</th>
                    <th>Hostel Status & Fee</th>
                    <th>Total Bill (KES)</th>
                    <th>Amount Paid (KES)</th>
                    <th>Fee Balance (KES)</th>
                    <th>Record Payment (Mode & Ref)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="isLoadingStudents">
                    <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                      <ion-spinner name="crescent" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 6px;"></ion-spinner>
                      Loading student financial accounts...
                    </td>
                  </tr>
                  <tr *ngIf="!isLoadingStudents && studentAccounts.length === 0">
                    <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">No students found in the database.</td>
                  </tr>
                  <ng-container *ngIf="!isLoadingStudents">
                    <tr *ngFor="let student of studentAccounts">
                      <td><strong>{{ student.admissionNumber }}</strong></td>
                      <td>{{ student.studentName }}</td>
                      <td>{{ student.unitsCount }} Units</td>
                      <td>KES {{ student.tuitionFee.toLocaleString() }}</td>
                      <td>
                        <span [style.color]="student.hostelName ? 'var(--success)' : 'var(--text-muted)'" style="font-weight: 600;">
                          {{ student.hostelName ? student.hostelName + ' (KES ' + student.hostelFee.toLocaleString() + ')' : 'None' }}
                        </span>
                      </td>
                      <td><strong>KES {{ student.totalBill.toLocaleString() }}</strong></td>
                      <td>KES {{ student.amountPaid.toLocaleString() }}</td>
                      <td [style.color]="student.balance > 0 ? 'var(--danger)' : 'var(--success)'" style="font-weight: 700;">
                        KES {{ student.balance.toLocaleString() }}
                      </td>
                      <td>
                        <div style="display: flex; flex-direction: column; gap: 0.3rem; min-width: 170px;">
                          <select [(ngModel)]="student.paymentMode">
                            <option value="M-Pesa">M-Pesa</option>
                            <option value="Bank">Bank Deposit</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Bursary">Bursary</option>
                          </select>
                          <input type="text" [(ngModel)]="student.referenceCode" placeholder="Reference / Trans ID">
                          <input type="number" class="amount-input" [(ngModel)]="student.paymentAmount" placeholder="Amount (KES)" min="0">
                          <button class="btn-primary" (click)="submitPaymentForApproval(student)">Submit for VC Approval</button>
                        </div>
                      </td>
                    </tr>
                  </ng-container>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pending Transactions for VC Approval Card -->
          <div class="card">
            <div class="card-title">Pending Fee Transactions (Awaiting VC Approval)</div>
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem;">
              These payments have been submitted by the accountant and are currently on hold pending Vice Chancellor authorization.
            </p>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date Submitted</th>
                    <th>Adm No.</th>
                    <th>Student Name</th>
                    <th>Payment Mode</th>
                    <th>Reference / Code</th>
                    <th>Amount (KES)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="isLoadingPending">
                    <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                      <ion-spinner name="crescent" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 6px;"></ion-spinner>
                      Loading pending transactions...
                    </td>
                  </tr>
                  <tr *ngIf="!isLoadingPending && pendingTransactions.length === 0">
                    <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No pending transactions in the queue.</td>
                  </tr>
                  <ng-container *ngIf="!isLoadingPending">
                    <tr *ngFor="let txn of pendingTransactions">
                      <td>{{ txn.dateStr }}</td>
                      <td><strong>{{ txn.admissionNumber }}</strong></td>
                      <td>{{ txn.studentName }}</td>
                      <td>{{ txn.paymentMode }}</td>
                      <td><code style="background: #F1F5F9; padding: 0.2rem 0.4rem; border-radius: 4px; font-weight: 600;">{{ txn.transactionCode }}</code></td>
                      <td><strong>KES {{ txn.amount.toLocaleString() }}</strong></td>
                      <td><span style="color: #D97706; font-weight: 600; background: #FEF3C7; padding: 0.2rem 0.5rem; border-radius: 4px;">Pending VC Approval</span></td>
                    </tr>
                  </ng-container>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </ion-content>

    </ion-split-pane>
  `,
  styles: [`
    ion-menu { --width: 260px; }
    .sidebar-toolbar { --background: #0F172A; --color: #2563EB; padding: 6px 12px; }
    .brand-container { display: flex; align-items: center; gap: 10px; width: 100%; }
    .brand-icon { font-size: 24px; color: #3880ff; flex-shrink: 0; }
    .brand-title { font-size: 16px; font-weight: 700; color: #FFFFFF; padding: 0; min-height: unset; }
    .sidebar-content { --background: #0F172A; }
    .nav-list { background: transparent; padding: 8px 0; }
    .nav-item { --background: transparent; --background-hover: rgba(255, 255, 255, 0.06); --color: #94A3B8; font-weight: 500; font-size: 14px; margin-bottom: 2px; --padding-start: 12px; }
    .active-link { --background: rgba(255, 255, 255, 0.08) !important; --color: #FFFFFF !important; font-weight: 600; border-left: 4px solid #2563EB; }
    .logout-item { margin-top: 12px; }

    .header-gradient-toolbar { --background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%); --color: #ffffff; }
    .menu-btn { color: #ffffff; }
    .main-content-wrapper { --background: #F8FAFC; }

    .content-body { padding: 2rem; max-width: 1400px; width: 100%; margin: 0 auto; box-sizing: border-box; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
    .stat-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 0.35rem; }
    .stat-label { font-size: 0.85rem; color: #64748B; font-weight: 500; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #0F172A; }

    .card { background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }
    .card-title { font-size: 1.1rem; font-weight: 600; color: #0F172A; margin-bottom: 1rem; }

    .table-container { width: 100%; overflow-x: auto; border: 1px solid #E2E8F0; border-radius: 10px; margin-top: 1rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
    th { background-color: #F8FAFC; color: #64748B; font-weight: 600; padding: 0.85rem 0.75rem; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
    td { padding: 0.85rem 0.75rem; border-bottom: 1px solid #E2E8F0; color: #1E293B; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }

    .btn-primary { background-color: #2563EB; color: white; border: none; padding: 0.45rem 0.85rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: background 0.2s; }
    .btn-primary:hover { background-color: #1D4ED8; }

    select, input[type="text"], input[type="number"] { width: 100%; padding: 0.35rem; border-radius: 4px; border: 1px solid #E2E8F0; font-size: 0.8rem; background: #FFF; color: #1E293B; }
  `]
})
export class AccountantDashboardPage implements OnInit {
  totalStudentsCount = 0;
  studentAccounts: StudentAccount[] = [];
  pendingTransactions: PendingTransaction[] = [];
  isLoadingStudents = true;
  isLoadingPending = true;

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  private FEE_PER_UNIT = 10000;

  constructor() {
    addIcons({ walletOutline, logOutOutline, schoolOutline, receiptOutline, statsChartOutline });
  }

  async ngOnInit() {
    const user = await this.waitForUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    await this.loadStudentFinancials();
    this.listenToPendingTransactions();
  }

  async ionViewWillEnter() {
    await this.menuCtrl.enable(true, 'accountant-menu');
  }

  async toggleMenu() {
    try {
      await this.menuCtrl.toggle('accountant-menu');
    } catch (e) {
      console.error("Menu toggle error:", e);
    }
  }

  private waitForUser(): Promise<User | null> {
    return new Promise(resolve => {
      const unsub = onAuthStateChanged(this.auth, user => {
        unsub();
        resolve(user);
      });
    });
  }

  async loadStudentFinancials() {
    this.isLoadingStudents = true;
    this.cdr.detectChanges();

    try {
      const studentsSnap = await getDocs(collection(this.firestore, "students"));
      const studentsMap: any = {};
      studentsSnap.forEach(d => {
        studentsMap[d.id] = { id: d.id, ...d.data() };
      });

      const studentUnitsMap: any = {};
      try {
        const subjSnap = await getDocs(collection(this.firestore, "studentSubjects"));
        subjSnap.forEach(d => {
          const sData: any = d.data();
          const studentUid = sData.studentUid || d.id;
          const subjectsArr = sData.selectedSubjects || sData.units || sData.subjects || [];
          if (studentUid) {
            studentUnitsMap[studentUid] = Array.isArray(subjectsArr) ? subjectsArr.length : (Number(subjectsArr) || 0);
          }
        });
      } catch (e) {}

      const studentDormBookingsMap: any = {};
      try {
        const dormSnap = await getDocs(collection(this.firestore, "studentDormBookings"));
        dormSnap.forEach(d => {
          const bData: any = d.data();
          const studentUid = bData.studentUid || d.id;
          if (studentUid) {
            studentDormBookingsMap[studentUid] = {
              name: bData.dormName || bData.hostelName || "Hostel",
              fee: Number(bData.feeAmount || bData.fee || bData.cost || 0)
            };
          }
        });
      } catch (e) {}

      const accountBalances: any = {};
      try {
        const balSnap = await getDocs(collection(this.firestore, "studentAccountBalances"));
        balSnap.forEach(d => {
          const bData: any = d.data();
          const linkedUid = bData.studentUid || d.id;
          if (linkedUid) accountBalances[linkedUid] = bData;
        });
      } catch (e) {}

      const studentIds = Object.keys(studentsMap);
      this.totalStudentsCount = studentIds.length;
      const accountsList: StudentAccount[] = [];

      for (const uid of studentIds) {
        const student = studentsMap[uid];
        const admissionNumber = student.admissionNumber || student.admissionNo || student.admNo || student.regNumber || "N/A";
        const studentName = student.fullName || student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || "Student";

        let unitsCount = studentUnitsMap[uid];
        if (unitsCount === undefined) {
          const arr = student.selectedSubjects || student.units || student.subjects || [];
          unitsCount = Array.isArray(arr) ? arr.length : 0;
        }
        const tuitionFee = unitsCount * this.FEE_PER_UNIT;

        const booking = studentDormBookingsMap[uid];
        const hostelName = booking ? booking.name : (student.hostelBooked || student.dormBooked || null);
        const hostelFee = booking ? booking.fee : (Number(student.hostelFee || student.dormFee) || 0);

        const existingAccount = accountBalances[uid] || {};
        const amountPaid = existingAccount.amountPaid !== undefined ? Number(existingAccount.amountPaid) : 0;
        const totalBill = tuitionFee + hostelFee;
        const balance = totalBill - amountPaid;

        try {
          await setDoc(doc(this.firestore, "studentAccountBalances", uid), {
            studentUid: uid,
            admissionNumber,
            studentName,
            totalBill,
            amountPaid,
            balance,
            tuitionFee,
            hostelFee,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (syncErr) {}

        accountsList.push({
          uid,
          admissionNumber,
          studentName,
          unitsCount,
          tuitionFee,
          hostelName,
          hostelFee,
          totalBill,
          amountPaid,
          balance,
          paymentMode: 'M-Pesa',
          referenceCode: '',
          paymentAmount: ''
        });
      }

      this.studentAccounts = accountsList;
    } catch (err) {
      console.error("Error loading financials:", err);
    } finally {
      this.isLoadingStudents = false;
      this.cdr.detectChanges();
    }
  }

  listenToPendingTransactions() {
    this.isLoadingPending = true;
    const q = query(collection(this.firestore, "feeTransactions"), where("status", "==", "Pending VC Approval"));
    
    onSnapshot(q, (snap) => {
      const txns: PendingTransaction[] = [];
      snap.forEach(docSnap => {
        const txn: any = docSnap.data();
        const dateStr = txn.submittedAt?.toDate ? txn.submittedAt.toDate().toLocaleString() : "Recently";
        txns.push({
          id: docSnap.id,
          dateStr,
          admissionNumber: txn.admissionNumber || 'N/A',
          studentName: txn.studentName || 'Student',
          paymentMode: txn.paymentMode || 'M-Pesa',
          transactionCode: txn.transactionCode || '',
          amount: Number(txn.amount) || 0
        });
      });
      this.pendingTransactions = txns;
      this.isLoadingPending = false;
      this.cdr.detectChanges();
    });
  }

  async submitPaymentForApproval(student: StudentAccount) {
    if (!student.paymentAmount || Number(student.paymentAmount) <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }
    if (!student.referenceCode || !student.referenceCode.trim()) {
      alert("Please provide a payment reference number or transaction ID.");
      return;
    }

    try {
      await addDoc(collection(this.firestore, "feeTransactions"), {
        studentUid: student.uid,
        admissionNumber: student.admissionNumber,
        studentName: student.studentName,
        amount: Number(student.paymentAmount),
        paymentMode: student.paymentMode,
        transactionCode: student.referenceCode.trim().toUpperCase(),
        status: "Pending VC Approval",
        submittedByAccountant: this.auth.currentUser?.email || 'accountant',
        submittedAt: serverTimestamp()
      });

      alert(`Transaction submitted successfully!\n\nMode: ${student.paymentMode}\nRef: ${student.referenceCode}\nAmount: KES ${Number(student.paymentAmount).toLocaleString()}\n\nIt is now pending approval from the Vice Chancellor before updating the student balance.`);
      
      student.referenceCode = '';
      student.paymentAmount = '';
      this.cdr.detectChanges();
    } catch (err: any) {
      console.error("Error submitting transaction:", err);
      alert(`Error: ${err.message}`);
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }
}