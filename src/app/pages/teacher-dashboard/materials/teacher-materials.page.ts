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
import { Firestore, doc, getDoc, collection, addDoc, getDocs, deleteDoc, serverTimestamp } from '@angular/fire/firestore';

interface StudyMaterial {
  id: string;
  title: string;
  className: string;
  subject: string;
  description: string;
  fileUrl: string;
  uploadedByUid: string;
}

@Component({
  selector: 'app-teacher-materials',
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
            <ion-title>Learning Materials & Resource Uploads</ion-title>
          </ion-toolbar>
        </ion-header>

        <div class="content-body">
          <div class="card">
            <div class="card-title">Upload New Study Material or Assignment</div>
            <form (submit)="publishMaterial($event)">
              <div class="form-grid">
                <div class="form-group">
                  <label for="classSelect">Target Class / Grade</label>
                  <select id="classSelect" [(ngModel)]="newMaterial.className" name="className" required>
                    <option value="">-- Choose Class --</option>
                    <option *ngFor="let cls of availableClasses" [value]="cls">{{ cls }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="subjectSelect">Subject / Unit</label>
                  <select id="subjectSelect" [(ngModel)]="newMaterial.subject" name="subject" required>
                    <option value="">-- Choose Unit --</option>
                    <option *ngFor="let sub of availableSubjects" [value]="sub">{{ sub }}</option>
                  </select>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label for="materialTitle">Material Title / Topic</label>
                  <input type="text" id="materialTitle" [(ngModel)]="newMaterial.title" name="title" placeholder="e.g. Lecture 3: Database Normalization Notes" required>
                </div>
                <div class="form-group">
                  <label for="materialLink">Resource Link (Google Drive, PDF URL, etc.)</label>
                  <input type="url" id="materialLink" [(ngModel)]="newMaterial.fileUrl" name="fileUrl" placeholder="https://example.com/notes.pdf" required>
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 1.25rem;">
                <label for="materialDescription">Description / Instructions</label>
                <textarea id="materialDescription" [(ngModel)]="newMaterial.description" name="description" placeholder="Provide brief instructions or summary for the students..."></textarea>
              </div>

              <button type="submit" class="btn-primary" [disabled]="isPublishing">
                <ion-spinner name="crescent" *ngIf="isPublishing" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;"></ion-spinner>
                {{ isPublishing ? 'Publishing Material...' : 'Publish Material to Students' }}
              </button>
            </form>
          </div>

          <div class="card">
            <div class="card-title">Previously Uploaded Materials</div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Class & Unit</th>
                    <th>Description</th>
                    <th>Link / File</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="isLoadingMaterials">
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                      <ion-spinner name="crescent" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 6px;"></ion-spinner>
                      Loading uploaded materials...
                    </td>
                  </tr>
                  <tr *ngIf="!isLoadingMaterials && uploadedMaterials.length === 0">
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No learning materials published yet.</td>
                  </tr>
                  <ng-container *ngIf="!isLoadingMaterials">
                    <tr *ngFor="let mat of uploadedMaterials">
                      <td><strong>{{ mat.title }}</strong></td>
                      <td>{{ mat.className }} <br><span style="font-size: 0.75rem; color: #64748b;">{{ mat.subject }}</span></td>
                      <td>{{ mat.description || 'No description' }}</td>
                      <td><a [href]="mat.fileUrl" target="_blank" style="color: #2563EB; font-weight: 500;">Open Link</a></td>
                      <td><button class="btn-primary btn-danger" (click)="deleteMaterial(mat.id)">Delete</button></td>
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
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
    @media(max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-size: 0.85rem; font-weight: 600; color: #1e293b; }
    select, input, textarea { padding: 0.65rem; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 0.9rem; background: #FFF; color: #1e293b; }
    textarea { resize: vertical; min-height: 80px; }
    .btn-primary { background-color: #2563EB; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: background 0.2s; display: inline-flex; align-items: center; justify-content: center; }
    .btn-primary:hover { background-color: #1D4ED8; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-danger { background-color: #DC2626; padding: 0.4rem 0.8rem; font-size: 0.8rem; }
    .btn-danger:hover { background-color: #B91C1C; }
    .table-container { width: 100%; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; margin-top: 1rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    th { background-color: #F8FAFC; color: #64748b; font-weight: 600; padding: 0.85rem 1rem; border-bottom: 1px solid #e2e8f0; }
    td { padding: 0.85rem 1rem; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    tr:last-child td { border-bottom: none; }
  `]
})
export class TeacherMaterialsPage implements OnInit {
  availableClasses: string[] = [];
  availableSubjects: string[] = [];
  uploadedMaterials: StudyMaterial[] = [];
  isLoadingMaterials = true;
  isPublishing = false;
  newMaterial = { className: '', subject: '', title: '', fileUrl: '', description: '' };
  teacherFullName = 'Instructor';
  teacherUid = '';

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
      await this.loadTeacherFilterOptions(this.teacherFullName, user.uid);
      await this.loadUploadedMaterials(user.uid);
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

  async loadTeacherFilterOptions(name: string, uid: string) {
    try {
      const timetableSnap = await getDocs(collection(this.firestore, "timetable"));
      const classesSet = new Set<string>();
      const subjectsSet = new Set<string>();
      timetableSnap.forEach(d => {
        const t: any = d.data();
        const tName = (t.teacher || t.teacherName || t.instructor || "").trim();
        if (tName.toLowerCase() === name.toLowerCase() || t.teacherUid === uid) {
          if (t.className || t.class) classesSet.add(t.className || t.class);
          if (t.subject || t.name) subjectsSet.add(t.subject || t.name);
        }
      });
      this.availableClasses = Array.from(classesSet);
      this.availableSubjects = Array.from(subjectsSet);
    } catch (err) {
      console.error("Error loading filters:", err);
    }
  }

  async publishMaterial(e: Event) {
    e.preventDefault();
    if (!this.newMaterial.className || !this.newMaterial.subject || !this.newMaterial.title || !this.newMaterial.fileUrl) {
      alert("Please fill in all required fields.");
      return;
    }
    this.isPublishing = true;
    this.cdr.detectChanges();
    try {
      await addDoc(collection(this.firestore, "materials"), {
        className: this.newMaterial.className,
        subject: this.newMaterial.subject,
        title: this.newMaterial.title,
        fileUrl: this.newMaterial.fileUrl,
        description: this.newMaterial.description,
        uploadedByUid: this.teacherUid,
        uploadedByName: this.teacherFullName,
        createdAt: serverTimestamp()
      });
      alert("Study material published successfully!");
      this.newMaterial = { className: '', subject: '', title: '', fileUrl: '', description: '' };
      await this.loadUploadedMaterials(this.teacherUid);
    } catch (err: any) {
      console.error("Error uploading material:", err);
      alert(`Error: ${err.message}`);
    } finally {
      this.isPublishing = false;
      this.cdr.detectChanges();
    }
  }

  async loadUploadedMaterials(uid: string) {
    this.isLoadingMaterials = true;
    this.uploadedMaterials = [];
    this.cdr.detectChanges();
    try {
      const snapshot = await getDocs(collection(this.firestore, "materials"));
      const materials: StudyMaterial[] = [];
      snapshot.forEach(docSnap => {
        const mat: any = docSnap.data();
        if (mat.uploadedByUid && mat.uploadedByUid !== uid) return;
        materials.push({
          id: docSnap.id,
          title: mat.title || 'Untitled',
          className: mat.className || 'General',
          subject: mat.subject || 'General Unit',
          description: mat.description || '',
          fileUrl: mat.fileUrl || '#',
          uploadedByUid: mat.uploadedByUid
        });
      });
      this.uploadedMaterials = materials;
    } catch (err) {
      console.error("Error loading materials:", err);
    } finally {
      this.isLoadingMaterials = false;
      this.cdr.detectChanges();
    }
  }

  async deleteMaterial(id: string) {
    if (confirm("Are you sure you want to delete this material?")) {
      try {
        await deleteDoc(doc(this.firestore, "materials", id));
        await this.loadUploadedMaterials(this.teacherUid);
      } catch (err) {
        console.error("Error deleting material:", err);
      }
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