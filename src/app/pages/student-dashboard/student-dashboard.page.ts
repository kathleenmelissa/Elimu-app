import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonIcon, IonRouterOutlet
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  homeOutline, walletOutline, createOutline, businessOutline,
  bedOutline, calendarOutline, checkboxOutline, bookOutline,
  statsChartOutline, logOutOutline, schoolOutline, documentTextOutline
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-student-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive, RouterOutlet,
    IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonLabel, IonIcon, IonRouterOutlet
  ],
  template: `
    <ion-app>
      <ion-split-pane content-id="student-main-content">
        
        <!-- Student Sidebar Menu -->
        <ion-menu content-id="student-main-content" menuId="student-menu" side="start" class="elimu-menu">
          <ion-header class="sidebar-header">
            <ion-toolbar class="sidebar-toolbar">
              <div class="brand-container">
                <ion-icon name="school-outline" class="brand-icon"></ion-icon>
                <ion-title class="brand-title">Student Portal</ion-title>
              </div>
            </ion-toolbar>
          </ion-header>

          <ion-content class="sidebar-content">
            <ion-list lines="none" class="nav-list">
              <ion-item routerLink="/student/home" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-icon name="home-outline" slot="start"></ion-icon>
                <ion-label>Dashboard</ion-label>
              </ion-item>
              <ion-item routerLink="/student/fees" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-icon name="wallet-outline" slot="start"></ion-icon>
                <ion-label>Fees & Statements</ion-label>
              </ion-item>
              <ion-item routerLink="/student/register-units" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-icon name="create-outline" slot="start"></ion-icon>
                <ion-label>Register Units</ion-label>
              </ion-item>
              <ion-item routerLink="/student/hostel-booking" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-icon name="bed-outline" slot="start"></ion-icon>
                <ion-label>Hostel Booking</ion-label>
              </ion-item>
              <ion-item routerLink="/student/timetable" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-icon name="calendar-outline" slot="start"></ion-icon>
                <ion-label>My Timetable</ion-label>
              </ion-item>
              <ion-item routerLink="/student/attendance" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-icon name="checkbox-outline" slot="start"></ion-icon>
                <ion-label>Attendance</ion-label>
              </ion-item>
              <ion-item routerLink="/student/learning-materials" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-icon name="book-outline" slot="start"></ion-icon>
                <ion-label>Learning Materials</ion-label>
              </ion-item>
              <ion-item routerLink="/student/exam-card" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-icon name="document-text-outline" slot="start"></ion-icon>
                <ion-label>Exam Card</ion-label>
              </ion-item>
              <ion-item routerLink="/student/exam-results" routerDirection="root" routerLinkActive="active-link" class="nav-item">
                <ion-icon name="stats-chart-outline" slot="start"></ion-icon>
                <ion-label>Exam Results</ion-label>
              </ion-item>
              <ion-item button (click)="logout()" class="nav-item logout-item">
                <ion-icon name="log-out-outline" slot="start" color="danger"></ion-icon>
                <ion-label color="danger">Log Out</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-menu>

        <!-- Dynamic Child Page Outlet -->
        <ion-router-outlet id="student-main-content"></ion-router-outlet>

      </ion-split-pane>
    </ion-app>
  `,
  styles: [`
    .elimu-menu { --width: 260px; }
    .sidebar-header { border-bottom: 1px solid rgba(0,0,0,0.06); }
    .sidebar-toolbar { --background: #f1f5f9; padding-top: 6px; padding-bottom: 6px; }
    .brand-container { display: flex; align-items: center; gap: 10px; padding-left: 4px; }
    .brand-icon { font-size: 22px; color: #4f46e5; }
    .brand-title { font-size: 16px; font-weight: 700; color: #0f172a; }
    .sidebar-content { --background: #f8fafc; }
    .nav-list { background: transparent; padding: 10px 0; }
    .nav-item {
      --background: transparent;
      --background-hover: rgba(79, 70, 229, 0.06);
      --color: #334155;
      font-weight: 500;
      font-size: 13.5px;
      margin-bottom: 4px;
      --padding-start: 16px;
      ion-icon { font-size: 18px; color: #64748b; margin-right: 4px; }
    }
    .active-link {
      --background: #4f46e5 !important;
      --color: #ffffff !important;
      font-weight: 600;
      border-left: 4px solid #312e81;
      ion-icon { color: #ffffff !important; }
    }
    .logout-item { margin-top: 16px; }
  `]
})
export class StudentDashboardLayoutPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({
      homeOutline, walletOutline, createOutline, businessOutline,
      bedOutline, calendarOutline, checkboxOutline, bookOutline,
      statsChartOutline, logOutOutline, schoolOutline, documentTextOutline
    });
  }

  async logout() {
    if (this.authService && typeof this.authService.logout === 'function') {
      await this.authService.logout();
    }
    this.router.navigate(['/login']);
  }
}