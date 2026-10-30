// src/app/pages/admin-dashboard/admin-dashboard.page.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonIcon, IonRouterOutlet
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { schoolOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive, RouterOutlet,
    IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonLabel, IonIcon, IonRouterOutlet
  ],
  template: `
    <ion-app>
      <ion-split-pane content-id="main-content">
        
        <!-- Toggleable Sidebar Menu  -->
        <ion-menu content-id="main-content" menuId="main-menu" side="start" class="elimu-menu">
          <ion-header class="sidebar-header">
            <ion-toolbar class="sidebar-toolbar">
              <div class="brand-container">
                <ion-icon name="school-outline" class="brand-icon"></ion-icon>
                <ion-title class="brand-title">Elimu Admin</ion-title>
              </div>
            </ion-toolbar>
          </ion-header>

          <ion-content class="sidebar-content">
            <ion-list lines="none" class="nav-list">
              <ion-item routerLink="/admin/home" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Dashboard</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/students" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Students</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/teachers" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Teachers</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/accountants" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Accountants</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/vc" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>VC</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/parents" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Parents</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/classes" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Classes & Subjects</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/device-ip" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Device IP Registration</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/hostel" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Hostel & Dorms</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/attendance" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Attendance</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/exams" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Exams & Results</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/fees" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Fee Management</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/timetable" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Timetable</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/announcements" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Announcements</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/learning-materials" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>Learning Materials</ion-label>
              </ion-item>
              <ion-item routerLink="/admin/settings" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-label>School Settings</ion-label>
              </ion-item>
              <ion-item button (click)="logout()" class="nav-item logout-item">
                <ion-label color="danger">Log Out</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-menu>

        <!-- Main Content Outlet -->
        <ion-router-outlet id="main-content"></ion-router-outlet>

      </ion-split-pane>
    </ion-app>
  `,
  styles: [`
    .elimu-menu { --width: 260px; }
    .sidebar-header { border-bottom: 1px solid rgba(15, 28, 207, 0.08); }
    .sidebar-toolbar { --background: #e0e5ec; --color: #0f3cd1; padding: 10px 12px; }
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
      --padding-start: 18px;
    }
    .active-link {
      --background: #1366eb !important;
      --color: #ffffff !important;
      font-weight: 600;
      border-left: 4px solid #3880ff;
    }
    .logout-item { margin-top: 12px; }
  `]
})
export class AdminDashboardPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({ schoolOutline });
  }

  async logout() {
    if (this.authService && typeof this.authService.logout === 'function') {
      await this.authService.logout();
    }
    this.router.navigate(['/login']);
  }
}