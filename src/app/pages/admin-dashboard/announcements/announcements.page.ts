import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
  IonButtons, IonMenuButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, menuOutline, megaphoneOutline } from 'ionicons/icons';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
    IonButtons, IonMenuButton, IonIcon
  ],
  template: `
    <ion-content class="announcements-content">
      <!-- Top Nav Bar -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn"></ion-menu-button>
          </ion-buttons>
          <h2 class="page-title ion-no-margin">Announcements Broadcast</h2>
        </div>
      </div>

      <div class="announcements-container ion-padding">
        
        <!-- Header Actions & Section Title -->
        <div class="directory-header-row">
          <h3 class="directory-title">Active School Circulars & Notices</h3>
          <ion-button class="post-announcement-btn" fill="solid" (click)="onPostAnnouncement()">
            <ion-icon name="add-outline" slot="start"></ion-icon>
            + Post New Announcement
          </ion-button>
        </div>

        <!-- Announcements Grid / Cards -->
        <ion-grid class="ion-no-padding">
          <ion-row>
            <ion-col size="12" size-md="6" size-xl="4">
              <ion-card class="announcement-card">
                <div class="card-top-row">
                  <h4 class="announcement-title">FEES BALANCE</h4>
                  <span class="urgent-badge">URGENT</span>
                </div>
                <div class="card-meta-row">
                  <span class="target-text">Target: <strong>Students</strong></span>
                  <span class="date-text">Oct 5, 2026</span>
                </div>
                <p class="announcement-body">
                  Ensure you have cleared your fee balance
                </p>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

      </div>
    </ion-content>
  `,
  styles: [`
    .announcements-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .page-title { font-size: 18px; font-weight: 700; color: #0f172a; } }
    .menu-trigger-btn { color: #0f172a; }
    .announcements-container { max-width: 1400px; margin: 0 auto; }

    /* Directory Header Row */
    .directory-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .directory-title { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; }
    .post-announcement-btn { --background: #2563eb; --border-radius: 8px; font-weight: 600; font-size: 13px; height: 40px; margin: 0; }

    /* Announcement Card */
    .announcement-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 20px; margin: 0; }
    .card-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .announcement-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
    .urgent-badge { background: #fee2e2; color: #991b1b; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.5px; }
    
    .card-meta-row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
    .target-text { color: #475569; strong { color: #0f172a; } }
    .date-text { color: #64748b; font-weight: 500; }

    .announcement-body { font-size: 13px; color: #334155; margin: 0; line-height: 1.5; }
  `]
})
export class AnnouncementsPage {
  constructor() {
    addIcons({ addOutline, menuOutline, megaphoneOutline });
  }

  onPostAnnouncement() {
    // Handle opening post announcement modal / drawer
  }
}