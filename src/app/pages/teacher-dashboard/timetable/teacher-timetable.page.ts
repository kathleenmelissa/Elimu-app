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
import { Firestore, doc, getDoc, collection, getDocs } from '@angular/fire/firestore';

interface TimetableEntry {
  id: string;
  dayOfWeek: string;
  time: string;
  className: string;
  subject: string;
  room: string;
}

@Component({
  selector: 'app-teacher-timetable',
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
            <ion-title>Weekly Teaching Timetable</ion-title>
          </ion-toolbar>
        </ion-header>

        <div class="content-body">
          <div class="card">
            <div class="card-title">My Assigned Schedule</div>
            <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 1rem;">
              Review your lecture days, times, and classroom assignments for the current academic term.
            </p>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Day of the Week</th>
                    <th>Time</th>
                    <th>Class / Grade</th>
                    <th>Subject / Unit</th>
                    <th>Room / Venue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="isLoading">
                    <td colspan="5" style="text-align: center; color: #64748b; padding: 2rem;">
                      <ion-spinner name="crescent" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 6px;"></ion-spinner>
                      Loading teaching schedule...
                    </td>
                  </tr>
                  <tr *ngIf="!isLoading && timetableEntries.length === 0">
                    <td colspan="5" style="text-align: center; color: #64748b; padding: 2rem;">No timetable schedule assigned yet.</td>
                  </tr>
                  <ng-container *ngIf="!isLoading">
                    <tr *ngFor="let item of timetableEntries">
                      <td><strong>{{ item.dayOfWeek }}</strong></td>
                      <td>{{ item.time }}</td>
                      <td><span class="badge">{{ item.className }}</span></td>
                      <td><strong>{{ item.subject }}</strong></td>
                      <td>{{ item.room }}</td>
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
    .table-container { width: 100%; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; margin-top: 1rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    th { background-color: #F8FAFC; color: #64748b; font-weight: 600; padding: 0.85rem 1rem; border-bottom: 1px solid #e2e8f0; }
    td { padding: 1rem; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    tr:last-child td { border-bottom: none; }
    .badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: #E2E8F0; color: #0F172A; }
  `]
})
export class TeacherTimetablePage implements OnInit {
  isLoading = true;
  timetableEntries: TimetableEntry[] = [];
  teacherFullName = 'Instructor';

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
      let teacherDoc = await getDoc(doc(this.firestore, "teachers", user.uid));
      if (!teacherDoc.exists()) {
        teacherDoc = await getDoc(doc(this.firestore, "users", user.uid));
      }
      if (teacherDoc.exists()) {
        const data = teacherDoc.data();
        this.teacherFullName = data['fullName'] || data['name'] || `${data['firstName'] || ''} ${data['lastName'] || ''}`.trim() || "Instructor";
      } else {
        this.teacherFullName = user.displayName || "Instructor";
      }
      await this.loadTimetable(this.teacherFullName, user.uid);
    } catch (err) {
      console.error("Error loading profile/timetable:", err);
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

  async loadTimetable(name: string, uid: string) {
    this.isLoading = true;
    this.timetableEntries = [];
    this.cdr.detectChanges();
    try {
      const snap = await getDocs(collection(this.firestore, "timetable"));
      const entries: TimetableEntry[] = [];
      snap.forEach(docSnap => {
        const t: any = docSnap.data();
        const tName = (t.teacher || t.teacherName || t.instructor || "").trim();
        if (tName.toLowerCase() === name.toLowerCase() || t.teacherUid === uid) {
          entries.push({
            id: docSnap.id,
            dayOfWeek: t.dayOfWeek || t.day || 'Monday',
            time: t.time || t.slot || '8:00 AM - 10:00 AM',
            className: t.className || t.class || 'General',
            subject: t.subject || t.name || 'Unit',
            room: t.room || t.venue || 'Main Hall'
          });
        }
      });
      this.timetableEntries = entries;
    } catch (err) {
      console.error("Error loading timetable:", err);
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