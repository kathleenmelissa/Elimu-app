import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, collection, getDocs, query, orderBy } from '@angular/fire/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  IonContent,
  IonIcon,
  IonButtons,
  IonMenuButton
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  searchOutline, notificationsOutline, walletOutline, createOutline,
  businessOutline, bedOutline, calendarOutline, checkboxOutline,
  documentTextOutline, bookOutline, statsChartOutline, logOutOutline,
  schoolOutline, megaphoneOutline, timeOutline
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

interface Announcement {
  id: string;
  title: string;
  message: string;
  date?: string;
  priority?: string;
  audience?: string;
}

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonIcon,
    IonButtons,
    IonMenuButton
  ],
  template: `
    <ion-content class="mobile-dashboard-content">
      
      <!-- Gradient Header Section -->
      <div class="header-gradient-bg">
        <div class="header-top-row">
          <ion-buttons>
            <ion-menu-button menu="student-menu" class="menu-btn"></ion-menu-button>
          </ion-buttons>
          <h1 class="portal-title">Student Portal</h1>
          <div class="header-right-icons">
            <div class="notification-badge-wrapper">
              <ion-icon name="notifications-outline" class="top-icon"></ion-icon>
              <span class="badge-dot">3</span>
            </div>
          </div>
        </div>

        <!-- Dynamic Welcome Block -->
        <div class="welcome-text-block">
          <h2>Hello, {{ studentName }} <span>👋</span></h2>
          <p>Have a great day ahead!</p>
        </div>

        <!-- Search Bar -->
        <div class="search-bar-container">
          <ion-icon name="search-outline" class="search-icon"></ion-icon>
          <input type="text" placeholder="Search anything..." class="search-input" />
        </div>
      </div>

      <!-- Scrollable Body Content -->
      <div class="dashboard-body">
        
        <!-- Quick Access Section -->
        <div class="section-header-row">
          <h3 class="section-title">Quick Access</h3>
        </div>

        <div class="quick-access-grid">
          <div class="qa-card purple-tint" routerLink="/student/fees">
            <div class="qa-icon-box purple"><ion-icon name="wallet-outline"></ion-icon></div>
            <div class="qa-info">
              <h4>Fees</h4>
              <p>Balances & statements</p>
            </div>
          </div>

          <div class="qa-card orange-tint" routerLink="/student/register-units">
            <div class="qa-icon-box orange"><ion-icon name="create-outline"></ion-icon></div>
            <div class="qa-info">
              <h4>Register Units</h4>
              <p>Select semester units</p>
            </div>
          </div>

          <div class="qa-card blue-tint" routerLink="/student/supplementary-registration">
            <div class="qa-icon-box blue"><ion-icon name="business-outline"></ion-icon></div>
            <div class="qa-info">
              <h4>Supplementary</h4>
              <p>Retake registration</p>
            </div>
          </div>

          <div class="qa-card mint-tint" routerLink="/student/hostel-booking">
            <div class="qa-icon-box mint"><ion-icon name="bed-outline"></ion-icon></div>
            <div class="qa-info">
              <h4>Hostel Booking</h4>
              <p>Room reservation</p>
            </div>
          </div>

          <div class="qa-card pink-tint" routerLink="/student/timetable">
            <div class="qa-icon-box pink"><ion-icon name="calendar-outline"></ion-icon></div>
            <div class="qa-info">
              <h4>My Timetable</h4>
              <p>Classes & schedules</p>
            </div>
          </div>

          <div class="qa-card yellow-tint" routerLink="/student/attendance">
            <div class="qa-icon-box yellow"><ion-icon name="checkbox-outline"></ion-icon></div>
            <div class="qa-info">
              <h4>Attendance</h4>
              <p>Check records</p>
            </div>
          </div>

          <div class="qa-card sky-tint" routerLink="/student/exam-card">
            <div class="qa-icon-box sky"><ion-icon name="document-text-outline"></ion-icon></div>
            <div class="qa-info">
              <h4>Exam Card</h4>
              <p>Download clearance</p>
            </div>
          </div>

          <div class="qa-card teal-tint" routerLink="/student/learning-materials">
            <div class="qa-icon-box teal"><ion-icon name="book-outline"></ion-icon></div>
            <div class="qa-info">
              <h4>Learning Materials</h4>
              <p>Books & resources</p>
            </div>
          </div>

          <div class="qa-card lavender-tint" routerLink="/student/exam-results">
            <div class="qa-icon-box lavender"><ion-icon name="stats-chart-outline"></ion-icon></div>
            <div class="qa-info">
              <h4>Exam Results</h4>
              <p>Grades & transcripts</p>
            </div>
          </div>

          <div class="qa-card peach-tint" (click)="logout()">
            <div class="qa-icon-box peach"><ion-icon name="log-out-outline"></ion-icon></div>
            <div class="qa-info">
              <h4>Logout</h4>
              <p>Sign out of session</p>
            </div>
          </div>
        </div>

        <!-- Announcements Section -->
        <div class="announcements-section">
          <div class="section-header-row">
            <h3 class="section-title">Announcements & Notices</h3>
            <span class="badge-count" *ngIf="announcements.length > 0">{{ announcements.length }} New</span>
          </div>

          <div class="announcements-list">
            <!-- Loading State -->
            <div *ngIf="isLoadingAnnouncements" class="announcement-card loading-card">
              <p>Loading notices...</p>
            </div>

            <!-- Empty State -->
            <div *ngIf="!isLoadingAnnouncements && announcements.length === 0" class="announcement-card empty-card">
              <ion-icon name="megaphone-outline"></ion-icon>
              <p>No active announcements at this time.</p>
            </div>

            <!-- Dynamic Announcements List -->
            <div *ngFor="let item of announcements" class="announcement-card" [class.urgent-card]="item.priority === 'Urgent'">
              <div class="announcement-icon-box">
                <ion-icon name="megaphone-outline"></ion-icon>
              </div>
              <div class="announcement-content">
                <div class="announcement-header-line">
                  <h4>{{ item.title }}</h4>
                  <span class="announcement-date" *ngIf="item.date">
                    <ion-icon name="time-outline"></ion-icon> {{ item.date }}
                  </span>
                </div>
                <p>{{ item.message }}</p>
                <div class="announcement-footer" *ngIf="item.priority">
                  <span class="priority-badge" [ngClass]="item.priority.toLowerCase()">{{ item.priority }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </ion-content>
  `,
  styles: [`
    .mobile-dashboard-content { --background: #f8fafc; }
    .header-gradient-bg { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #2563eb 100%); padding: 16px 20px 24px 20px; border-bottom-left-radius: 28px; border-bottom-right-radius: 28px; color: #ffffff; }
    .header-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .menu-btn { color: #ffffff; --padding-start: 0; }
    .portal-title { font-size: 18px; font-weight: 700; margin: 0; color: #ffffff; }
    .header-right-icons { display: flex; align-items: center; gap: 14px; }
    .notification-badge-wrapper { position: relative; cursor: pointer; }
    .top-icon { font-size: 22px; color: #ffffff; }
    .badge-dot { position: absolute; top: -2px; right: -2px; background: #ef4444; color: #ffffff; font-size: 9px; font-weight: 700; width: 15px; height: 15px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #3b82f6; }

    .welcome-text-block { margin-bottom: 16px; h2 { font-size: 20px; font-weight: 800; margin: 0 0 2px 0; span { display: inline-block; } } p { font-size: 13px; color: rgba(255,255,255,0.85); margin: 0; } }

    .search-bar-container { background: #ffffff; border-radius: 14px; display: flex; align-items: center; padding: 10px 16px; gap: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .search-icon { font-size: 18px; color: #94a3b8; }
    .search-input { border: none; outline: none; width: 100%; font-size: 14px; color: #0f172a; background: transparent; &::placeholder { color: #94a3b8; } }

    .dashboard-body { padding: 20px; max-width: 800px; margin: 0 auto; }
    .section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; }
    .badge-count { background: #e0e7ff; color: #4f46e5; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; }

    .quick-access-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(165px, 1fr)); gap: 12px; margin-bottom: 28px; }
    .qa-card { border-radius: 14px; padding: 14px; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(0,0,0,0.04); cursor: pointer; transition: transform 0.2s; background: #fff; &:hover { transform: translateY(-2px); } }
    
    .purple-tint { background: #f5f3ff; } .qa-icon-box.purple { background: #8b5cf6; color: #fff; }
    .orange-tint { background: #fff7ed; } .qa-icon-box.orange { background: #f97316; color: #fff; }
    .blue-tint { background: #eff6ff; } .qa-icon-box.blue { background: #3b82f6; color: #fff; }
    .mint-tint { background: #f0fdf4; } .qa-icon-box.mint { background: #22c55e; color: #fff; }
    .pink-tint { background: #fdf2f8; } .qa-icon-box.pink { background: #ec4899; color: #fff; }
    .yellow-tint { background: #fefce8; } .qa-icon-box.yellow { background: #eab308; color: #fff; }
    .sky-tint { background: #f0f9ff; } .qa-icon-box.sky { background: #0ea5e9; color: #fff; }
    .teal-tint { background: #f0fdfa; } .qa-icon-box.teal { background: #14b8a6; color: #fff; }
    .lavender-tint { background: #faf5ff; } .qa-icon-box.lavender { background: #a855f7; color: #fff; }
    .peach-tint { background: #fff1f2; } .qa-icon-box.peach { background: #f43f5e; color: #fff; }

    .qa-icon-box { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .qa-info { h4 { font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0; } p { font-size: 11px; color: #64748b; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 95px; } }

    /* Announcements Styles */
    .announcements-section { margin-bottom: 24px; }
    .announcements-list { display: flex; flex-direction: column; gap: 12px; }
    .announcement-card { background: #ffffff; border-radius: 14px; padding: 16px; display: flex; gap: 14px; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
    .urgent-card { border-left: 4px solid #dc2626; background: #fffcfc; }
    .announcement-icon-box { width: 40px; height: 40px; border-radius: 10px; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
    .announcement-content { flex: 1; }
    .announcement-header-line { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; h4 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; } }
    .announcement-date { font-size: 11.5px; color: #64748b; display: flex; align-items: center; gap: 4px; ion-icon { font-size: 13px; } }
    .announcement-content p { font-size: 13px; color: #475569; margin: 0; line-height: 1.4; }
    .announcement-footer { margin-top: 8px; }
    .priority-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
    .priority-badge.urgent { background: #fee2e2; color: #dc2626; }
    .loading-card, .empty-card { justify-content: center; align-items: center; color: #64748b; font-size: 13.5px; padding: 20px; text-align: center; gap: 8px; ion-icon { font-size: 22px; color: #94a3b8; } }
  `]
})
export class StudentHomePage implements OnInit {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);

  studentName = 'Student';
  announcements: Announcement[] = [];
  isLoadingAnnouncements: boolean = true;

  constructor() {
    addIcons({
      searchOutline, notificationsOutline, walletOutline, createOutline,
      businessOutline, bedOutline, calendarOutline, checkboxOutline,
      documentTextOutline, bookOutline, statsChartOutline, logOutOutline,
      schoolOutline, megaphoneOutline, timeOutline
    });
  }

  ngOnInit(): void {
    onAuthStateChanged(this.auth, async user => {
      if (!user) {
        this.studentName = 'Student';
        return;
      }

      try {
        const profileRef = doc(this.firestore, 'users', user.uid);
        const profile = await getDoc(profileRef);

        if (profile.exists()) {
          const data = profile.data();

          this.studentName =
            data['fullName'] ||
            `${data['firstName'] || ''} ${data['lastName'] || ''}`.trim() ||
            user.displayName ||
            user.email?.split('@')[0] ||
            'Student';
        } else {
          this.studentName =
            user.displayName || user.email?.split('@')[0] || 'Student';
        }
      } catch (error) {
        console.error('Could not load student profile:', error);
      }
    });

    this.loadAnnouncements();
  }

  async loadAnnouncements() {
    this.isLoadingAnnouncements = true;
    try {
      const annRef = collection(this.firestore, 'announcements');
      const annSnap = await getDocs(annRef);
      const list: Announcement[] = [];

      annSnap.forEach(d => {
        const data = d.data();
        // Filter or check audience if needed (e.g., matching "Students" or general)
        const audience = data['audience'] || 'Students';
        if (audience === 'Students' || audience === 'All') {
          let formattedDate = '';
          const rawDate = data['createdAt'];
          if (rawDate) {
            // Handle Firestore Timestamp or standard date formats
            const dateObj = rawDate.toDate ? rawDate.toDate() : new Date(rawDate);
            formattedDate = dateObj.toLocaleDateString();
          }

          list.push({
            id: d.id,
            title: data['title'] || 'Notice',
            message: data['message'] || '',
            date: formattedDate,
            priority: data['priority'] || 'Normal',
            audience: audience
          });
        }
      });

      this.announcements = list;
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      this.isLoadingAnnouncements = false;
    }
  }

  async logout() {
    if (this.authService && typeof this.authService.logout === 'function') {
      await this.authService.logout();
    }
    this.router.navigate(['/login']);
  }
}