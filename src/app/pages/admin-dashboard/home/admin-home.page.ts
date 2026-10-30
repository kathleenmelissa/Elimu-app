import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonGrid, IonRow, IonCol, IonCard,
  IonIcon, IonAvatar, IonButtons, IonMenuButton
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  peopleOutline, schoolOutline, personOutline, walletOutline,
  notificationsOutline, ellipseSharp, menuOutline
} from 'ionicons/icons';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonGrid, IonRow, IonCol, IonCard,
    IonIcon, IonAvatar, IonButtons, IonMenuButton
  ],
  template: `
    <ion-content class="dashboard-content">
      <!-- Top Navigation Header with Menu Button & User Profile -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn" color="dark"></ion-menu-button>
          </ion-buttons>
          <h2 class="section-main-title ion-no-margin">School Management Dashboard</h2>
        </div>

        <div class="user-profile-section">
          <ion-icon name="notifications-outline" class="nav-icon"></ion-icon>
          <div class="user-chip">
            <ion-avatar class="avatar-sm">
              <img src="https://ionicframework.com/docs/img/demos/avatar.svg" alt="Admin Avatar" />
            </ion-avatar>
            <div class="brand-text-wrapper">
              <span class="user-display-name">{{ adminName }}</span>
              <span class="user-role-badge">{{ adminRole }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-inner ion-padding">
        <h3 class="welcome-heading">Admin Dashboard</h3>

        <!-- Top Stat Cards -->
        <ion-grid class="ion-no-padding">
          <ion-row>
            <ion-col size="12" size-sm="6" size-xl="3">
              <ion-card class="stat-card">
                <div class="stat-content">
                  <div>
                    <p class="stat-label">Students</p>
                    <h3 class="stat-value">15.00K</h3>
                  </div>
                  <div class="stat-icon-box purple-bg">
                    <ion-icon name="people-outline"></ion-icon>
                  </div>
                </div>
              </ion-card>
            </ion-col>

            <ion-col size="12" size-sm="6" size-xl="3">
              <ion-card class="stat-card">
                <div class="stat-content">
                  <div>
                    <p class="stat-label">Teachers</p>
                    <h3 class="stat-value">2.00K</h3>
                  </div>
                  <div class="stat-icon-box blue-bg">
                    <ion-icon name="school-outline"></ion-icon>
                  </div>
                </div>
              </ion-card>
            </ion-col>

            <ion-col size="12" size-sm="6" size-xl="3">
              <ion-card class="stat-card">
                <div class="stat-content">
                  <div>
                    <p class="stat-label">Parents</p>
                    <h3 class="stat-value">5.6K</h3>
                  </div>
                  <div class="stat-icon-box orange-bg">
                    <ion-icon name="person-outline"></ion-icon>
                  </div>
                </div>
              </ion-card>
            </ion-col>

            <ion-col size="12" size-sm="6" size-xl="3">
              <ion-card class="stat-card">
                <div class="stat-content">
                  <div>
                    <p class="stat-label">Earnings</p>
                    <h3 class="stat-value">$19.3K</h3>
                  </div>
                  <div class="stat-icon-box green-bg">
                    <ion-icon name="wallet-outline"></ion-icon>
                  </div>
                </div>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Secondary Section: Analytics & Ratios (Graphs Included) -->
        <ion-grid class="ion-no-padding ion-margin-top">
          <ion-row>
            <!-- Exam Result Chart Container -->
            <ion-col size="12" size-xl="8">
              <ion-card class="chart-card">
                <div class="card-header-flex">
                  <h4>All Exam Results <span class="card-sub">Students & Teacher</span></h4>
                </div>
                <div class="chart-placeholder">
                  <div class="bar-chart-mock">
                    <div class="bar" style="height: 60%;"></div>
                    <div class="bar" style="height: 40%;"></div>
                    <div class="bar" style="height: 75%;"></div>
                    <div class="bar" style="height: 50%;"></div>
                    <div class="bar" style="height: 90%;"></div>
                    <div class="bar" style="height: 45%;"></div>
                    <div class="bar" style="height: 80%;"></div>
                    <div class="bar" style="height: 65%;"></div>
                  </div>
                  <p class="chart-legend">Live Performance Synchronization Active</p>
                </div>
              </ion-card>
            </ion-col>

            <!-- Students Demographics Ratio -->
            <ion-col size="12" size-xl="4">
              <ion-card class="chart-card text-center">
                <div class="card-header-flex">
                  <h4>Students Ratio</h4>
                </div>
                <div class="donut-box">
                  <div class="donut-circle">
                    <span class="donut-total">15,000</span>
                    <span class="donut-label">Total Students</span>
                  </div>
                </div>
                <div class="donut-legend">
                  <span><ion-icon name="ellipse-sharp" color="primary"></ion-icon> Male (65%)</span>
                  <span><ion-icon name="ellipse-sharp" color="warning"></ion-icon> Female (35%)</span>
                </div>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

      </div>
    </ion-content>
  `,
  styles: [`
    .dashboard-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .section-main-title { font-size: 16px; font-weight: 600; color: #0f172a; } }
    .menu-trigger-btn { --color: #0f172a; }
    .user-profile-section { display: flex; align-items: center; gap: 20px; .nav-icon { font-size: 20px; color: #64748b; cursor: pointer; } }
    
    .user-chip { display: flex; align-items: center; gap: 10px; }
    .avatar-sm { width: 36px; height: 36px; }
    .brand-text-wrapper { display: flex; flex-direction: column; line-height: 1.2; }
    .user-display-name { font-weight: 700; font-size: 13px; color: #0f172a; }
    .user-role-badge { font-size: 10.5px; color: #2563eb; font-weight: 600; text-transform: uppercase; }

    .dashboard-inner { max-width: 1400px; margin: 0 auto; }
    .welcome-heading { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px; margin-top: 4px; }
    
    .stat-card { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin: 6px; padding: 20px; }
    .stat-content { display: flex; justify-content: space-between; align-items: center; }
    .stat-label { font-size: 13px; color: #64748b; margin: 0 0 4px 0; font-weight: 500; }
    .stat-value { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }
    .stat-icon-box { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; ion-icon { font-size: 24px; } }
    .purple-bg { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
    .blue-bg { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
    .orange-bg { background: rgba(249, 115, 22, 0.1); color: #f97316; }
    .green-bg { background: rgba(34, 197, 94, 0.1); color: #22c55e; }

    /* Graph & Chart Styles */
    .chart-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 20px; margin: 6px; height: 320px; display: flex; flex-direction: column; }
    .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; h4 { font-size: 15px; font-weight: 600; color: #0f172a; margin: 0; .card-sub { font-size: 12px; color: #64748b; font-weight: 400; margin-left: 8px; } } }
    .chart-placeholder { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; background: #f8fafc; border-radius: 8px; padding: 16px; }
    .bar-chart-mock { display: flex; align-items: flex-end; gap: 16px; height: 160px; width: 100%; justify-content: center; .bar { width: 24px; background: #6366f1; border-radius: 4px 4px 0 0; opacity: 0.85; &:nth-child(even) { background: #0ea5e9; } } }
    .chart-legend { font-size: 11px; color: #64748b; margin-top: 12px; }
    .donut-box { flex: 1; display: flex; align-items: center; justify-content: center; }
    .donut-circle { width: 130px; height: 130px; border-radius: 50%; border: 8px solid #f1f5f9; border-top-color: #6366f1; border-right-color: #f59e0b; display: flex; flex-direction: column; align-items: center; justify-content: center; .donut-total { font-size: 18px; font-weight: 700; color: #0f172a; } .donut-label { font-size: 10px; color: #64748b; } }
    .donut-legend { display: flex; justify-content: center; gap: 16px; font-size: 12px; color: #334155; ion-icon { font-size: 8px; vertical-align: middle; } }
  `]
})
export class AdminHomePage implements OnInit {
  adminName = 'Loading...';
  adminRole = 'Admin';

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({
      peopleOutline, schoolOutline, personOutline, walletOutline,
      notificationsOutline, ellipseSharp, menuOutline
    });
  }

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      await this.fetchProfile(user.uid, user.email || '', user.displayName);
    } else {
      this.auth.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
          await this.fetchProfile(currentUser.uid, currentUser.email || '', currentUser.displayName);
        } else {
          this.adminName = 'Administrator';
          this.adminRole = 'Admin';
          this.cdr.detectChanges();
        }
      });
    }
  }

  async fetchProfile(uid: string, email: string, displayName: string | null) {
    try {
      const profileRef = doc(this.firestore, 'users', uid);
      const profile = await getDoc(profileRef);

      if (profile.exists()) {
        const data = profile.data();
        const firstName = data['firstName'] || '';
        const lastName = data['lastName'] || '';
        
        this.adminName = data['fullName'] || `${firstName} ${lastName}`.trim() || displayName || email.split('@')[0] || 'Administrator';
        this.adminRole = data['role'] || 'Admin';
      } else {
        this.adminName = displayName || email.split('@')[0] || 'Administrator';
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      this.adminName = displayName || email.split('@')[0] || 'Administrator';
    } finally {
      this.cdr.detectChanges();
    }
  }
}