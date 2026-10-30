import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
  IonItem, IonSelect, IonSelectOption, IonInput, IonButtons, IonMenuButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, menuOutline, checkboxOutline } from 'ionicons/icons';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
    IonItem, IonSelect, IonSelectOption, IonInput, IonButtons, IonMenuButton, IonIcon
  ],
  template: `
    <ion-content class="attendance-content">
      <!-- Top Bar with Menu Trigger -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn"></ion-menu-button>
          </ion-buttons>
          <h2 class="page-title ion-no-margin">Student Attendance Tracker</h2>
        </div>
      </div>

      <div class="attendance-container ion-padding">
        
        <!-- Filter Card -->
        <ion-card class="filter-card">
          <div class="filter-inner">
            <div class="filter-field-wrapper">
              <label class="filter-label">Select Class</label>
              <ion-item lines="none" class="select-item">
                <ion-select [(ngModel)]="selectedClass" placeholder="-- Choose Class --" interface="popover">
                  <ion-select-option value="form1">Form 1</ion-select-option>
                  <ion-select-option value="form2">Form 2</ion-select-option>
                  <ion-select-option value="form3">Form 3</ion-select-option>
                  <ion-select-option value="form4">Form 4</ion-select-option>
                </ion-select>
              </ion-item>
            </div>

            <div class="filter-field-wrapper">
              <label class="filter-label">Attendance Date</label>
              <ion-item lines="none" class="select-item date-item">
                <ion-input type="date" [(ngModel)]="attendanceDate"></ion-input>
              </ion-item>
            </div>

            <ion-button class="load-register-btn" (click)="loadRegister()">
              Load Register
            </ion-button>
          </div>
        </ion-card>

        <!-- Attendance Register Table Card -->
        <ion-card class="table-card">
          <div class="table-responsive">
            <table class="attendance-table">
              <thead>
                <tr>
                  <th>Admission No.</th>
                  <th>Student Full Name</th>
                  <th>Mark Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="3" class="empty-state-cell">
                    Please select a class and date, then click "Load Register".
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ion-card>

      </div>
    </ion-content>
  `,
  styles: [`
    .attendance-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .page-title { font-size: 18px; font-weight: 700; color: #0f172a; } }
    .menu-trigger-btn { color: #0f172a; }
    .attendance-container { max-width: 1400px; margin: 0 auto; }
    
    .filter-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 16px 20px; margin-bottom: 24px; margin-left: 0; margin-right: 0; }
    .filter-inner { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
    .filter-field-wrapper { flex: 1; min-width: 260px; }
    .filter-label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; display: block; }
    .select-item { --background: #f8fafc; --border-radius: 8px; border: 1px solid #cbd5e1; --padding-start: 12px; height: 42px; }
    .date-item { --padding-start: 8px; }
    .load-register-btn { --background: #2563eb; --border-radius: 8px; height: 42px; font-weight: 600; font-size: 13px; margin: 0; }

    .table-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-left: 0; margin-right: 0; padding: 0; overflow: hidden; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .attendance-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .attendance-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .attendance-table td { padding: 20px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    .empty-state-cell { text-align: center; color: #64748b; font-size: 14px; font-weight: 500; padding: 40px; }
  `]
})
export class AttendancePage {
  selectedClass = '';
  attendanceDate = new Date().toISOString().split('T')[0];

  constructor() {
    addIcons({ calendarOutline, menuOutline, checkboxOutline });
  }

  loadRegister() {
    // Handle loading student attendance register for selected class and date
  }
}