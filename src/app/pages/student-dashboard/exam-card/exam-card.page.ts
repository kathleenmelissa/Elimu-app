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
  printOutline, warningOutline, checkmarkCircleOutline, closeCircleOutline
} from 'ionicons/icons';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc, collection, getDocs } from '@angular/fire/firestore';

interface ExamUnit {
  code: string;
  name: string;
  type: string;
  cat1: any;
  cat2: any;
}

@Component({
  selector: 'app-exam-card',
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
        <ion-title>Official Examination Card</ion-title>
        <ion-buttons slot="end" *ngIf="isCleared">
          <button class="btn-print-header" (click)="printCard()">
            <ion-icon name="print-outline"></ion-icon> Print
          </button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="mobile-dashboard-content">
      <div class="dashboard-body">

        <!-- Loading Spinner State -->
        <div *ngIf="isLoading" class="loading-container">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Verifying course marks and clearance requirements...</p>
        </div>

        <!-- Clearance Requirement Alert Box -->
        <div *ngIf="!isLoading && !isCleared" class="clearance-alert">
          <div class="alert-icon-title">
            <ion-icon name="warning-outline"></ion-icon>
            <h3>Examination Card Generation Restricted</h3>
          </div>
          <p>Your official examination card cannot be generated at this time because your account does not meet strict institutional clearance prerequisites:</p>
          
          <ul class="clearance-checklist">
            <li *ngIf="!feeCleared">
              <ion-icon name="close-circle-outline" color="danger"></ion-icon> 
              <strong>Outstanding Fee Balance:</strong> KES {{ feeBalance | number }} (Must be Nil balance).
            </li>
            <li *ngIf="feeCleared">
              <ion-icon name="checkmark-circle-outline" color="success"></ion-icon> 
              <strong>Fee Balance:</strong> Cleared (KES 0).
            </li>

            <li *ngIf="!allCatsEntered">
              <ion-icon name="close-circle-outline" color="danger"></ion-icon> 
              <strong>Missing CAT Marks:</strong> CAT 1 and CAT 2 marks must be entered by course lecturers for all units before hall permits are issued.
            </li>
            <li *ngIf="allCatsEntered">
              <ion-icon name="checkmark-circle-outline" color="success"></ion-icon> 
              <strong>Continuous Assessment:</strong> CAT 1 & CAT 2 marks uploaded.
            </li>
          </ul>
        </div>

        <!-- Printable Exam Card -->
        <div *ngIf="!isLoading && isCleared" class="exam-card" id="examCardPrintArea">
          <div class="exam-header">
            <h2>Elimu University Portal</h2>
            <p>Official Examination Clearance & Hall Permit Card</p>
          </div>

          <div class="student-info-grid">
            <div><span>Student Name:</span> <strong>{{ studentName }}</strong></div>
            <div><span>Admission Number:</span> <strong>{{ studentAdm }}</strong></div>
            <div><span>Academic Program:</span> <strong>BBIT / Information Technology</strong></div>
            <div><span>Fee Clearance Status:</span> <strong style="color: var(--success);">Cleared (Nil Balance)</strong></div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Unit Code</th>
                  <th>Unit Name</th>
                  <th>CAT 1 Score</th>
                  <th>CAT 2 Score</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let unit of unitsList; let i = index">
                  <td>{{ i + 1 }}</td>
                  <td><strong>{{ unit.code }}</strong></td>
                  <td>{{ unit.name }}</td>
                  <td><span class="score-badge">{{ unit.cat1 }} Marks</span></td>
                  <td><span class="score-badge">{{ unit.cat2 }} Marks</span></td>
                  <td>
                    <span [ngClass]="unit.type === 'Supplementary Unit' ? 'badge-supp' : 'badge-normal'">
                      {{ unit.type }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="card-footer-info">
            <div>
              <p><strong>Controller of Examinations:</strong> ___________________________</p>
            </div>
            <div>
              <p><strong>Date Issued:</strong> <span>{{ issueDate }}</span></p>
            </div>
          </div>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .header-gradient-toolbar { --background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #2563eb 100%); --color: #ffffff; }
    .menu-btn { color: #ffffff; }
    .btn-print-header { background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255,255,255,0.4); color: white; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .btn-print-header:hover { background: rgba(255, 255, 255, 0.3); }

    .mobile-dashboard-content { --background: #f8fafc; }
    .dashboard-body { padding: 20px; max-width: 900px; margin: 0 auto; }
    .loading-container { text-align: center; padding: 4rem 0; color: #64748b; font-size: 14px; p { margin-top: 10px; } }

    .clearance-alert { background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 12px; padding: 1.5rem; color: #991B1B; margin-bottom: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .alert-icon-title { display: flex; align-items: center; gap: 10px; margin-bottom: 0.5rem; ion-icon { font-size: 24px; color: #DC2626; } h3 { font-size: 16px; font-weight: 700; margin: 0; color: #7F1D1D; } }
    .clearance-alert p { font-size: 13.5px; color: #7F1D1D; line-height: 1.5; margin-bottom: 1rem; }
    .clearance-checklist { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: 13px; li { display: flex; align-items: center; gap: 8px; ion-icon { font-size: 18px; flex-shrink: 0; } } }

    .exam-card { background-color: #ffffff; border: 2px solid #0f172a; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 1.5rem; }
    .exam-header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 1.2rem; margin-bottom: 1.2rem; h2 { font-size: 18px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; } p { font-size: 13px; color: #64748b; margin-top: 4px; } }

    .student-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 1.2rem; font-size: 13.5px; div span { color: #64748b; font-weight: 500; } div strong { color: #0f172a; } }

    .table-container { width: 100%; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 1.2rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th { background-color: #f8fafc; color: #64748b; font-weight: 600; padding: 10px 14px; border-bottom: 1px solid #e2e8f0; }
    td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    tr:last-child td { border-bottom: none; }

    .score-badge { color: #16a34a; font-weight: 600; }
    .badge-normal { background-color: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; }
    .badge-supp { background-color: #fef3c7; color: #b45309; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; }

    .card-footer-info { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px dashed #e2e8f0; font-size: 13px; }

    @media print {
      ion-header, .btn-print-header { display: none !important; }
      body, .mobile-dashboard-content, .dashboard-body { background: white !important; padding: 0 !important; }
      .exam-card { border: none !important; box-shadow: none !important; padding: 0 !important; }
    }
  `]
})
export class ExamCardPage implements OnInit {
  isLoading: boolean = true;
  isCleared: boolean = false;
  feeCleared: boolean = false;
  feeBalance: number = 0;
  allCatsEntered: boolean = true;

  studentName: string = 'Loading...';
  studentAdm: string = 'Loading...';
  issueDate: string = new Date().toLocaleDateString();
  unitsList: ExamUnit[] = [];

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({ printOutline, warningOutline, checkmarkCircleOutline, closeCircleOutline });
  }

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      await this.loadAndValidateExamCard(user.uid);
    });
  }

  async loadAndValidateExamCard(uid: string) {
    this.isLoading = true;
    try {
      try {
        const balDoc = await doc(this.firestore, "studentAccountBalances", uid);
        const balSnap = await getDoc(balDoc);
        if (balSnap.exists()) {
          this.feeBalance = Number(balSnap.data()['balance'] || 0);
          this.feeCleared = this.feeBalance <= 0;
        } else {
          this.feeCleared = true;
        }
      } catch (e) {
        this.feeCleared = true;
      }

      const userDoc = await getDoc(doc(this.firestore, "users", uid));
      const studentDoc = await getDoc(doc(this.firestore, "students", uid));

      const profile: any = userDoc.exists() ? userDoc.data() : {};
      const studentData: any = studentDoc.exists() ? studentDoc.data() : {};

      this.studentName = profile.fullName || studentData.fullName || studentData.name || "Student";
      this.studentAdm = studentData.admissionNumber || studentData.admissionNo || studentData.admNo || "N/A";

      const subjectsMap: { [key: string]: string } = {};
      try {
        const subjectsSnap = await getDocs(collection(this.firestore, "subjects"));
        subjectsSnap.forEach(d => {
          const s: any = d.data();
          const code = s.code || s.subjectCode || d.id;
          subjectsMap[code] = s.name || s.title || code;
        });
      } catch (e) {}

      const tempUnits: ExamUnit[] = [];

      try {
        const subjDoc = await getDoc(doc(this.firestore, "studentSubjects", uid));
        if (subjDoc.exists()) {
          const sData: any = subjDoc.data();
          const arr = sData.selectedSubjects || sData.units || sData.subjects || [];
          arr.forEach((code: string) => {
            tempUnits.push({
              code: code,
              name: subjectsMap[code] || code,
              type: "Normal Unit",
              cat1: 'Missing',
              cat2: 'Missing'
            });
          });
        }
      } catch (e) {}

      try {
        const suppSnap = await getDocs(collection(this.firestore, "studentSupplementaries"));
        suppSnap.forEach(d => {
          const sData: any = d.data();
          if (sData.studentUid === uid || d.id.startsWith(uid)) {
            tempUnits.push({
              code: sData.unitCode,
              name: sData.unitName || subjectsMap[sData.unitCode] || "Supplementary Unit",
              type: "Supplementary Unit",
              cat1: 'Missing',
              cat2: 'Missing'
            });
          }
        });
      } catch (e) {}

      const catScoresMap: { [key: string]: { cat1: any, cat2: any } } = {};
      try {
        const resultsSnap = await getDocs(collection(this.firestore, "results"));
        resultsSnap.forEach(d => {
          const r: any = d.data();
          if (r.studentUid === uid || r.studentId === uid || d.id.includes(uid)) {
            const code = r.unitCode || r.subjectCode || r.code || r.subject;
            catScoresMap[code] = {
              cat1: r.cat1 !== undefined && r.cat1 !== null ? r.cat1 : (r.cat1Score !== undefined ? r.cat1Score : null),
              cat2: r.cat2 !== undefined && r.cat2 !== null ? r.cat2 : (r.cat2Score !== undefined ? r.cat2Score : null)
            };
          }
        });
      } catch (e) {}

      this.allCatsEntered = true;
      tempUnits.forEach(u => {
        const scores = catScoresMap[u.code] || {};
        u.cat1 = scores.cat1 !== null && scores.cat1 !== undefined ? scores.cat1 : "Missing";
        u.cat2 = scores.cat2 !== null && scores.cat2 !== undefined ? scores.cat2 : "Missing";

        if (u.cat1 === "Missing" || u.cat2 === "Missing") {
          this.allCatsEntered = false;
        }
      });

      this.unitsList = tempUnits;
      this.isCleared = this.feeCleared && this.allCatsEntered && this.unitsList.length > 0;

    } catch (err) {
      console.error("Error evaluating clearance status:", err);
    } finally {
      this.isLoading = false;
    }
  }

  printCard() {
    window.print();
  }
}