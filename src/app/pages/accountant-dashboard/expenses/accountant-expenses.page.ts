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
  walletOutline, receiptOutline, statsChartOutline, logOutOutline, cashOutline
} from 'ionicons/icons';
import { Auth, User, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { Firestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, where, onSnapshot } from '@angular/fire/firestore';

interface ExpenseRecord {
  id: string;
  title: string;
  category: string;
  amount: number;
  paymentMethod: string;
  description: string;
  recordedBy: string;
  dateStr: string;
  status: string;
}

@Component({
  selector: 'app-accountant-expenses',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, RouterLinkActive,
    IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonLabel, IonIcon,
    IonButtons, IonMenuButton, IonSpinner
  ],
  template: `
    <ion-split-pane content-id="expenses-main-content">

      <!-- Accountant Sidebar -->
      <ion-menu content-id="expenses-main-content" menuId="accountant-menu" side="start">
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
      <ion-content id="expenses-main-content" class="main-content-wrapper">
        <ion-header>
          <ion-toolbar class="header-gradient-toolbar">
            <ion-buttons slot="start">
              <ion-menu-button menu="accountant-menu" class="menu-btn" (click)="toggleMenu()"></ion-menu-button>
            </ion-buttons>
            <ion-title>School Expense Management</ion-title>
          </ion-toolbar>
        </ion-header>

        <div class="content-body">
          
          <!-- Record Expense Form Card -->
          <div class="card">
            <div class="card-title">Record New School Expense (Awaiting VC Approval)</div>
            <form (submit)="recordExpense($event)">
              <div class="form-grid">
                <div class="form-group">
                  <label for="expenseTitle">Expense Title / Particulars</label>
                  <input type="text" id="expenseTitle" [(ngModel)]="newExpense.title" name="title" placeholder="e.g. Electricity Bill - March" required>
                </div>
                <div class="form-group">
                  <label for="expenseCategory">Category</label>
                  <select id="expenseCategory" [(ngModel)]="newExpense.category" name="category" required>
                    <option value="">-- Select Category --</option>
                    <option value="Utilities">Utilities (Water, Power)</option>
                    <option value="Salaries">Staff Salaries & Wages</option>
                    <option value="Maintenance">Infrastructure Maintenance</option>
                    <option value="Procurement">Procurement & Supplies</option>
                    <option value="Co-curricular">Co-curricular & Events</option>
                    <option value="Other">Other Operational Costs</option>
                  </select>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label for="expenseAmount">Amount (KES)</label>
                  <input type="number" id="expenseAmount" [(ngModel)]="newExpense.amount" name="amount" placeholder="0.00" min="1" required>
                </div>
                <div class="form-group">
                  <label for="paymentMethod">Payment Method</label>
                  <select id="paymentMethod" [(ngModel)]="newExpense.paymentMethod" name="paymentMethod" required>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="M-Pesa Business">M-Pesa Business / Paybill</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Petty Cash">Petty Cash</option>
                  </select>
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 1.25rem;">
                <label for="expenseDescription">Description / Notes</label>
                <textarea id="expenseDescription" [(ngModel)]="newExpense.description" name="description" placeholder="Provide invoice reference or additional details..."></textarea>
              </div>

              <button type="submit" class="btn-primary" [disabled]="isSubmitting">
                <ion-spinner name="crescent" *ngIf="isSubmitting" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;"></ion-spinner>
                {{ isSubmitting ? 'Submitting...' : 'Submit Expense for VC Approval' }}
              </button>
            </form>
          </div>

          <!-- Pending Expenses Queue -->
          <div class="card">
            <div class="card-title">Pending Expense Requests (Awaiting VC Authorization)</div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date Submitted</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount (KES)</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="isLoadingPending">
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Loading pending expenses...</td>
                  </tr>
                  <tr *ngIf="!isLoadingPending && pendingExpenses.length === 0">
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No pending expense requests in the queue.</td>
                  </tr>
                  <ng-container *ngIf="!isLoadingPending">
                    <tr *ngFor="let exp of pendingExpenses">
                      <td>{{ exp.dateStr }}</td>
                      <td><strong>{{ exp.title }}</strong></td>
                      <td><span class="badge">{{ exp.category }}</span></td>
                      <td><strong>KES {{ exp.amount.toLocaleString() }}</strong></td>
                      <td>{{ exp.paymentMethod }}</td>
                      <td><span style="color: #D97706; font-weight: 600; background: #FEF3C7; padding: 0.2rem 0.5rem; border-radius: 4px;">Pending VC Approval</span></td>
                    </tr>
                  </ng-container>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Approved & Processed Expenses Ledger -->
          <div class="card">
            <div class="card-title">Approved School Expenses Ledger</div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Processed Date</th>
                    <th>Title / Particulars</th>
                    <th>Category</th>
                    <th>Method</th>
                    <th>Amount (KES)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="isLoadingApproved">
                    <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Loading approved expenses...</td>
                  </tr>
                  <tr *ngIf="!isLoadingApproved && approvedExpenses.length === 0">
                    <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No approved expenses found.</td>
                  </tr>
                  <ng-container *ngIf="!isLoadingApproved">
                    <tr *ngFor="let exp of approvedExpenses">
                      <td>{{ exp.dateStr }}</td>
                      <td><strong>{{ exp.title }}</strong></td>
                      <td><span class="badge">{{ exp.category }}</span></td>
                      <td>{{ exp.paymentMethod }}</td>
                      <td><strong style="color: var(--danger);">KES {{ exp.amount.toLocaleString() }}</strong></td>
                      <td><span class="badge badge-approved">Approved</span></td>
                      <td>
                        <button class="btn-danger" (click)="deleteExpense(exp.id)">Delete</button>
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
    .card { background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }
    .card-title { font-size: 1.1rem; font-weight: 600; color: #0F172A; margin-bottom: 1rem; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
    @media(max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }

    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-size: 0.85rem; font-weight: 600; color: #1E293B; }
    select, input, textarea { padding: 0.65rem; border-radius: 10px; border: 1px solid #E2E8F0; font-size: 0.9rem; background: #FFF; color: #1E293B; }
    textarea { resize: vertical; min-height: 80px; }

    .btn-primary { background-color: #2563EB; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: background 0.2s; display: inline-flex; align-items: center; justify-content: center; }
    .btn-primary:hover { background-color: #1D4ED8; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

    .btn-danger { background-color: #DC2626; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; cursor: pointer; }
    .btn-danger:hover { background-color: #B91C1C; }

    .table-container { width: 100%; overflow-x: auto; border: 1px solid #E2E8F0; border-radius: 10px; margin-top: 1rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
    th { background-color: #F8FAFC; color: #64748B; font-weight: 600; padding: 0.85rem; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
    td { padding: 0.85rem; border-bottom: 1px solid #E2E8F0; color: #1E293B; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }

    .badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: #E2E8F0; color: #0F172A; }
    .badge-approved { background: #DCFCE7; color: #166534; text-transform: uppercase; }
  `]
})
export class AccountantExpensesPage implements OnInit {
  pendingExpenses: ExpenseRecord[] = [];
  approvedExpenses: ExpenseRecord[] = [];
  isLoadingPending = true;
  isLoadingApproved = true;
  isSubmitting = false;

  newExpense = {
    title: '',
    category: '',
    amount: null as number | null,
    paymentMethod: 'Bank Transfer',
    description: ''
  };

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  constructor() {
    addIcons({ walletOutline, receiptOutline, statsChartOutline, logOutOutline, cashOutline });
  }

  async ngOnInit() {
    const user = await this.waitForUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.listenToExpenses();
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

  listenToExpenses() {
    const q = query(collection(this.firestore, "schoolExpenses"), orderBy("createdAt", "desc"));
    
    onSnapshot(q, (snap) => {
      const pending: ExpenseRecord[] = [];
      const approved: ExpenseRecord[] = [];

      snap.forEach(docSnap => {
        const d: any = docSnap.data();
        const dateStr = d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString() : 'Recently';
        const record: ExpenseRecord = {
          id: docSnap.id,
          title: d.title || 'Untitled',
          category: d.category || 'General',
          amount: Number(d.amount) || 0,
          paymentMethod: d.paymentMethod || 'Bank',
          description: d.description || '',
          recordedBy: d.recordedBy || 'Accountant',
          dateStr,
          status: d.status || 'Pending VC Approval'
        };

        if (record.status === 'Approved') {
          approved.push(record);
        } else {
          pending.push(record);
        }
      });

      this.pendingExpenses = pending;
      this.approvedExpenses = approved;
      this.isLoadingPending = false;
      this.isLoadingApproved = false;
      this.cdr.detectChanges();
    });
  }

  async recordExpense(e: Event) {
    e.preventDefault();
    if (!this.newExpense.title || !this.newExpense.category || !this.newExpense.amount) {
      alert("Please fill in all required fields.");
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    try {
      await addDoc(collection(this.firestore, "schoolExpenses"), {
        title: this.newExpense.title,
        category: this.newExpense.category,
        amount: Number(this.newExpense.amount),
        paymentMethod: this.newExpense.paymentMethod,
        description: this.newExpense.description,
        recordedBy: this.auth.currentUser?.email || 'Accountant',
        status: "Pending VC Approval",
        createdAt: serverTimestamp()
      });

      alert("Expense submitted successfully! Awaiting Vice Chancellor authorization.");
      this.newExpense = { title: '', category: '', amount: null, paymentMethod: 'Bank Transfer', description: '' };
    } catch (err: any) {
      console.error("Error recording expense:", err);
      alert(`Error: ${err.message}`);
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  async deleteExpense(id: string) {
    if (confirm("Are you sure you want to delete this approved expense record?")) {
      try {
        await deleteDoc(doc(this.firestore, "schoolExpenses", id));
      } catch (err) {
        console.error("Error deleting expense:", err);
      }
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