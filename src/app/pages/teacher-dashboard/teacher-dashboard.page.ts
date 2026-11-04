import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonIcon,
  IonButtons, IonMenuButton, IonSpinner
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  schoolOutline, peopleOutline, checkmarkCircleOutline, createOutline,
  folderOpenOutline, timeOutline, statsChartOutline, logOutOutline, alertCircleOutline
} from 'ionicons/icons';
import { Auth, User, onAuthStateChanged, signOut } from '@angular/fire/auth';
import {
  Firestore, doc, getDoc, getDocs, collection, query, where
} from '@angular/fire/firestore';

interface AssignmentRow {
  className: string;
  subject: string;
  schedule: string;
}

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive,
    IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonLabel, IonIcon,
    IonButtons, IonMenuButton, IonSpinner
  ],
  template: `
    <ion-split-pane content-id="teacher-main-content">

      <!-- Teacher Sidebar -->
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

      <!-- Main Content -->
      <ion-content id="teacher-main-content" class="main-content-wrapper">
        <ion-header>
          <ion-toolbar class="header-gradient-toolbar">
            <ion-buttons slot="start">
              <ion-menu-button menu="teacher-menu" class="menu-btn"></ion-menu-button>
            </ion-buttons>
            <ion-title>Welcome, {{ teacherName }}</ion-title>
          </ion-toolbar>
        </ion-header>

        <div class="dashboard-body">

          <!-- Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Assigned Classes</span>
              <span class="stat-value">{{ classesCount }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Total Teaching Units</span>
              <span class="stat-value">{{ unitsCount }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Graded Records</span>
              <span class="stat-value">{{ gradedCount }}</span>
            </div>
          </div>

          <!-- Assigned units -->
          <div class="card">
            <div class="card-title">My Assigned Units & Timetable Schedule</div>
            <p class="card-subtitle">Units assigned to you by the administration, with your class and schedule where available.</p>

            <div *ngIf="isLoading" class="state-box">
              <ion-spinner name="crescent"></ion-spinner>
              <p>Loading teaching assignments...</p>
            </div>

            <div *ngIf="!isLoading && loadError" class="state-box error-text">
              <ion-icon name="alert-circle-outline"></ion-icon>
              <p>{{ loadError }}</p>
            </div>

            <div *ngIf="!isLoading && !loadError && rows.length === 0" class="state-box">
              <ion-icon name="alert-circle-outline"></ion-icon>
              <p>No teaching units are assigned to your account yet. Contact the admin to assign subjects.</p>
            </div>

            <div class="assignment-list" *ngIf="!isLoading && rows.length > 0">
              <div class="assignment-card" *ngFor="let row of rows">
                <div class="assignment-info">
                  <span class="class-tag">{{ row.className }}</span>
                  <h4>{{ row.subject }}</h4>
                  <p><ion-icon name="time-outline"></ion-icon> {{ row.schedule }}</p>
                </div>
                <a class="btn-primary"
                   [routerLink]="['/teacher/marks']"
                   [queryParams]="{ subject: row.subject, class: row.className }">
                  Grade Marks
                </a>
              </div>
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
    .brand-title { font-size: 16px; font-weight: 700; color: #0f3cd1; padding: 0; min-height: unset; }
    .sidebar-content { --background: #e0e2e6; }
    .nav-list { background: transparent; padding: 8px 0; }
    .nav-item { --background: transparent; --background-hover: rgba(23, 9, 224, 0.05); --color: #1c5bda; font-weight: 500; font-size: 14px; margin-bottom: 2px; --padding-start: 12px; }
    .active-link { --background: #1366eb !important; --color: #ffffff !important; font-weight: 600; border-left: 4px solid #3880ff; }
    .logout-item { margin-top: 12px; }

    .header-gradient-toolbar { --background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%); --color: #ffffff; }
    .menu-btn { color: #ffffff; }
    .main-content-wrapper { --background: #f8fafc; }
    .dashboard-body { padding: 20px; max-width: 1000px; margin: 0 auto; width: 100%; box-sizing: border-box; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.35rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .stat-label { font-size: 12px; color: #64748b; font-weight: 500; }
    .stat-value { font-size: 24px; font-weight: 700; color: #0f172a; }

    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .card-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
    .card-subtitle { font-size: 13px; color: #64748b; margin: 0 0 1.2rem 0; line-height: 1.4; }

    .state-box { text-align: center; color: #64748b; padding: 2rem 1rem; font-size: 13px; }
    .state-box ion-icon { font-size: 24px; color: #94a3b8; }
    .state-box p { margin: 8px 0 0 0; }
    .error-text { color: #dc2626; }
    .error-text ion-icon { color: #dc2626; }

    .assignment-list { display: flex; flex-direction: column; gap: 10px; }
    .assignment-card { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; }
    .assignment-info h4 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 6px 0 4px 0; }
    .assignment-info p { font-size: 12px; color: #64748b; margin: 0; display: flex; align-items: center; gap: 4px; }
    .class-tag { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }

    .btn-primary { background-color: #2563eb; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 13px; text-decoration: none; white-space: nowrap; transition: background 0.2s; }
    .btn-primary:hover { background-color: #1d4ed8; }
  `]
})
export class TeacherDashboardPage {
  teacherName = 'Instructor';
  isLoading = true;
  loadError = '';

  classesCount = 0;
  unitsCount = 0;
  gradedCount = 0;
  rows: AssignmentRow[] = [];

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  private uid = '';
  private fullNorm = '';

  constructor() {
    addIcons({
      schoolOutline, peopleOutline, checkmarkCircleOutline, createOutline,
      folderOpenOutline, timeOutline, statsChartOutline, logOutOutline, alertCircleOutline
    });
  }

  // Ionic caches pages, so this runs every time the page is shown and always
  // loads the CURRENTLY logged-in teacher's data.
  async ionViewWillEnter() {
    this.isLoading = true;
    this.loadError = '';
    this.rows = [];
    this.classesCount = 0;
    this.unitsCount = 0;
    this.gradedCount = 0;
    this.teacherName = 'Instructor';
    this.cdr.detectChanges();

    const user = await this.waitForUser();
    if (!user) {
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }
    this.uid = user.uid;

    try {
      await this.loadDashboard(user);
    } catch (err) {
      console.error('Error loading teacher dashboard:', err);
      this.loadError = 'Failed to load your teaching assignments. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
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

  private norm(s: any): string {
    return String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  // ---------- Teacher profile ----------
  private async loadTeacherProfile(user: User): Promise<any | null> {
    // 1. teachers/{uid}
    try {
      const snap = await getDoc(doc(this.firestore, 'teachers', user.uid));
      if (snap.exists()) return snap.data();
    } catch (e) {
      console.warn('teachers/{uid} lookup failed:', e);
    }

    // 2. teachers document saved under another ID: match by email
    if (user.email) {
      try {
        const q = await getDocs(query(collection(this.firestore, 'teachers'), where('email', '==', user.email)));
        if (!q.empty) return q.docs[0].data();
      } catch (e) {
        console.warn('teachers by email lookup failed:', e);
      }
    }

    // 3. users/{uid}
    try {
      const snap = await getDoc(doc(this.firestore, 'users', user.uid));
      if (snap.exists()) return snap.data();
    } catch (e) {}

    return null;
  }

  // Does a timetable entry belong to this teacher? (UID, exact name, or last name + first name)
  private isMyEntry(t: any): boolean {
    if (t.teacherUid && t.teacherUid === this.uid) return true;

    const tName = this.norm(t.teacher || t.teacherName || t.instructor || t.lecturer || t.staffName);
    if (!tName || !this.fullNorm) return false;
    if (tName === this.fullNorm) return true;

    const tokens = this.fullNorm.split(' ');
    const last = tokens[tokens.length - 1];
    const firsts = tokens.slice(0, -1).filter(x => x.length > 2);
    return tName.includes(last) && (firsts.length === 0 || firsts.some(f => tName.includes(f)));
  }

  // ---------- Dashboard ----------
  private async loadDashboard(user: User) {
    const uid = user.uid;

    // 1. Teacher profile and the subjects assigned to them
    const profile: any = await this.loadTeacherProfile(user);

    const fullName =
      profile?.fullName || profile?.name ||
      `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() ||
      user.displayName || 'Instructor';
    this.teacherName = fullName;
    this.fullNorm = this.norm(fullName);

    // teachers.subjects is the source of truth for "assigned units"
    const rawSubjects: any[] = [
      ...(Array.isArray(profile?.subjects) ? profile.subjects : []),
      ...(profile?.subject ? [profile.subject] : [])
    ];
    const assignedSubjects: string[] = [];
    const assignedNorm = new Set<string>();
    rawSubjects.forEach(s => {
      const name = typeof s === 'string' ? s.trim() : String(s?.name || s?.subjectName || '').trim();
      const key = this.norm(name);
      if (name && !assignedNorm.has(key)) {
        assignedNorm.add(key);
        assignedSubjects.push(name);
      }
    });

    // 2. Timetable and subjects collections (shared schedule data)
    const [timetableSnap, subjectsSnap] = await Promise.all([
      getDocs(collection(this.firestore, 'timetable')).catch(() => null),
      getDocs(collection(this.firestore, 'subjects')).catch(() => null)
    ]);

    // subject name -> classes it is offered in
    const subjectClasses = new Map<string, Set<string>>();
    subjectsSnap?.forEach(d => {
      const s: any = d.data();
      const name = this.norm(s.subjectName || s.name || s.title);
      const cls = String(s.className || s.class || '').trim();
      if (!name || !cls) return;
      if (!subjectClasses.has(name)) subjectClasses.set(name, new Set());
      subjectClasses.get(name)!.add(cls);
    });

    // 3. Build the assignment rows
    const rowMap = new Map<string, AssignmentRow>();
    const addRow = (className: string, subject: string, schedule: string) => {
      const key = `${this.norm(className)}|${this.norm(subject)}|${this.norm(schedule)}`;
      if (!rowMap.has(key)) rowMap.set(key, { className, subject, schedule });
    };
    const covered = new Set<string>();

    // 3a. Timetable entries that are mine, or for one of my subjects with no teacher named
    timetableSnap?.forEach(d => {
      const t: any = d.data();
      const subject = String(t.subject || t.name || t.title || '').trim();
      if (!subject) return;
      const sKey = this.norm(subject);

      const teacherNamed = !!(t.teacherUid || this.norm(t.teacher || t.teacherName || t.instructor || t.lecturer || t.staffName));
      const mine = this.isMyEntry(t);
      const unownedButMine = !teacherNamed && assignedNorm.has(sKey);
      if (!mine && !unownedButMine) return;

      const className = String(t.className || t.class || '').trim() || 'General';
      const schedule = (t.day || t.time)
        ? `${t.day || 'Day TBA'} (${t.time || 'Time TBA'})`
        : 'Schedule TBA';

      addRow(className, subject, schedule);
      covered.add(sKey);
    });

    // 3b. Assigned subjects with no timetable entry yet: show them with their class(es)
    assignedSubjects.forEach(subject => {
      const sKey = this.norm(subject);
      if (covered.has(sKey)) return;

      const classes = subjectClasses.get(sKey);
      if (classes && classes.size > 0) {
        classes.forEach(cls => addRow(cls, subject, 'Schedule TBA'));
      } else {
        addRow('All classes', subject, 'Schedule TBA');
      }
    });

    const rows = [...rowMap.values()].sort((a, b) =>
      a.className.localeCompare(b.className) || a.subject.localeCompare(b.subject)
    );
    this.rows = rows;

    // 4. Stats
    const classSet = new Set(
      rows.map(r => r.className).filter(c => c !== 'All classes' && c !== 'General')
    );
    const unitSet = new Set(rows.map(r => this.norm(r.subject)));
    assignedNorm.forEach(k => unitSet.add(k));

    this.classesCount = classSet.size;
    this.unitsCount = unitSet.size;

    // 5. Graded records by this teacher (only their own, not the whole collection)
    this.gradedCount = await this.countGradedRecords(uid, fullName);
  }

  private async countGradedRecords(uid: string, fullName: string): Promise<number> {
    const col = collection(this.firestore, 'examResults');
    const queries = [
      query(col, where('gradedBy', '==', uid)),
      query(col, where('teacherName', '==', fullName))
    ];
    const settled = await Promise.allSettled(queries.map(q => getDocs(q)));
    const ids = new Set<string>();
    settled.forEach(res => {
      if (res.status === 'fulfilled') res.value.forEach(d => ids.add(d.id));
      else console.warn('Graded records query failed:', res.reason);
    });
    return ids.size;
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