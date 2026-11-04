import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { Firestore, doc, getDoc, getDocs, collection } from '@angular/fire/firestore';

interface ClassAssignment {
  className: string;
  subjectName: string;
  schedule: string;
}

interface StudentRecord {
  admNo: string;
  fullName: string;
  email: string;
}

@Component({
  selector: 'app-teacher-classes',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive,
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
            <ion-title>My Assigned Classes & Student Rosters</ion-title>
          </ion-toolbar>
        </ion-header>

        <div class="content-body">
          <div class="card">
            <div class="card-title">Assigned Teaching Units</div>
            <p class="card-sub-desc">Select a class to view its roster and enrolled students.</p>

            <div *ngIf="isLoadingClasses" class="state-box">
              <ion-spinner name="crescent"></ion-spinner>
              <p>Loading assigned classes...</p>
            </div>

            <div class="classes-grid" *ngIf="!isLoadingClasses && assignments.length > 0">
              <div class="class-card" *ngFor="let item of assignments">
                <div class="class-title">{{ item.subjectName }}</div>
                <div class="class-meta">
                  <span>Class/Grade: <strong>{{ item.className }}</strong></span>
                  <span>Schedule: {{ item.schedule }}</span>
                </div>
                <button class="btn-primary" (click)="loadStudentRoster(item.className, item.subjectName)">
                  View Student Roster
                </button>
              </div>
            </div>

            <div *ngIf="!isLoadingClasses && assignments.length === 0" class="state-box">
              <p>No classes or units found in the system. Please add classes and subjects via admin or timetable.</p>
            </div>
          </div>

          <div class="card" *ngIf="isRosterVisible">
            <div class="card-title">
              Student Roster for: <span style="color: var(--primary);">{{ selectedClassName }}</span>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Admission No.</th>
                    <th>Student Name</th>
                    <th>Email / Contact</th>
                    <th>Registered Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="isLoadingRoster">
                    <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Loading student roster...</td>
                  </tr>
                  <tr *ngIf="!isLoadingRoster && rosterStudents.length === 0">
                    <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No students registered under {{ selectedClassName }} yet.</td>
                  </tr>
                  <ng-container *ngIf="!isLoadingRoster">
                    <tr *ngFor="let student of rosterStudents">
                      <td><strong>{{ student.admNo }}</strong></td>
                      <td>{{ student.fullName }}</td>
                      <td>{{ student.email }}</td>
                      <td><span style="color: var(--success); font-weight: 600;">Enrolled</span></td>
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
    .card-title { font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem; }
    .card-sub-desc { font-size: 0.875rem; color: #64748b; margin-bottom: 1rem; }
    .classes-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
    .class-card { background: #F8FAFC; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .class-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
    .class-meta { font-size: 0.875rem; color: #64748b; display: flex; flex-direction: column; gap: 0.25rem; }
    .table-container { width: 100%; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; margin-top: 1rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    th { background-color: #F8FAFC; color: #64748b; font-weight: 600; padding: 0.85rem 1rem; border-bottom: 1px solid #e2e8f0; }
    td { padding: 1rem; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    tr:last-child td { border-bottom: none; }
    .btn-primary { background-color: #2563EB; color: white; border: none; padding: 0.6rem 1rem; border-radius: 10px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: background 0.2s; text-decoration: none; display: inline-block; text-align: center; margin-top: auto; }
    .btn-primary:hover { background-color: #1D4ED8; }
    .state-box { text-align: center; color: #64748b; padding: 2rem 1rem; font-size: 13px; }
  `]
})
export class TeacherClassesPage implements OnInit {
  isLoadingClasses = true;
  isLoadingRoster = false;
  isRosterVisible = false;
  assignments: ClassAssignment[] = [];
  rosterStudents: StudentRecord[] = [];
  selectedClassName = '';

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
    try {
      let teacherFullName = "Instructor";
      let teacherDoc = await getDoc(doc(this.firestore, "teachers", user.uid));
      if (!teacherDoc.exists()) {
        teacherDoc = await getDoc(doc(this.firestore, "users", user.uid));
      }
      if (teacherDoc.exists()) {
        const data = teacherDoc.data();
        teacherFullName = data['fullName'] || data['name'] || `${data['firstName'] || ''} ${data['lastName'] || ''}`.trim() || "Instructor";
      } else {
        teacherFullName = user.displayName || "Instructor";
      }
      await this.loadTeacherClassesAndUnits(teacherFullName, user.uid);
    } catch (err) {
      console.error("Error loading teacher profile:", err);
    } finally {
      this.isLoadingClasses = false;
      this.cdr.detectChanges();
    }
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

  async loadTeacherClassesAndUnits(name: string, uid: string) {
    let loadedAssignments: ClassAssignment[] = [];
    try {
      const timetableSnap = await getDocs(collection(this.firestore, "timetable"));
      timetableSnap.forEach(d => {
        const t: any = d.data();
        const tName = (t.teacher || t.teacherName || t.instructor || "").trim();
        if (!tName || tName.toLowerCase() === name.toLowerCase() || t.teacherUid === uid) {
          loadedAssignments.push({
            className: t.className || t.class || "General Class",
            subjectName: t.subject || t.name || "Assigned Unit",
            schedule: `${t.day || 'Schedule TBA'} (${t.time || 'Time TBA'})`
          });
        }
      });
    } catch (e) {}

    if (loadedAssignments.length === 0) {
      const classesList: string[] = [];
      const subjectsList: string[] = [];
      try {
        const classesSnap = await getDocs(collection(this.firestore, "classes"));
        classesSnap.forEach(d => {
          const c: any = d.data();
          if (c.className || c.name) classesList.push(c.className || c.name);
        });
      } catch (e) {}

      if (classesList.length === 0) {
        const studentsSnap = await getDocs(collection(this.firestore, "students"));
        studentsSnap.forEach(d => {
          const s: any = d.data();
          const cl = s.className || s.grade;
          if (cl && !classesList.includes(cl)) classesList.push(cl);
        });
      }

      try {
        const subjectsSnap = await getDocs(collection(this.firestore, "subjects"));
        subjectsSnap.forEach(d => {
          const sub: any = d.data();
          const sName = sub.subjectName || sub.name || sub.title;
          if (sName) subjectsList.push(sName);
        });
      } catch (e) {}

      if (classesList.length > 0 && subjectsList.length > 0) {
        for (const cls of classesList) {
          for (const sub of subjectsList) {
            loadedAssignments.push({ className: cls, subjectName: sub, schedule: "Standard Term Schedule" });
          }
        }
      } else if (classesList.length > 0) {
        for (const cls of classesList) {
          loadedAssignments.push({ className: cls, subjectName: "General Unit", schedule: "Standard Term Schedule" });
        }
      }
    }
    this.assignments = loadedAssignments;
  }

  async loadStudentRoster(className: string, subjectName: string) {
    this.isRosterVisible = true;
    this.isLoadingRoster = true;
    this.selectedClassName = `${className} (${subjectName})`;
    this.rosterStudents = [];
    this.cdr.detectChanges();
    try {
      const studentsSnap = await getDocs(collection(this.firestore, "students"));
      const students: StudentRecord[] = [];
      studentsSnap.forEach(d => {
        const s: any = d.data();
        const sClass = (s.className || s.grade || s.class || "").trim();
        if (sClass.toLowerCase() === className.toLowerCase()) {
          const admNo = s.admissionNumber || s.admissionNo || s.admNo || s.admission || s.adm || s.regNumber || s.regNo || s.studentId || d.id.substring(0, 8) || "N/A";
          const fullName = s.fullName || s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || "Unknown Student";
          const email = s.email || "No email provided";
          students.push({ admNo, fullName, email });
        }
      });
      this.rosterStudents = students;
    } catch (err) {
      console.error("Error loading student roster:", err);
    } finally {
      this.isLoadingRoster = false;
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