import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon, IonButtons, IonBackButton, IonSpinner,
  IonHeader, IonToolbar, IonTitle, AlertController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { Auth, User, onAuthStateChanged } from '@angular/fire/auth';
import {
  Firestore, collection, getDocs, getDoc, doc, setDoc, serverTimestamp,
  query, where, documentId
} from '@angular/fire/firestore';

interface EligibleUnit {
  code: string;
  name: string;
  grade: string;
  score: number | null;
}

interface RegisteredSupplementary {
  dateStr: string;
  sortKey: number;
  unitCode: string;
  unitName: string;
}

@Component({
  selector: 'app-supplementary-registration',
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
        <ion-title>Supplementary Registration</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="mobile-dashboard-content">
      <div class="dashboard-body">

        <!-- Eligible Units -->
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
                <tr *ngIf="isLoading">
                  <td colspan="5" class="empty-state">
                    <ion-spinner name="crescent" color="primary"></ion-spinner>
                    <p>Loading student exam performance...</p>
                  </td>
                </tr>

                <tr *ngIf="!isLoading && loadError">
                  <td colspan="5" class="empty-state error-text">
                    <p>{{ loadError }}</p>
                  </td>
                </tr>

                <tr *ngIf="!isLoading && !loadError && availableToRegister.length === 0">
                  <td colspan="5" class="empty-state">
                    <ion-icon name="checkmark-circle-outline" class="empty-icon ok"></ion-icon>
                    <p>No unbooked failed units found for your account. All cleared or already registered!</p>
                  </td>
                </tr>

                <tr *ngFor="let unit of availableToRegister">
                  <td><strong>{{ unit.code }}</strong></td>
                  <td>{{ unit.name }}</td>
                  <td>
                    <span class="score-fail">
                      Grade {{ unit.grade }}<ng-container *ngIf="unit.score !== null"> ({{ unit.score }} Marks)</ng-container>
                    </span>
                  </td>
                  <td class="fee-free">Free (KES 0)</td>
                  <td>
                    <button class="btn-primary" [disabled]="busyCode !== null" (click)="registerSupplementary(unit)">
                      {{ busyCode === unit.code ? 'Registering...' : 'Register Supplementary' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Registered Units -->
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
                <tr *ngIf="isLoading">
                  <td colspan="5" class="empty-state">
                    <ion-spinner name="crescent" color="primary"></ion-spinner>
                    <p>Loading booked supplementary units...</p>
                  </td>
                </tr>

                <tr *ngIf="!isLoading && registeredList.length === 0">
                  <td colspan="5" class="empty-state">
                    <ion-icon name="alert-circle-outline" class="empty-icon"></ion-icon>
                    <p>You have not registered for any supplementary units yet.</p>
                  </td>
                </tr>

                <tr *ngFor="let item of registeredList">
                  <td>{{ item.dateStr }}</td>
                  <td><strong>{{ item.unitCode }}</strong></td>
                  <td>{{ item.unitName }}</td>
                  <td><span class="badge-supp">Supplementary Unit</span></td>
                  <td class="fee-free">KES 0 (Free)</td>
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
    th { background-color: #f8fafc; color: #64748b; font-weight: 600; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
    td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; color: #1e293b; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }

    .empty-state { text-align: center; color: #64748b; padding: 2.5rem !important; }
    .empty-state p { margin: 8px 0 0 0; }
    .empty-icon { font-size: 24px; color: #94a3b8; }
    .empty-icon.ok { color: #16a34a; }
    .error-text { color: #dc2626; }

    .score-fail { color: #dc2626; font-weight: 700; white-space: nowrap; }
    .fee-free { color: #16a34a; font-weight: 600; white-space: nowrap; }

    .btn-primary { background-color: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
    .btn-primary:hover:not(:disabled) { background-color: #1d4ed8; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .badge-supp { background-color: #fef3c7; color: #b45309; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; white-space: nowrap; }
  `]
})
export class SupplementaryRegistrationPage {
  isLoading = true;
  loadError = '';
  busyCode: string | null = null;
  currentUserUid = '';

  availableToRegister: EligibleUnit[] = [];
  registeredList: RegisteredSupplementary[] = [];

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ alertCircleOutline, checkmarkCircleOutline });
  }

  // Ionic caches pages, so this runs every time the page is shown and always
  // loads the CURRENTLY logged-in student's data.
  async ionViewWillEnter() {
    this.isLoading = true;
    this.loadError = '';
    this.availableToRegister = [];
    this.registeredList = [];
    this.cdr.detectChanges();

    const user = await this.waitForUser();
    if (!user) {
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }
    this.currentUserUid = user.uid;
    await this.loadEligibleAndRegisteredSupplementaries();
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

  // Fetches only THIS student's documents instead of downloading the whole collection.
  // Matches on the given fields, or a document ID that starts with the uid.
  private async fetchOwnDocs(
    collectionName: string,
    uid: string,
    matchFields: { field: string; value: string }[]
  ): Promise<Map<string, any>> {
    const found = new Map<string, any>();
    const col = collection(this.firestore, collectionName);

    const queries = [
      ...matchFields.filter(m => m.value).map(m => query(col, where(m.field, '==', m.value))),
      query(col, where(documentId(), '>=', uid), where(documentId(), '<=', uid + '\uf8ff'))
    ];

    const settled = await Promise.allSettled(queries.map(q => getDocs(q)));
    settled.forEach(res => {
      if (res.status === 'fulfilled') {
        res.value.forEach(d => found.set(d.id, d.data()));
      } else {
        console.warn(`Query on ${collectionName} failed:`, res.reason);
      }
    });
    return found;
  }

  private extractScore(r: any): number | null {
    for (const key of ['marks', 'score', 'mark', 'totalScore']) {
      const v = r[key];
      if (v !== undefined && v !== null && v !== '' && !isNaN(Number(v))) return Number(v);
    }
    return null;
  }

  async loadEligibleAndRegisteredSupplementaries() {
    const uid = this.currentUserUid;
    if (!uid) return;

    this.isLoading = true;
    this.loadError = '';

    try {
      // 0. Admission number (so we find results posted by admission number, like the Results page)
      let admNo = '';
      try {
        const studentSnap = await getDoc(doc(this.firestore, 'students', uid));
        if (studentSnap.exists()) {
          const s: any = studentSnap.data();
          admNo = s['admissionNumber'] || s['admissionNo'] || s['admNo'] || s['regNumber'] || '';
        }
      } catch (e) {}

      // 1. Subject lookup map
      const subjectsMap: { [key: string]: { code: string; name: string } } = {};
      try {
        const subjectsSnap = await getDocs(collection(this.firestore, 'subjects'));
        subjectsSnap.forEach(d => {
          const data: any = d.data();
          const code = data.code || data.subjectCode || data.unitCode || d.id;
          const name = data.name || data.title || data.subjectName || code;
          subjectsMap[d.id] = { code, name };
          subjectsMap[code] = { code, name };
          if (name) subjectsMap[String(name).toLowerCase()] = { code, name };
        });
      } catch (e) {
        console.warn('Subjects lookup skipped:', e);
      }

      // 2. Failed units from this student's results only
      const failedUnitsMap: { [key: string]: EligibleUnit } = {};

      const matchFields = [
        { field: 'studentUid', value: uid },
        { field: 'studentId', value: uid },
        { field: 'admissionNumber', value: admNo }
      ];

      for (const collName of ['examResults', 'results']) {
        const docs = await this.fetchOwnDocs(collName, uid, matchFields);

        docs.forEach((r: any) => {
          const grade = String(r.grade || '').toUpperCase().trim();
          const score = this.extractScore(r);
          const isFail = grade === 'F' || grade === 'E' || (score !== null && score > 0 && score < 40);
          if (!isFail) return;

          let rawCode: string = r.unitCode || r.subjectCode || r.code || r.subjectId || '';
          let rawName: string = r.unitName || r.subjectName || r.subject || r.name || '';

          // A "code" that is really a name (e.g. "Physics")
          if (rawCode && !/\d/.test(rawCode) && rawCode.length > 4) {
            if (!rawName) rawName = rawCode;
            rawCode = '';
          }

          if (rawName && subjectsMap[rawName.toLowerCase()]) {
            rawCode = subjectsMap[rawName.toLowerCase()].code;
            rawName = subjectsMap[rawName.toLowerCase()].name;
          } else if (rawCode && subjectsMap[rawCode]) {
            rawName = subjectsMap[rawCode].name;
            rawCode = subjectsMap[rawCode].code;
          }

          // Stable code: never random, otherwise a registered unit would reappear as
          // "eligible" on the next load. Falls back to the unit name, like the Exam Card does.
          const finalCode = (rawCode && !rawCode.includes(uid)) ? rawCode : rawName;
          if (!finalCode) return;

          failedUnitsMap[finalCode] = {
            code: finalCode,
            name: rawName || 'Academic Unit',
            grade: grade || 'F',
            score
          };
        });
      }

      // 3. Already registered supplementaries (this student only)
      const regList: RegisteredSupplementary[] = [];
      const registeredCodes = new Set<string>();

      try {
        const supps = await this.fetchOwnDocs('studentSupplementaries', uid, [
          { field: 'studentUid', value: uid }
        ]);
        supps.forEach((sData: any) => {
          registeredCodes.add(sData.unitCode);
          const ts = sData.registeredAt?.toDate ? sData.registeredAt.toDate() : null;
          regList.push({
            dateStr: ts ? ts.toLocaleDateString() : 'Recent',
            sortKey: ts ? ts.getTime() : Date.now(),
            unitCode: sData.unitCode,
            unitName: sData.unitName
          });
        });
      } catch (e) {
        console.warn('Could not read studentSupplementaries:', e);
      }

      regList.sort((a, b) => b.sortKey - a.sortKey);
      this.registeredList = regList;
      this.availableToRegister = Object.values(failedUnitsMap)
        .filter(u => !registeredCodes.has(u.code))
        .sort((a, b) => a.name.localeCompare(b.name));

    } catch (err) {
      console.error('Error loading supplementary data:', err);
      this.loadError = 'Failed to load supplementary units. Please check your network or try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async registerSupplementary(unit: EligibleUnit) {
    if (this.busyCode) return;

    const ok = await this.confirmDialog(
      'Register Supplementary',
      `Register for supplementary exam in ${unit.name} (${unit.code})? Supplementary registration is free (KES 0).`
    );
    if (!ok) return;

    this.busyCode = unit.code;
    this.cdr.detectChanges();

    try {
      // Firestore document IDs cannot contain "/"
      const safeCode = unit.code.replace(/\//g, '-');

      await setDoc(doc(this.firestore, 'studentSupplementaries', `${this.currentUserUid}_${safeCode}`), {
        studentUid: this.currentUserUid,
        unitCode: unit.code,
        unitName: unit.name,
        type: 'Supplementary Unit',
        feeCharged: 0,
        status: 'Registered',
        registeredAt: serverTimestamp()
      });

      await this.showAlert('Registered', `Successfully registered for ${unit.name} supplementary examination!`);
    } catch (err: any) {
      console.error('Error booking supplementary:', err);
      await this.showAlert('Error', err?.message || 'Could not register the supplementary unit.');
    } finally {
      this.busyCode = null;
      await this.loadEligibleAndRegisteredSupplementaries();
    }
  }

  private async confirmDialog(header: string, message: string): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Register', role: 'confirm' }
      ]
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}