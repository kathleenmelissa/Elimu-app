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
  businessOutline, alertCircleOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, collection, getDocs, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';

interface EligibleUnit {
  code: string;
  name: string;
  grade: string;
  score: number;
}

interface RegisteredSupplementary {
  dateStr: string;
  unitCode: string;
  unitName: string;
}

@Component({
  selector: 'app-supplementary-registration',
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
        <ion-title>Supplementary Examination Registration</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="mobile-dashboard-content">
      <div class="dashboard-body">

        <!-- Register Supplementary Card -->
        <div class="card">
          <div class="card-title">Eligible Failed Units for Supplementary Registration</div>
          <div class="card-desc">
            Register for supplementary exams for units previously failed. Supplementary exam registration is <strong>Free (KES 0)</strong>. Note: If you fail a supplementary exam, it will subsequently be billed as a normal retake unit (KES 10,000).
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Unit Code</th>
                  <th>Unit Name</th>
                  <th>Previous Grade / Score</th>
                  <th>Supplementary Fee</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <!-- Loading State -->
                <tr *ngIf="isLoadingEligible">
                  <td colspan="5" class="empty-state">
                    <ion-spinner name="crescent" color="primary"></ion-spinner>
                    <p style="margin-top: 8px;">Loading student exam performance...</p>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr *ngIf="!isLoadingEligible && availableToRegister.length === 0">
                  <td colspan="5" class="empty-state">
                    <ion-icon name="checkmark-circle-outline" style="font-size: 24px; color: #16a34a;"></ion-icon>
                    <p>No unbooked failed units found for your account. All cleared or already registered!</p>
                  </td>
                </tr>

                <!-- Eligible Units Rows -->
                <tr *ngFor="let unit of availableToRegister">
                  <td><strong>{{ unit.code }}</strong></td>
                  <td>{{ unit.name }}</td>
                  <td><span class="score-fail">Grade {{ unit.grade }} ({{ unit.score }} Marks)</span></td>
                  <td class="fee-free">Free (KES 0)</td>
                  <td>
                    <button class="btn-primary" (click)="registerSupplementary(unit)">Register Supplementary</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Registered Supplementary Units Card -->
        <div class="card">
          <div class="card-title">My Registered Supplementary Units & Exams</div>
          <div class="card-desc">Units currently booked and scheduled as supplementary units.</div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date Registered</th>
                  <th>Unit Code</th>
                  <th>Unit Name</th>
                  <th>Status Label</th>
                  <th>Fee Charged</th>
                </tr>
              </thead>
              <tbody>
                <!-- Loading State -->
                <tr *ngIf="isLoadingRegistered">
                  <td colspan="5" class="empty-state">
                    <ion-spinner name="crescent" color="primary"></ion-spinner>
                    <p style="margin-top: 8px;">Loading booked supplementary units...</p>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr *ngIf="!isLoadingRegistered && registeredList.length === 0">
                  <td colspan="5" class="empty-state">
                    <ion-icon name="alert-circle-outline" style="font-size: 24px; color: #94a3b8;"></ion-icon>
                    <p>You have not registered for any supplementary units yet.</p>
                  </td>
                </tr>

                <!-- Registered Rows -->
                <tr *ngFor="let item of registeredList">
                  <td>{{ item.dateStr }}</td>
                  <td><strong>{{ item.unitCode }}</strong></td>
                  <td>{{ item.unitName }}</td>
                  <td><span class="badge-supp">Supplementary Unit</span></td>
                  <td style="font-weight: 600; color: var(--success);">KES 0 (Free)</td>
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
    .dashboard-body { padding: 20px; max-width: 950px; margin: 0 auto; }

    .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }
    .card-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
    .card-desc { font-size: 13px; color: #64748b; margin-bottom: 1.2rem; line-height: 1.5; }

    .table-container { width: 100%; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th { background-color: #f8fafc; color: #64748b; font-weight: 600; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; }
    td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    tr:last-child td { border-bottom: none; }

    .empty-state { text-align: center; color: #64748b; padding: 2.5rem !important; }
    .score-fail { color: #dc2626; font-weight: 700; }
    .fee-free { color: #16a34a; font-weight: 600; }

    .btn-primary { background-color: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; transition: background 0.2s; }
    .btn-primary:hover { background-color: #1d4ed8; }

    .badge-supp { background-color: #fef3c7; color: #b45309; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; }
  `]
})
export class SupplementaryRegistrationPage implements OnInit {
  isLoadingEligible: boolean = true;
  isLoadingRegistered: boolean = true;
  currentUserUid: string | null = null;

  availableToRegister: EligibleUnit[] = [];
  registeredList: RegisteredSupplementary[] = [];

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({ businessOutline, alertCircleOutline, checkmarkCircleOutline });
  }

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      this.currentUserUid = user.uid;
      await this.loadEligibleAndRegisteredSupplementaries();
    });
  }

  async loadEligibleAndRegisteredSupplementaries() {
    if (!this.currentUserUid) return;

    this.isLoadingEligible = true;
    this.isLoadingRegistered = true;

    try {
      // 1. Fetch Subjects lookup map
      const subjectsMap: { [key: string]: { code: string; name: string } } = {};
      try {
        const subjectsSnap = await getDocs(collection(this.firestore, "subjects"));
        subjectsSnap.forEach(d => {
          const data: any = d.data();
          const code = data.code || data.subjectCode || data.unitCode || d.id;
          const name = data.name || data.title || data.subjectName || code;
          subjectsMap[d.id] = { code, name };
          subjectsMap[code] = { code, name };
          if (name) subjectsMap[name.toLowerCase()] = { code, name };
        });
      } catch (e) {
        console.warn("Subjects lookup skipped:", e);
      }

      // 2. Scan collections for failed units
      const failedUnitsMap: { [key: string]: EligibleUnit } = {};

      const checkResultsCollection = async (collName: string) => {
        try {
          const snap = await getDocs(collection(this.firestore, collName));
          snap.forEach(d => {
            const r: any = d.data();
            const matchesStudent = (r.studentUid === this.currentUserUid) || (r.studentId === this.currentUserUid) || (d.id.includes(this.currentUserUid!));

            if (matchesStudent) {
              const grade = String(r.grade || "").toUpperCase().trim();
              const score = Number(r.marks || r.score || r.mark || 100);
              const isFail = grade === 'F' || grade === 'E' || (score < 40 && score > 0);

              if (isFail) {
                let rawCode = r.unitCode || r.subjectCode || r.code || r.subjectId || '';
                let rawName = r.unitName || r.subjectName || r.subject || r.name || '';

                if (rawCode && !/\d/.test(rawCode) && rawCode.length > 4) {
                  if (!rawName) rawName = rawCode;
                  rawCode = "";
                }

                if (rawName && subjectsMap[rawName.toLowerCase()]) {
                  rawCode = subjectsMap[rawName.toLowerCase()].code;
                  rawName = subjectsMap[rawName.toLowerCase()].name;
                } else if (rawCode && subjectsMap[rawCode]) {
                  rawName = subjectsMap[rawCode].name;
                  rawCode = subjectsMap[rawCode].code;
                }

                const finalCode = (rawCode && !rawCode.includes(this.currentUserUid!)) ? rawCode : "UNIT-" + Math.floor(Math.random() * 899 + 100);
                const finalName = rawName || "Academic Unit";

                failedUnitsMap[finalCode] = {
                  code: finalCode,
                  name: finalName,
                  grade: grade || 'F',
                  score: score
                };
              }
            }
          });
        } catch (err) {
          console.warn(`Could not read ${collName}:`, err);
        }
      };

      await checkResultsCollection("examResults");
      await checkResultsCollection("results");

      const failedUnits = Object.values(failedUnitsMap);

      // 3. Fetch registered supplementary units
      const regList: RegisteredSupplementary[] = [];
      const registeredCodes = new Set<string>();

      try {
        const suppSnap = await getDocs(collection(this.firestore, "studentSupplementaries"));
        suppSnap.forEach(d => {
          const sData: any = d.data();
          if (sData.studentUid === this.currentUserUid || d.id.startsWith(this.currentUserUid!)) {
            registeredCodes.add(sData.unitCode);
            const dateStr = sData.registeredAt?.toDate ? sData.registeredAt.toDate().toLocaleDateString() : 'Recent';
            regList.push({
              dateStr,
              unitCode: sData.unitCode,
              unitName: sData.unitName
            });
          }
        });
      } catch (e) {
        console.warn("Could not read studentSupplementaries:", e);
      }

      this.registeredList = regList;
      this.availableToRegister = failedUnits.filter(u => !registeredCodes.has(u.code));

    } catch (err) {
      console.error("Error loading supplementary data:", err);
    } finally {
      this.isLoadingEligible = false;
      this.isLoadingRegistered = false;
    }
  }

  async registerSupplementary(unit: EligibleUnit) {
    if (!confirm(`Register for supplementary exam in ${unit.name} (${unit.code})?\n\nSupplementary registration is free (KES 0).`)) return;

    try {
      await setDoc(doc(this.firestore, "studentSupplementaries", `${this.currentUserUid}_${unit.code}`), {
        studentUid: this.currentUserUid,
        unitCode: unit.code,
        unitName: unit.name,
        type: "Supplementary Unit",
        feeCharged: 0,
        status: "Registered",
        registeredAt: serverTimestamp()
      });

      alert(`Successfully registered for ${unit.name} supplementary examination!`);
      await this.loadEligibleAndRegisteredSupplementaries();
    } catch (err: any) {
      console.error("Error booking supplementary:", err);
      alert(`Error: ${err.message}`);
    }
  }
}