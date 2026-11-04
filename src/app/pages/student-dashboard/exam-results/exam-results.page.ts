import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon, IonButtons, IonBackButton, IonSpinner,
  IonHeader, IonToolbar, IonTitle
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { statsChartOutline, schoolOutline, alertCircleOutline } from 'ionicons/icons';
import { Auth, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc, collection, getDocs, query, where } from '@angular/fire/firestore';

interface ExamResult {
  subject: string;
  score: number;
  grade: string;
  remarks: string;
  badgeClass: string;
}

@Component({
  selector: 'app-exam-results',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonIcon, IonButtons, IonBackButton, IonSpinner,
    IonHeader, IonToolbar, IonTitle
  ],
  template: `
    <ion-header>
      <ion-toolbar class="header-gradient-toolbar">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/student/dashboard" class="menu-btn"></ion-back-button>
        </ion-buttons>
        <ion-title>Academic Exam Results</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="mobile-dashboard-content">
      <div class="dashboard-body">

        <!-- Summary Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Class</span>
            <span class="stat-value">{{ studentClass }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Units Graded</span>
            <span class="stat-value">{{ unitsCount }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Average Score</span>
            <span class="stat-value">{{ averageScore }}</span>
          </div>
        </div>

        <!-- Results Table -->
        <div class="card">
          <div class="card-title">Performance Breakdown</div>
          <p class="card-subtitle">
            View your continuous assessment marks, final exam scores, letter grades, and academic remarks.
          </p>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject / Unit</th>
                  <th>Score (%)</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="isLoading">
                  <td colspan="4" class="empty-state">
                    <ion-spinner name="crescent" color="primary"></ion-spinner>
                    <p>Loading exam records...</p>
                  </td>
                </tr>

                <tr *ngIf="!isLoading && loadError">
                  <td colspan="4" class="empty-state error-text">
                    <p>{{ loadError }}</p>
                  </td>
                </tr>

                <tr *ngIf="!isLoading && !loadError && resultsList.length === 0">
                  <td colspan="4" class="empty-state">
                    <ion-icon name="alert-circle-outline" class="empty-icon"></ion-icon>
                    <p>No exam results posted yet. Check back later.</p>
                  </td>
                </tr>

                <tr *ngFor="let res of resultsList">
                  <td><strong>{{ res.subject }}</strong></td>
                  <td>{{ res.score }}%</td>
                  <td><span class="badge" [ngClass]="res.badgeClass">{{ res.grade }}</span></td>
                  <td>{{ res.remarks }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .header-gradient-toolbar { --background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #2563eb 100%); --color: #ffffff; }
    .menu-btn { color: #ffffff; }

    .mobile-dashboard-content { --background: #f8fafc; }
    .dashboard-body { padding: 20px; max-width: 900px; margin: 0 auto; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .stat-label { font-size: 12px; color: #64748b; font-weight: 500; }
    .stat-value { font-size: 18px; font-weight: 700; color: #0f172a; }

    .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }
    .card-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
    .card-subtitle { font-size: 13px; color: #64748b; margin-bottom: 1.2rem; }

    .table-container { width: 100%; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th { background-color: #f8fafc; color: #64748b; font-weight: 600; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
    td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    tr:last-child td { border-bottom: none; }

    .empty-state { text-align: center; color: #64748b; padding: 2.5rem !important; }
    .empty-state p { margin: 8px 0 0 0; }
    .empty-icon { font-size: 24px; color: #94a3b8; }
    .error-text { color: #dc2626; }

    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge-success { background: #DCFCE7; color: #166534; }
    .badge-warning { background: #FEF9C3; color: #854D0E; }
    .badge-danger { background: #FEE2E2; color: #991B1B; }
  `]
})
export class ExamResultsPage {
  isLoading = true;
  loadError = '';
  studentClass = 'Loading...';
  unitsCount = 0;
  averageScore = '-';
  resultsList: ExamResult[] = [];

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  constructor() {
    addIcons({ statsChartOutline, schoolOutline, alertCircleOutline });
  }

  // Ionic caches pages, so this runs every time the page is shown and always
  // loads the CURRENTLY logged-in student's results.
  async ionViewWillEnter() {
    this.isLoading = true;
    this.loadError = '';
    this.studentClass = 'Loading...';
    this.unitsCount = 0;
    this.averageScore = '-';
    this.resultsList = [];
    this.cdr.detectChanges();

    const user = await this.waitForUser();
    if (!user) {
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }
    await this.loadStudentResults(user.uid, user.email || '');
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

  // Fetches only THIS student's documents from a collection (instead of downloading
  // the whole collection and filtering on the phone).
  private async fetchOwnResults(colName: string, uid: string, admNo: string, email: string): Promise<any[]> {
    const col = collection(this.firestore, colName);
    const queries = [
      query(col, where('studentUid', '==', uid)),
      query(col, where('studentId', '==', uid))
    ];
    if (admNo) queries.push(query(col, where('admissionNumber', '==', admNo)));
    if (email) queries.push(query(col, where('email', '==', email)));

    const settled = await Promise.allSettled(queries.map(q => getDocs(q)));
    const found = new Map<string, any>();
    settled.forEach(res => {
      if (res.status === 'fulfilled') {
        res.value.forEach(d => found.set(d.id, d.data()));
      } else {
        console.warn(`Query on ${colName} failed:`, res.reason);
      }
    });
    return [...found.values()];
  }

  // First usable score field, or null when the document has no score at all
  // (e.g. a CAT-only record in the "results" collection).
  private extractScore(r: any): number | null {
    for (const key of ['score', 'marks', 'totalScore']) {
      const v = r[key];
      if (v !== undefined && v !== null && v !== '' && !isNaN(Number(v))) return Number(v);
    }
    return null;
  }

  async loadStudentResults(uid: string, email: string) {
    this.isLoading = true;
    try {
      // 1. Student profile
      let studentClass = 'N/A';
      let admNo = '';
      try {
        const studentSnap = await getDoc(doc(this.firestore, 'students', uid));
        if (studentSnap.exists()) {
          const s: any = studentSnap.data();
          studentClass = s['className'] || s['grade'] || 'N/A';
          admNo = s['admissionNumber'] || s['admissionNo'] || s['admNo'] || s['regNumber'] || '';
        }
      } catch (e) {
        console.warn('Could not fetch student profile details:', e);
      }
      this.studentClass = studentClass;

      // 2. Results: examResults first, then fall back to results / grades
      let scored: { raw: any; score: number }[] = [];
      for (const colName of ['examResults', 'results', 'grades']) {
        const docs = await this.fetchOwnResults(colName, uid, admNo, email);
        scored = docs
          .map(raw => ({ raw, score: this.extractScore(raw) }))
          .filter((x): x is { raw: any; score: number } => x.score !== null);
        if (scored.length > 0) break;
      }

      // 3. Format
      const formatted: ExamResult[] = scored.map(({ raw, score }) => {
        const subject = raw['subject'] || raw['unitName'] || raw['name'] || 'Unknown Unit';
        const grade = raw['grade'] || this.getGradeLetter(score);

        let badgeClass = 'badge-success';
        if (grade === 'C' || grade === 'D' || score < 50) badgeClass = 'badge-warning';
        if (grade === 'E' || grade === 'F' || score < 40) badgeClass = 'badge-danger';

        const remarks = raw['remarks'] || raw['comment'] || this.getRemarks(score);
        return { subject, score, grade, remarks, badgeClass };
      });

      formatted.sort((a, b) => a.subject.localeCompare(b.subject));

      this.resultsList = formatted;
      this.unitsCount = formatted.length;
      this.averageScore = formatted.length
        ? (formatted.reduce((sum, r) => sum + r.score, 0) / formatted.length).toFixed(1) + '%'
        : '-';

    } catch (err) {
      console.error('Error loading exam results:', err);
      this.loadError = 'Failed to load results. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  getGradeLetter(score: number): string {
    if (score >= 70) return 'A';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'E';
  }

  getRemarks(score: number): string {
    if (score >= 70) return 'Excellent performance';
    if (score >= 60) return 'Good work, keep it up';
    if (score >= 50) return 'Satisfactory';
    if (score >= 40) return 'Needs improvement';
    return 'Fail / Retake required';
  }
}