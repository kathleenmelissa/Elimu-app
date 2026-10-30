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
  calendarOutline, timeOutline, locationOutline, alertCircleOutline
} from 'ionicons/icons';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc, collection, getDocs } from '@angular/fire/firestore';

interface TimetableItem {
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

@Component({
  selector: 'app-timetable',
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
        <ion-title>My Class Timetable</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="mobile-dashboard-content">
      <div class="dashboard-body">

        <!-- Header Info Card -->
        <div class="welcome-banner">
          <div>
            <h2>{{ tableCardTitle }}</h2>
            <p>View your weekly lecture schedule based on your registered units and class.</p>
          </div>
          <div class="user-badge">{{ studentBadgeText }}</div>
        </div>

        <!-- Timetable Card -->
        <div class="card">
          <div class="card-header-row">
            <div class="card-title">Weekly Schedule Overview</div>
            
            <!-- Day Filter Tabs -->
            <div class="day-tabs">
              <button *ngFor="let day of daysList" 
                      class="day-tab" 
                      [class.active]="currentDayFilter === day"
                      (click)="filterDay(day)">
                {{ day === 'All' ? 'All Days' : day.substring(0, 3) }}
              </button>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time Slot</th>
                  <th>Subject / Unit</th>
                  <th>Lecturer</th>
                  <th>Venue / Room</th>
                </tr>
              </thead>
              <tbody>
                <!-- Loading State -->
                <tr *ngIf="isLoading">
                  <td colspan="5" class="empty-state">
                    <ion-spinner name="crescent" color="primary"></ion-spinner>
                    <p style="margin-top: 8px;">Loading timetable schedule...</p>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr *ngIf="!isLoading && filteredTimetable.length === 0">
                  <td colspan="5" class="empty-state">
                    <ion-icon name="alert-circle-outline" style="font-size: 24px; color: #94a3b8;"></ion-icon>
                    <p>No scheduled classes found for this selection.</p>
                  </td>
                </tr>

                <!-- Timetable Rows -->
                <tr *ngFor="let item of filteredTimetable">
                  <td><strong>{{ item.day }}</strong></td>
                  <td><span class="time-badge">{{ item.time }}</span></td>
                  <td><strong>{{ item.subject }}</strong></td>
                  <td>{{ item.teacher }}</td>
                  <td><span class="room-badge">{{ item.room }}</span></td>
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
    .dashboard-body { padding: 20px; max-width: 1000px; margin: 0 auto; }

    .welcome-banner { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; } p { font-size: 13px; color: #64748b; margin: 0; } }
    .user-badge { background: #e0e7ff; color: #4f46e5; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 20px; }

    .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }
    .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 10px; }
    .card-title { font-size: 16px; font-weight: 700; color: #0f172a; }

    .day-tabs { display: flex; gap: 6px; background: #f1f5f9; padding: 4px; border-radius: 8px; }
    .day-tab { background: transparent; border: none; padding: 6px 12px; font-size: 12px; font-weight: 600; color: #64748b; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
    .day-tab.active { background: #ffffff; color: #4f46e5; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

    .table-container { width: 100%; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th { background-color: #f8fafc; color: #64748b; font-weight: 600; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; }
    td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    tr:last-child td { border-bottom: none; }

    .empty-state { text-align: center; color: #64748b; padding: 2.5rem !important; }
    .time-badge { background: #f1f5f9; color: #334155; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; }
    .room-badge { background: #f0fdf4; color: #16a34a; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; }
  `]
})
export class TimetablePage implements OnInit {
  isLoading: boolean = true;
  studentBadgeText: string = 'Loading...';
  tableCardTitle: string = 'Weekly Schedule Overview';
  
  daysList: string[] = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  currentDayFilter: string = 'All';
  
  fullTimetableData: TimetableItem[] = [];
  filteredTimetable: TimetableItem[] = [];

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({ calendarOutline, timeOutline, locationOutline, alertCircleOutline });
  }

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      await this.loadTimetable(user.uid);
    });
  }

  async loadTimetable(uid: string) {
    this.isLoading = true;
    try {
      // 1. Fetch Student Profile
      const studentSnap = await getDoc(doc(this.firestore, "students", uid));
      const studentData = studentSnap.exists() ? studentSnap.data() : {};
      const studentClass = (studentData['className'] || studentData['grade'] || "Form 1").trim().toLowerCase();
      const studentName = studentData['fullName'] || studentData['name'] || "Student";

      this.studentBadgeText = `${studentName} (${studentData['className'] || studentData['grade'] || 'Form 1'})`;

      // 2. Fetch Student's Registered Subjects
      let rawList: any[] = [];
      try {
        const regSnap = await getDoc(doc(this.firestore, "studentSubjects", uid));
        if (regSnap.exists()) {
          rawList = regSnap.data()['selectedSubjects'] || regSnap.data()['subjects'] || [];
        } else if (studentData['subjects']) {
          rawList = studentData['subjects'];
        }
      } catch (e) {}

      const registeredSubjects = new Set(rawList.map((s: any) => (typeof s === 'string' ? s : s.name).trim().toLowerCase()));

      // 3. Fetch Teachers for name mapping lookup
      const subjectTeacherMap: { [key: string]: string } = {};
      try {
        const teachersSnapshot = await getDocs(collection(this.firestore, "teachers"));
        teachersSnapshot.forEach(docSnap => {
          const teacher: any = docSnap.data();
          const teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.name || "Assigned Lecturer";
          if (Array.isArray(teacher.subjects)) {
            teacher.subjects.forEach((subject: any) => {
              if (typeof subject === 'string') {
                subjectTeacherMap[subject.trim().toLowerCase()] = teacherName;
              }
            });
          }
        });
      } catch (err) {}

      // 4. Fetch Master Timetable Collection
      const timetableSnap = await getDocs(collection(this.firestore, "timetable"));
      const tempTimetable: TimetableItem[] = [];

      timetableSnap.forEach(tDoc => {
        const t: any = tDoc.data();
        const tClass = (t.className || t.class || "").trim().toLowerCase();
        const tSubject = (t.subject || t.title || "").trim();
        const subKey = tSubject.toLowerCase();

        const matchesClass = tClass === studentClass || tClass === "";
        const matchesRegisteredSubject = registeredSubjects.size === 0 || registeredSubjects.has(subKey);

        if (matchesClass && matchesRegisteredSubject && tSubject) {
          const lecturer = t.teacher || subjectTeacherMap[subKey] || "Not Assigned";
          tempTimetable.push({
            day: t.day || "Monday",
            time: t.time || t.timeSlot || "08:00 AM - 10:00 AM",
            subject: tSubject,
            teacher: lecturer,
            room: t.room || t.venue || "Main Hall"
          });
        }
      });

      // Sort schedule logically by days of the week
      const dayOrder: { [key: string]: number } = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };
      tempTimetable.sort((a, b) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99));

      this.fullTimetableData = tempTimetable;
      this.filterDay('All');

    } catch (err) {
      console.error("Error loading timetable:", err);
    } finally {
      this.isLoading = false;
    }
  }

  filterDay(day: string) {
    this.currentDayFilter = day;
    this.tableCardTitle = day === 'All' ? 'Weekly Schedule Overview' : `${day}'s Schedule`;

    if (day === 'All') {
      this.filteredTimetable = this.fullTimetableData;
    } else {
      this.filteredTimetable = this.fullTimetableData.filter(item => item.day.toLowerCase() === day.toLowerCase());
    }
  }
}