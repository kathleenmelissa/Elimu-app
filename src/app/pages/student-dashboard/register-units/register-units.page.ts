import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
import { Auth, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from '@angular/fire/firestore';

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

            <form (submit)="saveSubjectSelections($event)" *ngIf="!isLoading">
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

              <button type="submit" class="btn-primary" [disabled]="isSaving">
                <ion-spinner name="crescent" *ngIf="isSaving" class="spinner-btn"></ion-spinner>
                {{ isSaving ? 'Updating Selections & Fees...' : "Save Changes & Update Term Fees" }}
              </button>
            </form>
          </div>
        </div>
      </ion-content>

    </ion-split-pane>
  `,
  styles: [`
    /* Sidebar Styling */
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

    /* Main Toolbar & Layout */
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
export class RegisterUnitsPage implements OnInit {
  studentClass = '';
  studentAdmissionNo = '';
  studentName = '';
  subjects: { name: string; teacher: string; selected: boolean }[] = [];
  
  isLoading = true;
  isSaving = false;

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private FEE_PER_UNIT = 10000;

  constructor() {
    addIcons({
      schoolOutline, bookOutline, businessOutline, timeOutline,
      documentTextOutline, readerOutline, checkmarkCircleOutline,
      folderOpenOutline, statsChartOutline, logOutOutline
    });
  }

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (!user) {
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    try {
      const studentSnap = await getDoc(doc(this.firestore, 'students', user.uid));
      if (!studentSnap.exists()) {
        this.isLoading = false;
        return;
      }

      const studentData = studentSnap.data();
      this.studentClass = studentData['className'] || studentData['class'] || 'Form 1';
      this.studentAdmissionNo = studentData['admissionNumber'] || studentData['admissionNo'] || 'N/A';
      this.studentName = studentData['fullName'] || studentData['name'] || 'Student';

      await this.loadSubjectsAndRegistrations(user.uid);
    } catch (err) {
      console.error("Error loading student profile:", err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async loadSubjectsAndRegistrations(studentUid: string) {
    const regSnap = await getDoc(doc(this.firestore, 'studentSubjects', studentUid));
    const registeredSubjects: string[] = regSnap.exists() ? (regSnap.data()['selectedSubjects'] || []) : [];

    const [timetableSnap, subjectsSnap, teachersSnap] = await Promise.all([
      getDocs(collection(this.firestore, 'timetable')),
      getDocs(collection(this.firestore, 'subjects')),
      getDocs(collection(this.firestore, 'teachers')).catch(() => ({ forEach: () => {} }))
    ]);

    const teacherMap: { [key: string]: string } = {};
    teachersSnap.forEach((docSnap: any) => {
      const t = docSnap.data();
      const fullName = t['fullName'] || t['name'] || `${t['firstName'] || ''} ${t['lastName'] || ''}`.trim();
      if (fullName && t['subject']) teacherMap[t['subject'].trim().toLowerCase()] = fullName;
    });

    subjectsSnap.forEach((docSnap: any) => {
      const sub = docSnap.data();
      const subName = (sub['subjectName'] || sub['name'] || sub['title'] || '').trim();
      const teacherVal = sub['teacher'] || sub['teacherName'];
      if (subName && teacherVal) teacherMap[subName.toLowerCase()] = teacherVal;
    });

    const loadedList: { name: string; teacher: string; selected: boolean }[] = [];
    subjectsSnap.forEach((docSnap: any) => {
      const sub = docSnap.data();
      const subName = sub['subjectName'] || sub['name'] || sub['title'];
      if (!subName) return;

      const isChecked = registeredSubjects.includes(subName);
      loadedList.push({
        name: subName,
        teacher: sub['teacher'] || teacherMap[subName.toLowerCase()] || 'Not Assigned',
        selected: isChecked
      });
    });

    this.subjects = loadedList;
  }

  async saveSubjectSelections(e: Event) {
    e.preventDefault();
    const user = this.auth.currentUser;
    if (!user) return;

    this.isSaving = true;
    this.cdr.detectChanges();

    try {
      const selectedSubjects = this.subjects.filter(s => s.selected).map(s => s.name);

      await setDoc(doc(this.firestore, 'studentSubjects', user.uid), {
        studentUid: user.uid,
        admissionNumber: this.studentAdmissionNo,
        studentName: this.studentName,
        className: this.studentClass,
        selectedSubjects: selectedSubjects,
        updatedAt: serverTimestamp()
      }, { merge: true });

      const unitsCount = selectedSubjects.length;
      const tuitionFee = unitsCount * this.FEE_PER_UNIT;

      const balanceRef = doc(this.firestore, 'studentAccountBalances', user.uid);
      const balSnap = await getDoc(balanceRef);

      let hostelFee = balSnap.exists() ? Number(balSnap.data()['hostelFee'] || 0) : 0;
      let amountPaid = balSnap.exists() ? Number(balSnap.data()['amountPaid'] || 0) : 0;
      const totalBill = tuitionFee + hostelFee;
      const feeBalance = totalBill - amountPaid;

      await setDoc(balanceRef, {
        studentUid: user.uid,
        admissionNumber: this.studentAdmissionNo,
        studentName: this.studentName,
        className: this.studentClass,
        totalBill: totalBill,
        amountPaid: amountPaid,
        balance: feeBalance,
        tuitionFee: tuitionFee,
        hostelFee: hostelFee,
        updatedAt: serverTimestamp()
      }, { merge: true });

      alert(`Subject updates saved successfully!\n\nRegistered Units: ${unitsCount}\nTuition Fee: KES ${tuitionFee.toLocaleString()}`);
      await this.loadSubjectsAndRegistrations(user.uid);
    } catch (err: any) {
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
      console.error("Logout error:", err);
    }
  }
}