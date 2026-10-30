import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  IonContent, IonIcon, IonButtons, IonMenuButton, IonSpinner,
  IonHeader, IonToolbar, IonTitle
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  statsChartOutline, schoolOutline, alertCircleOutline
} from 'ionicons/icons';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
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
    CommonModule, IonContent, IonIcon, IonButtons, IonMenuButton, IonSpinner,
    IonHeader, IonToolbar, IonTitle
  ],
  template: `
    <ion-header>
      <ion-toolbar class="header-gradient-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button menu="student-menu" class="menu-btn"></ion-menu-button>
        </ion-buttons>
        <ion-title>Academic Exam Results</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="mobile-dashboard-content">
      <div class="dashboard-body">

        <!-- Summary Cards Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Class / Program</span>
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

        <!-- Results Table Card -->
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
                <!-- Loading State -->
                <tr *ngIf="isLoading">
                  <td colspan="4" class="empty-state">
                    <ion-spinner name="crescent" color="primary"></ion-spinner>
                    <p style="margin-top: 8px;">Loading exam records...</p>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr *ngIf="!isLoading && resultsList.length === 0">
                  <td colspan="4" class="empty-state">
                    <ion-icon name="alert-circle-outline" style="font-size: 24px; color: #94a3b8;"></ion-icon>
                    <p>No exam results posted yet. Check back later.</p>
                  </td>
                </tr>

                <!-- Results Rows -->
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
    th { background-color: #f8fafc; color: #64748b; font-weight: 600; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; }
    td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    tr:last-child td { border-bottom: none; }

    .empty-state { text-align: center; color: #64748b; padding: 2.5rem !important; }

    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge-success { background: #DCFCE7; color: #166534; }
    .badge-warning { background: #FEF9C3; color: #854D0E; }
    .badge-danger { background: #FEE2E2; color: #991B1B; }
  `]
})
export class ExamResultsPage implements OnInit {
  isLoading: boolean = true;
  studentClass: string = 'Loading...';
  unitsCount: number = 0;
  averageScore: string = '-';
  resultsList: ExamResult[] = [];

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({ statsChartOutline, schoolOutline, alertCircleOutline });
  }

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      await this.loadStudentResults(user.uid, user.email || '');
    });
  }

  async loadStudentResults(uid: string, email: string) {
    this.isLoading = true;
    try {
      // 1. Fetch Student Profile for Class & Admission No
      let studentClass = 'BBIT / Information Technology';
      let studentAdmissionNo = '';

      try {
        const studentSnap = await getDoc(doc(this.firestore, "students", uid));
        if (studentSnap.exists()) {
          const sData = studentSnap.data();
          studentClass = sData['className'] || sData['grade'] || studentClass;
          studentAdmissionNo = sData['admissionNumber'] || sData['admissionNo'] || '';
        }
      } catch (e) {
        console.warn("Could not fetch student profile details:", e);
      }

      this.studentClass = studentClass;

      // 2. Fetch Exam Results from Firestore
      let rawResults: any[] = [];

      try {
        const qUid = query(collection(this.firestore, "examResults"), where("studentUid", "==", uid));
        const snapUid = await getDocs(qUid);
        snapUid.forEach(d => rawResults.push(d.data()));
      } catch (e) {}

      if (rawResults.length === 0 && studentAdmissionNo) {
        try {
          const qAdm = query(collection(this.firestore, "examResults"), where("admissionNumber", "==", studentAdmissionNo));
          const snapAdm = await getDocs(qAdm);
          snapAdm.forEach(d => rawResults.push(d.data()));
        } catch (e) {}
      }

      // Fallback: check collections examResults, results, grades
      if (rawResults.length === 0) {
        const collectionsToCheck = ["examResults", "results", "grades"];
        for (const colName of collectionsToCheck) {
          try {
            const altSnap = await getDocs(collection(this.firestore, colName));
            altSnap.forEach(d => {
              const data = d.data();
              if (
                data['studentUid'] === uid ||
                data['studentId'] === uid ||
                data['admissionNumber'] === studentAdmissionNo ||
                (email && data['email'] === email)
              ) {
                rawResults.push(data);
              }
            });
            if (rawResults.length > 0) break;
          } catch (err) {}
        }
      }

      // 3. Process and format results
      if (rawResults.length > 0) {
        this.unitsCount = rawResults.length;
        let totalScore = 0;
        const formatted: ExamResult[] = [];

        rawResults.forEach(res => {
          const subject = res['subject'] || res['unitName'] || res['name'] || "Unknown Unit";
          const score = Number(res['score'] || res['marks'] || res['totalScore'] || 0);
          totalScore += score;

          let grade = res['grade'] || this.getGradeLetter(score);
          let badgeClass = "badge-success";
          if (grade === "C" || grade === "D" || score < 50) badgeClass = "badge-warning";
          if (grade === "E" || grade === "F" || score < 40) badgeClass = "badge-danger";

          const remarks = res['remarks'] || res['comment'] || this.getRemarks(score);

          formatted.push({ subject, score, grade, remarks, badgeClass });
        });

        this.resultsList = formatted;
        this.averageScore = (totalScore / rawResults.length).toFixed(1) + '%';
      } else {
        this.resultsList = [];
        this.unitsCount = 0;
        this.averageScore = '-';
      }

    } catch (err) {
      console.error("Error loading exam results:", err);
    } finally {
      this.isLoading = false;
    }
  }

  getGradeLetter(score: number): string {
    if (score >= 70) return "A";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 40) return "D";
    return "E";
  }

  getRemarks(score: number): string {
    if (score >= 70) return "Excellent performance";
    if (score >= 60) return "Good work, keep it up";
    if (score >= 50) return "Satisfactory";
    if (score >= 40) return "Needs improvement";
    return "Fail / Retake required";
  }
}