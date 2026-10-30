import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
  IonItem, IonLabel, IonInput, IonButtons, IonMenuButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personAddOutline, searchOutline, menuOutline } from 'ionicons/icons';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
    IonItem, IonLabel, IonInput, IonButtons, IonMenuButton, IonIcon
  ],
  template: `
    <ion-content class="teachers-content">
      <!-- Top Bar with Menu Trigger -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn"></ion-menu-button>
          </ion-buttons>
          <h2 class="page-title ion-no-margin">Teacher Management</h2>
        </div>
      </div>

      <div class="teachers-container ion-padding">
        
        <!-- Header Actions & Directory Title -->
        <div class="directory-header-row">
          <h3 class="directory-title">Teacher Directory</h3>
          <ion-button class="register-btn" fill="solid">
            <ion-icon name="person-add-outline" slot="start"></ion-icon>
            + Register Teacher
          </ion-button>
        </div>

        <!-- Search Bar Card -->
        <ion-card class="search-card">
          <div class="search-inner">
            <ion-icon name="search-outline" class="search-icon"></ion-icon>
            <ion-input placeholder="Search by name, email or phone..."></ion-input>
          </div>
        </ion-card>

        <!-- Teachers Table Card -->
        <ion-card class="table-card">
          <div class="table-responsive">
            <table class="teachers-table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Subjects</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="staff-id-col">TSC/2013/1235</td>
                  <td class="name-col">M.r Gilbert Lee</td>
                  <td class="email-col">gilbertlee.teacher&#64;elimu.com</td>
                  <td>+254720985522</td>
                  <td>Physics, Biology</td>
                  <td><span class="status-badge active">ACTIVE</span></td>
                </tr>
                <tr>
                  <td class="staff-id-col">TSC/2013/1234</td>
                  <td class="name-col">M.s Jane Smith</td>
                  <td class="email-col">janesmith.teacher&#64;elimu.com</td>
                  <td>+254794963763</td>
                  <td>Mathematics , Biology</td>
                  <td><span class="status-badge active">ACTIVE</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </ion-card>

      </div>
    </ion-content>
  `,
  styles: [`
    .teachers-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .page-title { font-size: 18px; font-weight: 700; color: #0f172a; } }
    .menu-trigger-btn { color: #0f172a; }
    .teachers-container { max-width: 1400px; margin: 0 auto; }
    .directory-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .directory-title { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; }
    .register-btn { --background: #2563eb; --border-radius: 8px; font-weight: 600; font-size: 13px; height: 40px; }
    .search-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 8px 16px; margin-bottom: 24px; margin-left: 0; margin-right: 0; }
    .search-inner { display: flex; align-items: center; gap: 10px; .search-icon { color: #64748b; font-size: 18px; } ion-input { --padding-start: 4px; font-size: 14px; } }
    .table-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-left: 0; margin-right: 0; padding: 0; overflow: hidden; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .teachers-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .teachers-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .teachers-table td { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    .staff-id-col { font-weight: 600; color: #0f172a; }
    .name-col { font-weight: 500; color: #0f172a; }
    .email-col { color: #2563eb; }
    .status-badge { background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px; }
  `]
})
export class TeachersPage {
  constructor() {
    addIcons({ personAddOutline, searchOutline, menuOutline });
  }
}