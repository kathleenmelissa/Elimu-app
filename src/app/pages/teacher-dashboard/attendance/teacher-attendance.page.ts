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
  schoolOutline, peopleOutline, checkmarkCircleOutline, createOutline,
  folderOpenOutline, timeOutline, statsChartOutline, logOutOutline, alertCircleOutline
} from 'ionicons/icons';
import { Auth, User, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';

interface AttendanceRecord {
  admissionNumber: string;
  studentName: string;
  subject: string;
  ipAddress: string;
  timeMarked: string;
  status: string;
}

@Component({
  selector: 'app-teacher-attendance',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, RouterLinkActive,
    IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonLabel, IonIcon,
    IonButtons, IonMenuButton, IonSpinner
  ],
  template: `
    <ion-split-pane content-id="teacher-main-content">
      <ion-menu content-id="teacher-main-content" menuId="teacher-menu" side="start">
        <ion-header>
          <ion-toolbar class="sidebar-toolbar">
            <div class="brand-container">
              <ion-icon name="school-outline" class="brand-icon"></ion-icon>
              <ion-title class="brand-title">Teacher Portal</ion-title>
            </div>
          </ion-toolbar>
        </ion-header>
        <ion-content class="sidebar-content">
          <ion-list lines="none" class="nav-list">
            <ion-item routerLink="/teacher/dashboard" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="stats-chart-outline" slot="start"></ion-icon>
              <ion-label>Dashboard</ion-label>
            </ion-item>
            <ion-item routerLink="/teacher/classes" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="people-outline" slot="start"></ion-icon>
              <ion-label>My Classes & Units</ion-label>
            </ion-item>
            <ion-item routerLink="/teacher/attendance" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="checkmark-circle-outline" slot="start"></ion-icon>
              <ion-label>Class Attendance</ion-label>
            </ion-item>
            <ion-item routerLink="/teacher/marks" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="create-outline" slot="start"></ion-icon>
              <ion-label>Enter & Grade Marks</ion-label>
            </ion-item>
            <ion-item routerLink="/teacher/materials" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="folder-open-outline" slot="start"></ion-icon>
              <ion-label>Learning Materials</ion-label>
            </ion-item>
            <ion-item routerLink="/teacher/timetable" routerDirection="root" routerLinkActive="active-link" class="nav-item">
              <ion-icon name="time-outline" slot="start"></ion-icon>
              <ion-label>Teaching Schedule</ion-label>
            </ion-item>
            <ion-item button (click)="logout()" class="nav-item logout-item">
              <ion-icon name="log-out-outline" slot="start" color="danger"></ion-icon>
              <ion-label color="danger">Logout</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-menu>

      <ion-content id="teacher-main-content" class="main-content-wrapper">
        <ion-header>
          <ion-toolbar class="header-gradient-toolbar">
            <ion-buttons slot="start">
              <ion-menu-button menu="teacher-menu" class="menu-btn" (click)="toggleMenu()"></ion-menu-button>
            </ion-buttons>
            <ion-title>Student Attendance Management</ion-title>
          </ion-toolbar>
        </ion-header>

        <div class="content-body">
          <div class="card">
            <div class="card-title">Filter Daily Attendance Records</div>
            <div class="filter-grid">
              <div class="form-group">
                <label for="filterDate">Select Date</label>
                <input type="date" id="filterDate" [(ngModel)]="filterDate" (change)="fetchAttendanceRecords()">
              </div>
              <div class="form-group">
                <label for="filterSubject">Filter by Subject</label>
                <select id="filterSubject" [(ngModel)]="filterSubject" (change)="fetchAttendanceRecords()">
                  <option value="">All Subjects</option>
                  <option *ngFor="let sub of availableSubjects" [value]="sub">{{ sub }}</option>
                </select>
              </div>
            </div>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Adm No.</th>
                    <th>Student Name</th>
                    <th>Subject</th>
                    <th>Network IP (Wi-Fi)</th>
                    <th>Time Marked</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="isLoading">
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                      <ion-spinner name="crescent" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 6px;"></ion-spinner>
                      Loading attendance records...
                    </td>
                  </tr>
                  <tr *ngIf="!isLoading && attendanceRecords.length === 0">
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No attendance records found for the selected filters.</td>
                  </tr>
                  <ng-container *ngIf="!isLoading">
                    <tr *ngFor="let att of attendanceRecords">
                      <td><strong>{{ att.admissionNumber }}</strong></td>
                      <td>{{ att.studentName }}</td>
                      <td><strong>{{ att.subject }}</strong></td>
                      <td><code>{{ att.ipAddress }}</code></td>
                      <td>{{ att.timeMarked }}</td>
                      <td><span style="color: var(--success); font-weight: 600;">{{ att.status }}</span></td>
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
    .sidebar-toolbar { --background: #e0e5ec; --color: #0f3cd1; padding: 6px 12px; }
    .brand-container { display: flex; align-items: center; gap: 10px; width: 100%; }
    .brand-icon { font-size: 24px; color: #3880ff; flex-shrink: 0; }
    .brand-title { font-size: 16px; font-weight: 700; color: #0f172a; padding: 0; min-height: unset; }
    .sidebar-content { --background: #e0e2e6; }
    .nav-list { background: transparent; padding: 8px 0; }
    .nav-item { --background: transparent; --background-hover: rgba(23, 9, 224, 0.05); --color: #1c5bda; font-weight: 500; font-size: 14px; margin-bottom: 2px; --padding-start: 12px; }
    .active-link { --background: #1366eb !important; --color: #ffffff !important; font-weight: 600; border-left: 4px solid #3880ff; }
    .logout-item { margin-top: 12px; }
    .header-gradient-toolbar { --background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%); --color: #ffffff; }
    .menu-btn { color: #ffffff; }
    .main-content-wrapper { --background: #f8fafc; }
    .content-body { padding: 2rem; max-width: 1200px; width: 100%; margin: 0 auto; box-sizing: border-box; }
    .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }
    .card-title { font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 1rem; }
    .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    label { font-size: 0.85rem; font-weight: 600; color: #0f172a; }
    select, input[type="date"] { padding: 0.65rem; border-radius: 10px; border: 1px solid #e2e8f0; background: white; font-size: 0.9rem; color: #1e293b; }
    .table-container { width: 100%; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; margin-top: 1rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
    th { background-color: #F8FAFC; color: #64748b; font-weight: 600; padding: 0.85rem 0.75rem; border-bottom: 1px solid #e2e8f0; }
    td { padding: 0.85rem 0.75rem; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    tr:last-child td { border-bottom: none; }
  `]
})
export class TeacherAttendancePage implements OnInit {
  isLoading = true;
  filterDate = '';
  filterSubject = '';
  availableSubjects: string[] = [];
  attendanceRecords: AttendanceRecord[] = [];

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  constructor() {
    addIcons({
      schoolOutline, peopleOutline, checkmarkCircleOutline, createOutline,
      folderOpenOutline, timeOutline, statsChartOutline, logOutOutline, alertCircleOutline
    });
  }

  async ngOnInit() {
    const user = await this.waitForUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.filterDate = new Date().toISOString().split('T')[0];
    await this.loadSubjectsDropdown();
    await this.fetchAttendanceRecords();
  }

  async ionViewWillEnter() {
    await this.menuCtrl.enable(true, 'teacher-menu');
  }

  async toggleMenu() {
    try {
      await this.menuCtrl.toggle('teacher-menu');
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

  async loadSubjectsDropdown() {
    try {
      const subSnap = await getDocs(collection(this.firestore, "subjects"));
      const subjects: string[] = [];
      subSnap.forEach(docSnap => {
        const sub: any = docSnap.data();
        const name = sub.subjectName || sub.name || sub.title;
        if (name && !subjects.includes(name)) subjects.push(name);
      });
      this.availableSubjects = subjects;
    } catch (err) {
      console.error("Error loading subjects filter:", err);
    }
  }

  async fetchAttendanceRecords() {
    this.isLoading = true;
    this.attendanceRecords = [];
    this.cdr.detectChanges();
    try {
      let q = collection(this.firestore, "attendance");
      if (this.filterDate) {
        q = query(q, where("dateStr", "==", this.filterDate)) as any;
      }
      const snap = await getDocs(q);
      const records: AttendanceRecord[] = [];
      snap.forEach(docSnap => {
        const att: any = docSnap.data();
        if (this.filterSubject && att.subject !== this.filterSubject) return;
        const timeMarked = att.timestamp?.toDate ? att.timestamp.toDate().toLocaleTimeString() : 'N/A';
        records.push({
          admissionNumber: att.admissionNumber || 'N/A',
          studentName: att.studentName || 'Student',
          subject: att.subject || 'General',
          ipAddress: att.ipAddress || 'N/A',
          timeMarked: timeMarked,
          status: att.status || 'Present'
        });
      });
      this.attendanceRecords = records;
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      this.isLoading = false;
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