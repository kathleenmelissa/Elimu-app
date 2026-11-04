import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
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
import { Firestore, doc, getDoc, getDocs, collection, setDoc, serverTimestamp } from '@angular/fire/firestore';

interface StudentGradeRow {
  studentUid: string;
  admissionNumber: string;
  studentName: string;
  cat1: number | null;
  cat2: number | null;
  endSem: number | null;
  finalScore: number | string;
  grade: string;
  remarks: string;
}

@Component({
  selector: 'app-teacher-marks',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, RouterLinkActive,
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
              <ion-menu-button menu="teacher-menu" class="menu-btn" (click)="toggleMenu()"></ion-menu-button>
            </ion-buttons>
            <ion-title>Student Assessment & Grading</ion-title>
          </ion-toolbar>
        </ion-header>

        <div class="content-body">
          <div class="card">
            <div class="card-title">Select Class and Unit to Grade</div>
            
            <div class="filter-row">
              <div class="form-group">
                <label for="classSelect">Class / Grade</label>
                <select id="classSelect" [(ngModel)]="selectedClass">
                  <option value="">-- Choose Class --</option>
                  <option *ngFor="let cls of availableClasses" [value]="cls">{{ cls }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="subjectSelect">Subject / Unit</label>
                <select id="subjectSelect" [(ngModel)]="selectedSubject">
                  <option value="">-- Choose Unit --</option>
                  <option *ngFor="let sub of availableSubjects" [value]="sub">{{ sub }}</option>
                </select>
              </div>
              <button class="btn-primary" (click)="onLoadRosterClick()">Load Student List</button>
            </div>
          </div>

          <!-- Grading Table Card -->
          <div class="card" *ngIf="isGradingCardVisible">
            <div class="card-title">
              Grading Sheet: <span style="color: var(--primary);">{{ activeClassUnitDisplay }}</span>
            </div>

            <form (submit)="saveAllMarks($event)">
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Adm No.</th>
                      <th>Student Name</th>
                      <th>CAT 1 (30%)</th>
                      <th>CAT 2 (30%)</th>
                      <th>End Sem Exam (70%)</th>
                      <th>Final Score (%)</th>
                      <th>Grade</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngIf="isLoadingRoster">
                      <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                        <ion-spinner name="crescent" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 6px;"></ion-spinner>
                        Loading student roster and existing scores...
                      </td>
                    </tr>
                    <tr *ngIf="!isLoadingRoster && gradingRows.length === 0">
                      <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                        No students registered in {{ selectedClass }}.
                      </td>
                    </tr>
                    <ng-container *ngIf="!isLoadingRoster">
                      <tr *ngFor="let row of gradingRows">
                        <td><strong>{{ row.admissionNumber }}</strong></td>
                        <td>{{ row.studentName }}</td>
                        <td>
                          <input type="number" min="0" max="30" class="score-input" [(ngModel)]="row.cat1" (input)="recalculateRow(row)" [name]="'cat1_' + row.studentUid" placeholder="0-30">
                        </td>
                        <td>
                          <input type="number" min="0" max="30" class="score-input" [(ngModel)]="row.cat2" (input)="recalculateRow(row)" [name]="'cat2_' + row.studentUid" placeholder="0-30">
                        </td>
                        <td>
                          <input type="number" min="0" max="70" class="score-input" [(ngModel)]="row.endSem" (input)="recalculateRow(row)" [name]="'endSem_' + row.studentUid" placeholder="0-70">
                        </td>
                        <td class="center-text">{{ row.finalScore }}</td>
                        <td class="center-text">{{ row.grade }}</td>
                        <td class="center-text">{{ row.remarks }}</td>
                      </tr>
                    </ng-container>
                  </tbody>
                </table>
              </div>

              <button type="submit" class="btn-primary" [disabled]="isSaving" style="margin-top: 1.5rem; width: 100%;">
                <ion-spinner name="crescent" *ngIf="isSaving" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;"></ion-spinner>
                {{ isSaving ? 'Saving Grades to Database...' : 'Save All Exam Results' }}
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
    .brand-title { font-size: 16px; font-weight: 700; color: #0f172a; padding: 0; min-height: unset; }
    .sidebar-content { --background: #e0e2e6; }
    .nav-list { background: transparent; padding: 8px 0; }
    .nav-item { --background: transparent; --background-hover: rgba(23, 9, 224, 0.05); --color: #1c5bda; font-weight: 500; font-size: 14px; margin-bottom: 2px; --padding-start: 12px; }
    .active-link { --background: #1366eb !important; --color: #ffffff !important; font-weight: 600; border-left: 4px solid #3880ff; }
    .logout-item { margin-top: 12px; }

    .header-gradient-toolbar { --background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%); --color: #ffffff; }
    .menu-btn { color: #ffffff; }
    .main-content-wrapper { --background: #f8fafc; }
    
    .content-body { padding: 2rem; max-width: 1300px; width: 100%; margin: 0 auto; box-sizing: border-box; }
    .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }
    .card-title { font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 1rem; }

    .filter-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: flex-end; margin-bottom: 1.5rem; }
    @media(max-width: 768px) { .filter-row { grid-template-columns: 1fr; } }

    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-size: 0.85rem; font-weight: 600; color: #1e293b; }
    select, input { padding: 0.65rem; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 0.9rem; background: #FFF; color: #1e293b; }

    .btn-primary { background-color: #2563EB; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: background 0.2s; height: 40px; display: inline-flex; align-items: center; justify-content: center; }
    .btn-primary:hover { background-color: #1D4ED8; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

    .table-container { width: 100%; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; margin-top: 1rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    th { background-color: #F8FAFC; color: #64748b; font-weight: 600; padding: 0.85rem 1rem; border-bottom: 1px solid #e2e8f0; text-align: center; }
    th:nth-child(1), th:nth-child(2) { text-align: left; }
    td { padding: 0.85rem 1rem; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    td:nth-child(1), td:nth-child(2) { text-align: left; }
    .center-text { text-align: center; }

    input.score-input { width: 85px; padding: 0.4rem; text-align: center; border-radius: 6px; border: 1px solid #cbd5e1; }
  `]
})
export class TeacherMarksPage implements OnInit {
  availableClasses: string[] = [];
  availableSubjects: string[] = [];
  selectedClass = '';
  selectedSubject = '';
  
  isGradingCardVisible = false;
  isLoadingRoster = false;
  isSaving = false;
  activeClassUnitDisplay = '';
  gradingRows: StudentGradeRow[] = [];

  teacherFullName = 'Instructor';
  teacherUid = '';

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
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
    this.teacherUid = user.uid;

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

      await this.loadAllClassesAndSubjects();

      this.route.queryParams.subscribe(params => {
        if (params['class'] && params['subject']) {
          this.selectedClass = params['class'];
          this.selectedSubject = params['subject'];
          this.loadGradingRoster(this.selectedClass, this.selectedSubject);
        }
      });

    } catch (err) {
      console.error("Error loading teacher profile:", err);
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

  async loadAllClassesAndSubjects() {
    try {
      const classesSet = new Set<string>();
      const subjectsSet = new Set<string>();

      try {
        const classesSnap = await getDocs(collection(this.firestore, "classes"));
        classesSnap.forEach(d => {
          const data: any = d.data();
          const cls = data.className || data.name || data.title;
          if (cls) classesSet.add(cls);
        });
      } catch (e) {}

      try {
        const subjectsSnap = await getDocs(collection(this.firestore, "subjects"));
        subjectsSnap.forEach(d => {
          const data: any = d.data();
          const sub = data.subjectName || data.name || data.title;
          if (sub) subjectsSet.add(sub);
        });
      } catch (e) {}

      if (classesSet.size === 0) {
        const studentsSnap = await getDocs(collection(this.firestore, "students"));
        studentsSnap.forEach(d => {
          const s: any = d.data();
          const cls = s.className || s.grade || s.class;
          if (cls) classesSet.add(cls);
        });
      }

      try {
        const timetableSnap = await getDocs(collection(this.firestore, "timetable"));
        timetableSnap.forEach(d => {
          const t: any = d.data();
          const cls = t.className || t.class;
          const sub = t.subject || t.name;
          if (cls) classesSet.add(cls);
          if (sub) subjectsSet.add(sub);
        });
      } catch (e) {}

      this.availableClasses = Array.from(classesSet);
      this.availableSubjects = Array.from(subjectsSet);
    } catch (err) {
      console.error("Error loading dropdown options:", err);
    }
  }

  onLoadRosterClick() {
    if (!this.selectedClass || !this.selectedSubject) {
      alert("Please select both a class and a subject unit.");
      return;
    }
    this.loadGradingRoster(this.selectedClass, this.selectedSubject);
  }

  async loadGradingRoster(className: string, subjectName: string) {
    this.isGradingCardVisible = true;
    this.isLoadingRoster = true;
    this.activeClassUnitDisplay = `${className} — ${subjectName}`;
    this.gradingRows = [];
    this.cdr.detectChanges();

    try {
      const studentsSnap = await getDocs(collection(this.firestore, "students"));
      const students: any[] = [];
      studentsSnap.forEach(d => {
        const s: any = d.data();
        const sClass = (s.className || s.grade || s.class || "").trim();
        if (sClass.toLowerCase() === className.toLowerCase()) {
          students.push({ id: d.id, ...s });
        }
      });

      const existingScores: { [key: string]: any } = {};
      const resultsSnap = await getDocs(collection(this.firestore, "examResults"));
      resultsSnap.forEach(d => {
        const r: any = d.data();
        if ((r.subject || r.unitName) === subjectName && (r.className || r.class) === className) {
          existingScores[r.studentUid || r.studentId] = r;
        }
      });

      const rows: StudentGradeRow[] = [];
      students.forEach(student => {
        const admNo = student.admissionNumber || student.admissionNo || student.admNo || student.admission || student.adm || student.regNumber || student.regNo || student.studentId || "N/A";
        const studentName = student.fullName || student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || "Student";
        const existingRecord = existingScores[student.id] || {};

        const cat1Val = existingRecord.cat1 !== undefined && existingRecord.cat1 !== null ? Number(existingRecord.cat1) : null;
        const cat2Val = existingRecord.cat2 !== undefined && existingRecord.cat2 !== null ? Number(existingRecord.cat2) : null;
        const endSemVal = existingRecord.endSem !== undefined && existingRecord.endSem !== null ? Number(existingRecord.endSem) : (existingRecord.score !== undefined ? Number(existingRecord.score) : null);

        const row: StudentGradeRow = {
          studentUid: student.id,
          admissionNumber: admNo,
          studentName: studentName,
          cat1: cat1Val,
          cat2: cat2Val,
          endSem: endSemVal,
          finalScore: existingRecord.score !== undefined ? existingRecord.score : '-',
          grade: existingRecord.grade || '-',
          remarks: existingRecord.remarks || '-'
        };

        this.recalculateRow(row);
        rows.push(row);
      });

      this.gradingRows = rows;
    } catch (err) {
      console.error("Error loading grading roster:", err);
    } finally {
      this.isLoadingRoster = false;
      this.cdr.detectChanges();
    }
  }

  recalculateRow(row: StudentGradeRow) {
    if (row.cat1 === null && row.cat2 === null && row.endSem === null) {
      row.finalScore = '-';
      row.grade = '-';
      row.remarks = '-';
      return;
    }

    const c1 = Number(row.cat1) || 0;
    const c2 = Number(row.cat2) || 0;
    const end = Number(row.endSem) || 0;

    const totalScore = Math.min(100, Math.round(((c1 + c2) / 60) * 30 + end));

    row.finalScore = totalScore;
    row.grade = this.calculateGrade(totalScore);
    row.remarks = this.calculateRemark(totalScore);
  }

  calculateGrade(score: number): string {
    if (score >= 70) return "A";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 40) return "D";
    return "E";
  }

  calculateRemark(score: number): string {
    if (score >= 70) return "Excellent performance";
    if (score >= 60) return "Good work, keep it up";
    if (score >= 50) return "Satisfactory";
    if (score >= 40) return "Needs improvement";
    return "Fail / Retake required";
  }

  async saveAllMarks(e: Event) {
    e.preventDefault();
    if (this.gradingRows.length === 0) return;

    this.isSaving = true;
    this.cdr.detectChanges();

    try {
      let savedCount = 0;

      for (const row of this.gradingRows) {
        if (row.cat1 === null && row.cat2 === null && row.endSem === null) continue;

        const resultId = `${row.studentUid}_${this.selectedSubject.replace(/\s+/g, '_')}`;
        const resultRef = doc(this.firestore, "examResults", resultId);

        await setDoc(resultRef, {
          studentUid: row.studentUid,
          admissionNumber: row.admissionNumber,
          studentName: row.studentName,
          className: this.selectedClass,
          subject: this.selectedSubject,
          cat1: row.cat1 !== null ? Number(row.cat1) : null,
          cat2: row.cat2 !== null ? Number(row.cat2) : null,
          endSem: row.endSem !== null ? Number(row.endSem) : null,
          score: typeof row.finalScore === 'number' ? row.finalScore : Number(row.finalScore) || 0,
          grade: row.grade,
          remarks: row.remarks,
          gradedBy: this.teacherUid,
          teacherName: this.teacherFullName,
          updatedAt: serverTimestamp()
        }, { merge: true });

        savedCount++;
      }

      alert(`Successfully saved assessment records for ${savedCount} student(s)!`);
      await this.loadGradingRoster(this.selectedClass, this.selectedSubject);
    } catch (err: any) {
      console.error("Error saving assessment results:", err);
      alert(`Error saving marks: ${err.message}`);
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