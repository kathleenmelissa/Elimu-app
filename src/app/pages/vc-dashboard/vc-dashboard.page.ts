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
  shieldCheckmarkOutline, logOutOutline, schoolOutline
} from 'ionicons/icons';
import { Auth, User, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from '@angular/fire/firestore';

interface AuthorizationItem {
  id: string;
  type: 'fee' | 'expense';
  studentUid?: string;
  admissionNumber?: string;
  studentName?: string;
  title?: string;
  category?: string;
  paymentMode: string;
  transactionCode?: string;
  amount: number;
  submittedBy: string;
  status: string;
  dateStr: string;
}

@Component({
  selector: 'app-vc-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, RouterLinkActive,
    IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonLabel, IonIcon,
    IonButtons, IonMenuButton, IonSpinner
  ],
  template: `
    <ion-split-pane content-id="vc-main-content">

      <!-- VC Sidebar -->
      <ion-menu content-id="vc-main-content" menuId="vc-menu" side="start">
        <ion-header>
          <ion-toolbar class="sidebar-toolbar">
            <div class="brand-container">
              <ion-icon name="shield-checkmark-outline" class="brand-icon"></ion-icon>
              <ion-title class="brand-title">VC Executive Portal</ion-title>
            </div>
          </ion-toolbar>
        </ion-header>

        <ion-content class="sidebar-content">
          <ion-list lines="none" class="nav-list">
            <ion-item routerLink="/vc/dashboard" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="shield-checkmark-outline" slot="start"></ion-icon>
              <ion-label>Financial Authorizations</ion-label>
            </ion-item>
            <ion-item button (click)="logout()" class="nav-item logout-item">
              <ion-icon name="log-out-outline" slot="start" color="danger"></ion-icon>
              <ion-label color="danger">Logout</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-menu>

      <!-- Main Content -->
      <ion-content id="vc-main-content" class="main-content-wrapper">
        <ion-header>
          <ion-toolbar class="header-gradient-toolbar">
            <ion-buttons slot="start">
              <ion-menu-button menu="vc-menu" class="menu-btn" (click)="toggleMenu()"></ion-menu-button>
            </ion-buttons>
            <ion-title>Vice Chancellor Financial Authorizations</ion-title>
          </ion-toolbar>
        </ion-header>

        <div class="content-body">
          
          <!-- Pending Fee Transactions Queue -->
          <div class="card">
            <div class="card-title">Pending Fee Transactions Awaiting Verification</div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Submitted Date</th>
                    <th>Adm No.</th>
                    <th>Student Name</th>
                    <th>Mode</th>
                    <th>Reference / Code</th>
                    <th>Amount (KES)</th>
                    <th>Submitted By</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="isLoadingPending">
                    <td colspan="8" style="text-align: center; padding: 2rem; color: #64748B;">Loading pending fee approvals...</td>
                  </tr>
                  <tr *ngIf="!isLoadingPending && pendingFees.length === 0">
                    <td colspan="8" style="text-align: center; padding: 2rem; color: #64748B;">No pending fee transactions awaiting authorization.</td>
                  </tr>
                  <ng-container *ngIf="!isLoadingPending">
                    <tr *ngFor="let txn of pendingFees">
                      <td>{{ txn.dateStr }}</td>
                      <td><strong>{{ txn.admissionNumber }}</strong></td>
                      <td>{{ txn.studentName }}</td>
                      <td>{{ txn.paymentMode }}</td>
                      <td><code style="background: #F1F5F9; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600;">{{ txn.transactionCode }}</code></td>
                      <td><strong style="color: var(--primary);">KES {{ txn.amount.toLocaleString() }}</strong></td>
                      <td>{{ txn.submittedBy }}</td>
                      <td>
                        <button class="btn-approve" (click)="approveFee(txn)">Approve</button>
                        <button class="btn-reject" (click)="rejectItem('feeTransactions', txn.id)">Reject</button>
                      </td>
                    </tr>
                  </ng-container>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pending School Expenses Queue -->
          <div class="card">
            <div class="card-title">Pending School Expenses Awaiting Authorization</div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Submitted Date</th>
                    <th>Expense Title</th>
                    <th>Category</th>
                    <th>Method</th>
                    <th>Amount (KES)</th>
                    <th>Submitted By</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="isLoadingPending">
                    <td colspan="7" style="text-align: center; padding: 2rem; color: #64748B;">Loading pending expenses...</td>
                  </tr>
                  <tr *ngIf="!isLoadingPending && pendingExpenses.length === 0">
                    <td colspan="7" style="text-align: center; padding: 2rem; color: #64748B;">No pending school expenses awaiting authorization.</td>
                  </tr>
                  <ng-container *ngIf="!isLoadingPending">
                    <tr *ngFor="let exp of pendingExpenses">
                      <td>{{ exp.dateStr }}</td>
                      <td><strong>{{ exp.title }}</strong></td>
                      <td><span class="badge" style="background: #E2E8F0; padding: 0.2rem 0.5rem; border-radius: 4px;">{{ exp.category }}</span></td>
                      <td>{{ exp.paymentMode }}</td>
                      <td><strong style="color: var(--danger);">KES {{ exp.amount.toLocaleString() }}</strong></td>
                      <td>{{ exp.submittedBy }}</td>
                      <td>
                        <button class="btn-approve" (click)="approveExpense(exp)">Approve</button>
                        <button class="btn-reject" (click)="rejectItem('schoolExpenses', exp.id)">Reject</button>
                      </td>
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
    .card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }
    .card-title { font-size: 1.1rem; font-weight: 600; color: #0F172A; margin-bottom: 1rem; }

    .table-container { width: 100%; overflow-x: auto; border: 1px solid #E2E8F0; border-radius: 10px; margin-top: 1rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
    th { background: #F8FAFC; color: #64748B; font-weight: 600; padding: 0.85rem; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
    td { padding: 0.85rem; border-bottom: 1px solid #E2E8F0; vertical-align: middle; color: #1E293B; }

    .btn-approve { background: #16A34A; color: white; border: none; padding: 0.45rem 0.85rem; border-radius: 6px; font-weight: 600; cursor: pointer; margin-right: 0.35rem; }
    .btn-approve:hover { background: #15803D; }
    .btn-reject { background: #DC2626; color: white; border: none; padding: 0.45rem 0.85rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn-reject:hover { background: #B91C1C; }
  `]
})
export class VcDashboardPage implements OnInit {
  pendingFees: AuthorizationItem[] = [];
  pendingExpenses: AuthorizationItem[] = [];
  isLoadingPending = true;

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  constructor() {
    addIcons({ shieldCheckmarkOutline, logOutOutline, schoolOutline });
  }

  async ngOnInit() {
    const user = await this.waitForUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.listenToPendingApprovals();
  }

  async ionViewWillEnter() {
    await this.menuCtrl.enable(true, 'vc-menu');
  }

  async toggleMenu() {
    try {
      await this.menuCtrl.toggle('vc-menu');
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

  listenToPendingApprovals() {
    this.isLoadingPending = true;

    // 1. Listen to pending fee transactions
    const feeQuery = query(collection(this.firestore, "feeTransactions"), orderBy("submittedAt", "desc"));
    onSnapshot(feeQuery, (snap) => {
      const fees: AuthorizationItem[] = [];
      snap.forEach(docSnap => {
        const data: any = docSnap.data();
        if (data.status === "Pending VC Approval") {
          fees.push({
            id: docSnap.id,
            type: 'fee',
            studentUid: data.studentUid,
            admissionNumber: data.admissionNumber || 'N/A',
            studentName: data.studentName || 'Student',
            paymentMode: data.paymentMode || 'M-Pesa',
            transactionCode: data.transactionCode || '',
            amount: Number(data.amount) || 0,
            submittedBy: data.submittedByAccountant || 'Accountant',
            status: data.status,
            dateStr: data.submittedAt?.toDate ? data.submittedAt.toDate().toLocaleString() : 'Recent'
          });
        }
      });
      this.pendingFees = fees;
      this.checkLoadingState();
    });

    // 2. Listen to pending school expenses
    const expQuery = query(collection(this.firestore, "schoolExpenses"), orderBy("createdAt", "desc"));
    onSnapshot(expQuery, (snap) => {
      const expenses: AuthorizationItem[] = [];
      snap.forEach(docSnap => {
        const data: any = docSnap.data();
        if (data.status === "Pending VC Approval" || !data.status) {
          expenses.push({
            id: docSnap.id,
            type: 'expense',
            title: data.title || 'Untitled Expense',
            category: data.category || 'General',
            paymentMode: data.paymentMethod || 'Bank',
            amount: Number(data.amount) || 0,
            submittedBy: data.recordedBy || 'Accountant',
            status: data.status || 'Pending VC Approval',
            dateStr: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : 'Recent'
          });
        }
      });
      this.pendingExpenses = expenses;
      this.checkLoadingState();
    });
  }

  checkLoadingState() {
    this.isLoadingPending = false;
    this.cdr.detectChanges();
  }

  async approveFee(txn: AuthorizationItem) {
    if (!confirm(`Confirm authorization of KES ${txn.amount.toLocaleString()} (Ref: ${txn.transactionCode}) for ${txn.studentName}?`)) return;

    try {
      await updateDoc(doc(this.firestore, "feeTransactions", txn.id), {
        status: "Approved",
        approvedBy: this.auth.currentUser?.email || 'VC',
        approvedAt: serverTimestamp()
      });

      if (txn.studentUid) {
        const balanceRef = doc(this.firestore, "studentAccountBalances", txn.studentUid);
        const balSnap = await getDoc(balanceRef);

        let currentPaid = 0;
        let totalBill = 0;

        if (balSnap.exists()) {
          const bData: any = balSnap.data();
          currentPaid = Number(bData.amountPaid || 0);
          totalBill = Number(bData.totalBill || 0);
        }

        const updatedAmountPaid = currentPaid + txn.amount;
        const updatedBalance = totalBill - updatedAmountPaid;

        await setDoc(balanceRef, {
          amountPaid: updatedAmountPaid,
          balance: updatedBalance,
          lastApprovedTxnCode: txn.transactionCode,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      alert("Fee transaction successfully authorized and credited.");
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  }

  async approveExpense(exp: AuthorizationItem) {
    if (!confirm(`Authorize school expense "${exp.title}" for KES ${exp.amount.toLocaleString()}?`)) return;

    try {
      await updateDoc(doc(this.firestore, "schoolExpenses", exp.id), {
        status: "Approved",
        approvedBy: this.auth.currentUser?.email || 'VC',
        approvedAt: serverTimestamp()
      });
      alert("School expense successfully authorized!");
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  }

  async rejectItem(collectionName: string, id: string) {
    if (!confirm("Reject and discard this request?")) return;

    try {
      await updateDoc(doc(this.firestore, collectionName, id), {
        status: "Rejected",
        rejectedBy: this.auth.currentUser?.email || 'VC',
        rejectedAt: serverTimestamp()
      });
      alert("Request marked as rejected.");
    } catch (err: any) {
      alert(`Rejection failed: ${err.message}`);
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