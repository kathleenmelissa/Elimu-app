import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonIcon,
  IonButtons, IonMenuButton, IonSpinner
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  schoolOutline, bookOutline, businessOutline, timeOutline,
  documentTextOutline, readerOutline, checkmarkCircleOutline,
  folderOpenOutline, statsChartOutline, logOutOutline
} from 'ionicons/icons';
import { Auth, User, onAuthStateChanged, signOut } from '@angular/fire/auth';
import {
  Firestore, doc, getDoc, setDoc, collection, getDocs, serverTimestamp
} from '@angular/fire/firestore';

interface SubjectRow {
  name: string;
  teacher: string;
  selected: boolean;
}

@Component({
  selector: 'app-student-subjects',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, RouterLinkActive,
    IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonLabel, IonIcon,
    IonButtons, IonMenuButton, IonSpinner
  ],
  template: `
    <ion-split-pane content-id="student-main-content">

      <!-- Student Sidebar Navigation Menu -->
      <ion-menu content-id="student-main-content" menuId="student-menu" side="start">
        <ion-header>
          <ion-toolbar class="sidebar-toolbar">
            <div class="brand-container">
              <ion-icon name="school-outline" class="brand-icon"></ion-icon>
              <ion-title class="brand-title">Student Portal</ion-title>
            </div>
          </ion-toolbar>
        </ion-header>

        <ion-content class="sidebar-content">
          <ion-list lines="none" class="nav-list">
            <ion-item routerLink="/student/dashboard" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="stats-chart-outline" slot="start"></ion-icon>
              <ion-label>Dashboard</ion-label>
            </ion-item>
            <ion-item routerLink="/student/subjects" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="book-outline" slot="start"></ion-icon>
              <ion-label>Register Units</ion-label>
            </ion-item>
            <ion-item routerLink="/student/supplementary" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="document-text-outline" slot="start"></ion-icon>
              <ion-label>Supplementary Registration</ion-label>
            </ion-item>
            <ion-item routerLink="/student/dorms" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="business-outline" slot="start"></ion-icon>
              <ion-label>Hostel Booking</ion-label>
            </ion-item>
            <ion-item routerLink="/student/examcard" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="reader-outline" slot="start"></ion-icon>
              <ion-label>Exam Card</ion-label>
            </ion-item>
            <ion-item routerLink="/student/timetable" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="time-outline" slot="start"></ion-icon>
              <ion-label>My Timetable</ion-label>
            </ion-item>
            <ion-item routerLink="/student/attendance" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="checkmark-circle-outline" slot="start"></ion-icon>
              <ion-label>Attendance</ion-label>
            </ion-item>
            <ion-item routerLink="/student/materials" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="folder-open-outline" slot="start"></ion-icon>
              <ion-label>Learning Materials</ion-label>
            </ion-item>
            <ion-item routerLink="/student/results" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="stats-chart-outline" slot="start"></ion-icon>
              <ion-label>Exam Results</ion-label>
            </ion-item>
            <ion-item button (click)="logout()" class="nav-item logout-item">
              <ion-icon name="log-out-outline" slot="start" color="danger"></ion-icon>
              <ion-label color="danger">Logout</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-menu>

      <!-- Main Content Area -->
      <ion-content id="student-main-content" class="main-content-wrapper">
        <ion-header>
          <ion-toolbar class="header-gradient-toolbar">
            <ion-buttons slot="start">
              <ion-menu-button menu="student-menu" class="menu-btn"></ion-menu-button>
            </ion-buttons>
            <ion-title>Subject Registration & Dropping</ion-title>
          </ion-toolbar>
        </ion-header>

        <div class="dashboard-body">
          <div class="card">
            <div class="card-title-group">
              <div class="icon-header-badge">
                <ion-icon name="book-outline"></ion-icon>
              </div>
              <div>
                <h2>Manage Units for {{ studentClass || 'Your Class' }}</h2>
                <p>Check units you want to register for, or uncheck any unit you want to <strong>drop</strong>. Click save when you're finished to update your schedule and term fees.</p>
              </div>
            </div>

            <div *ngIf="isLoading" class="loading-state">
              <ion-spinner name="crescent" class="spinner"></ion-spinner>
              Loading registered and available subjects...
            </div>

            <div *ngIf="!isLoading && loadError" class="empty-state error-text">
              {{ loadError }}
            </div>

            <form (submit)="saveSubjectSelections($event)" *ngIf="!isLoading && !loadError">
              <div class="subject-list">
                <div *ngIf="subjects.length === 0" class="empty-state">
                  No subjects configured for {{ studentClass }} yet.
                </div>

                <div class="subject-item" *ngFor="let sub of subjects">
                  <div class="subject-info">
                    <span class="subject-name">{{ sub.name }}</span>
                    <div class="subject-meta">
                      <span class="teacher-tag">Teacher: <strong>{{ sub.teacher }}</strong></span>
                    </div>
                  </div>
                  <div>
                    <input type="checkbox" [(ngModel)]="sub.selected" [name]="'sub_' + sub.name" class="custom-checkbox" />
                  </div>
                </div>
              </div>

              <button type="submit" class="btn-primary" [disabled]="isSaving || subjects.length === 0">
                <ion-spinner name="crescent" *ngIf="isSaving" class="spinner-btn"></ion-spinner>
                {{ isSaving ? 'Updating Selections & Fees...' : 'Save Changes & Update Term Fees' }}
              </button>
            </form>
          </div>
        </div>
      </ion-content>

    </ion-split-pane>
  `,
  styles: [`
    ion-menu { --width: 260px; }
    .sidebar-toolbar { --background: #e0e5ec; --color: #0f3cd1; padding: 6px 12px; }
    .brand-container { display: flex; align-items: center; gap: 10px; width: 100%; }
    .brand-icon { font-size: 24px; color: #3880ff; flex-shrink: 0; }
    .brand-title { font-size: 16px; font-weight: 700; color: #0f3cd1; padding: 0; min-height: unset; }
    .sidebar-content { --background: #e0e2e6; }
    .nav-list { background: transparent; padding: 8px 0; }
    .nav-item {
      --background: transparent;
      --background-hover: rgba(23, 9, 224, 0.05);
      --color: #1c5bda;
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 2px;
      --padding-start: 12px;
    }
    .active-link {
      --background: #1366eb !important;
      --color: #ffffff !important;
      font-weight: 600;
      border-left: 4px solid #3880ff;
    }
    .logout-item { margin-top: 12px; }

    .header-gradient-toolbar { --background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%); --color: #ffffff; }
    .menu-btn { color: #ffffff; }
    .main-content-wrapper { --background: #f8fafc; }

    .dashboard-body { padding: 24px; max-width: 850px; margin: 0 auto; width: 100%; box-sizing: border-box; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }

    .card-title-group { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 1.5rem; }
    .icon-header-badge { width: 42px; height: 42px; background: #eff6ff; color: #2563eb; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }

    h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; }
    p { font-size: 13px; color: #64748b; margin: 0; line-height: 1.4; }

    .loading-state, .empty-state { text-align: center; color: #64748b; padding: 2rem; font-size: 14px; }
    .error-text { color: #dc2626; }
    .spinner { width: 24px; height: 24px; vertical-align: middle; margin-right: 8px; }
    .spinner-btn { width: 18px; height: 18px; vertical-align: middle; margin-right: 8px; }

    .subject-list { display: flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto; padding-right: 4px; }
    .subject-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
    .subject-info { display: flex; flex-direction: column; gap: 2px; }
    .subject-name { font-size: 14px; font-weight: 600; color: #0f172a; }
    .subject-meta { font-size: 12px; color: #64748b; }
    .custom-checkbox { width: 18px; height: 18px; accent-color: #2563eb; cursor: pointer; }

    .btn-primary { width: 100%; margin-top: 1.5rem; padding: 0.85rem; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
  `]
})
export class RegisterUnitsPage {
  studentClass = '';
  studentAdmissionNo = '';
  studentName = '';
  subjects: SubjectRow[] = [];

  isLoading = true;
  isSaving = false;
  loadError = '';

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  private readonly FEE_PER_UNIT = 10000; // KES 10,000 per registered unit

  constructor() {
    addIcons({
      schoolOutline, bookOutline, businessOutline, timeOutline,
      documentTextOutline, readerOutline, checkmarkCircleOutline,
      folderOpenOutline, statsChartOutline, logOutOutline
    });
  }

  // Ionic caches pages, so this runs every time the page is shown (including the
  // first time) and always loads the CURRENTLY logged-in student's data.
  async ionViewWillEnter() {
    await this.loadPage();
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

  private async loadPage() {
    this.isLoading = true;
    this.loadError = '';
    this.subjects = [];
    this.studentClass = '';
    this.cdr.detectChanges();

    const user = await this.waitForUser();
    if (!user) {
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    try {
      const studentSnap = await getDoc(doc(this.firestore, 'students', user.uid));
      if (!studentSnap.exists()) {
        this.loadError = 'Student profile not found.';
        return;
      }

      const s = studentSnap.data();
      this.studentClass = s['className'] || s['class'] || 'Form 1';
      this.studentAdmissionNo = s['admissionNumber'] || s['admissionNo'] || s['admNo'] || s['regNumber'] || 'N/A';
      this.studentName = s['fullName'] || s['name'] || 'Student';

      await this.loadSubjectsAndRegistrations(user.uid);
    } catch (err) {
      console.error('Error loading student profile:', err);
      this.loadError = 'Failed to load subjects.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async loadSubjectsAndRegistrations(studentUid: string) {
    // 1. Units this student has already registered
    const regSnap = await getDoc(doc(this.firestore, 'studentSubjects', studentUid));
    const registeredSubjects: string[] = regSnap.exists() ? (regSnap.data()['selectedSubjects'] || []) : [];
    const registeredLower = new Set(registeredSubjects.map(s => String(s).trim().toLowerCase()));

    // 2. Subjects, timetable and teachers
    const [timetableSnap, subjectsSnap, teachersSnap] = await Promise.all([
      getDocs(collection(this.firestore, 'timetable')),
      getDocs(collection(this.firestore, 'subjects')),
      getDocs(collection(this.firestore, 'teachers')).catch(() => null)
    ]);

    // 3. Build subject -> teacher map (same order of precedence as the website)
    const teacherMap: { [key: string]: string } = {};

    teachersSnap?.forEach((docSnap: any) => {
      const t = docSnap.data();
      const fullName = t['fullName'] || t['name'] || `${t['firstName'] || ''} ${t['lastName'] || ''}`.trim();
      if (!fullName) return;

      if (Array.isArray(t['subjects'])) {
        t['subjects'].forEach((sub: any) => {
          const n = typeof sub === 'string' ? sub : sub?.name;
          if (n) teacherMap[n.trim().toLowerCase()] = fullName;
        });
      }
      if (t['subject']) {
        teacherMap[String(t['subject']).trim().toLowerCase()] = fullName;
      }
    });

    timetableSnap.forEach((docSnap: any) => {
      const t = docSnap.data();
      const tClass = (t['className'] || t['class'] || '').trim();
      const subName = (t['subject'] || t['name'] || t['title'] || '').trim();
      const teacherVal = t['teacher'] || t['teacherName'] || t['instructor'] || t['lecturer'] || t['staffName'];

      if (subName && teacherVal) {
        const subKey = subName.toLowerCase();
        teacherMap[subKey] = teacherVal;
        if (tClass) teacherMap[`${tClass.toLowerCase()}_${subKey}`] = teacherVal;
      }
    });

    subjectsSnap.forEach((docSnap: any) => {
      const sub = docSnap.data();
      const subName = (sub['subjectName'] || sub['name'] || sub['title'] || '').trim();
      const teacherVal = sub['teacher'] || sub['teacherName'] || sub['instructor'];
      if (subName && teacherVal) teacherMap[subName.toLowerCase()] = teacherVal;
    });

    // 4. Build the list, filtered to this student's class
    const classLower = this.studentClass.toLowerCase();
    const loadedList: SubjectRow[] = [];

    subjectsSnap.forEach((docSnap: any) => {
      const sub = docSnap.data();
      const subClass = (sub['className'] || sub['class'] || '').trim();

      if (subClass && classLower && subClass.toLowerCase() !== classLower) return;

      const subName = (sub['subjectName'] || sub['name'] || sub['title'] || '').trim();
      if (!subName) return;

      const subLower = subName.toLowerCase();
      const classSubKey = classLower ? `${classLower}_${subLower}` : '';

      const teacher =
        sub['teacher'] || sub['teacherName'] || sub['instructor'] ||
        (classSubKey ? teacherMap[classSubKey] : null) ||
        teacherMap[subLower] ||
        'Not Assigned';

      loadedList.push({
        name: subName,
        teacher,
        selected: registeredLower.has(subLower)
      });
    });

    this.subjects = loadedList;
  }

  async saveSubjectSelections(e: Event) {
    e.preventDefault();

    const user = this.auth.currentUser ?? (await this.waitForUser());
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isSaving = true;
    this.cdr.detectChanges();

    try {
      // 1. Save selected units
      const selectedSubjects = this.subjects.filter(s => s.selected).map(s => s.name);

      await setDoc(doc(this.firestore, 'studentSubjects', user.uid), {
        studentUid: user.uid,
        admissionNumber: this.studentAdmissionNo,
        studentName: this.studentName,
        className: this.studentClass,
        selectedSubjects,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Tuition = units x KES 10,000
      const unitsCount = selectedSubjects.length;
      const tuitionFee = unitsCount * this.FEE_PER_UNIT;

      // 3. Preserve hostel fee and amount paid
      const balanceRef = doc(this.firestore, 'studentAccountBalances', user.uid);
      const balSnap = await getDoc(balanceRef);

      let hostelFee = 0;
      let amountPaid = 0;

      if (balSnap.exists()) {
        const balData = balSnap.data();
        hostelFee = Number(balData['hostelFee'] || 0);
        amountPaid = Number(balData['amountPaid'] || 0);
      } else {
        // No balance record yet: fall back to the student's dorm booking
        const dormSnap = await getDoc(doc(this.firestore, 'studentDormBookings', user.uid));
        if (dormSnap.exists()) {
          hostelFee = Number(dormSnap.data()['feeAmount'] || 0);
        }
      }

      const totalBill = tuitionFee + hostelFee;
      const feeBalance = totalBill - amountPaid;

      // 4. Update the balance record that the Fees page and accountant read
      await setDoc(balanceRef, {
        studentUid: user.uid,
        admissionNumber: this.studentAdmissionNo,
        studentName: this.studentName,
        className: this.studentClass,
        totalBill,
        amountPaid,
        balance: feeBalance,
        tuitionFee,
        hostelFee,
        updatedAt: serverTimestamp()
      }, { merge: true });

      alert(
        `Subject updates saved successfully!\n\n` +
        `Registered Units: ${unitsCount} (${unitsCount} × KES 10,000)\n` +
        `Tuition Fee: KES ${tuitionFee.toLocaleString()}\n` +
        `Total Bill: KES ${totalBill.toLocaleString()}`
      );

      await this.loadSubjectsAndRegistrations(user.uid);
    } catch (err: any) {
      console.error('Error updating subjects & fees:', err);
      alert(`Error: ${err.message}`);
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }
}