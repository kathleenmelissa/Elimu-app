import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonCard, IonButton,
  IonButtons, IonMenuButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, menuOutline, documentTextOutline } from 'ionicons/icons';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonCard, IonButton,
    IonButtons, IonMenuButton, IonIcon
  ],
  template: `
    <ion-content class="exams-content">
      <!-- Top Nav Bar -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn"></ion-menu-button>
          </ion-buttons>
          <h2 class="page-title ion-no-margin">Exams & Results Management</h2>
        </div>
      </div>

      <div class="exams-container ion-padding">
        
        <!-- Tab Switcher Header -->
        <div class="tabs-header-row">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'manage'" 
            (click)="activeTab = 'manage'">
            Manage Exams
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'marks'" 
            (click)="activeTab = 'marks'">
            Record & View Marks
          </button>
        </div>

        <!-- Tab 1: Manage Exams Content -->
        <div *ngIf="activeTab === 'manage'">
          <!-- Directory Action Header -->
          <div class="directory-header-row">
            <h3 class="directory-title">Exam Series Directory</h3>
            <ion-button class="create-series-btn" fill="solid" (click)="onCreateSeries()">
              <ion-icon name="add-outline" slot="start"></ion-icon>
              + Create Exam Series
            </ion-button>
          </div>

          <!-- Exam Series Directory Table Card -->
          <ion-card class="table-card">
            <div class="table-responsive">
              <table class="exams-table">
                <thead>
                  <tr>
                    <th>Exam Title</th>
                    <th>Term / Year</th>
                    <th>Start Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="examSeriesList.length === 0">
                    <td colspan="4" class="empty-state-cell">
                      No exam series found.
                    </td>
                  </tr>
                  <tr *ngFor="let exam of examSeriesList">
                    <td class="bold-title">{{ exam.title }}</td>
                    <td>{{ exam.termYear }}</td>
                    <td>{{ exam.startDate }}</td>
                    <td><span class="status-badge" [class.active]="exam.status === 'ACTIVE'">{{ exam.status }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ion-card>
        </div>

        <!-- Tab 2: Record & View Marks Content -->
        <div *ngIf="activeTab === 'marks'">
          <ion-card class="table-card placeholder-card">
            <div class="empty-state-cell">
              Select an exam series from management to record or view student marks.
            </div>
          </ion-card>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .exams-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .page-title { font-size: 18px; font-weight: 700; color: #0f172a; } }
    .menu-trigger-btn { color: #0f172a; }
    .exams-container { max-width: 1400px; margin: 0 auto; }

    /* Top Tabs Styling */
    .tabs-header-row { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
    .tab-btn { background: transparent; border: none; padding: 8px 18px; font-size: 14px; font-weight: 600; color: #64748b; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; }
    .tab-btn.active { background: #2563eb; color: #ffffff; }

    /* Directory Header */
    .directory-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .directory-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
    .create-series-btn { --background: #2563eb; --border-radius: 8px; font-weight: 600; font-size: 13px; height: 40px; margin: 0; }

    /* Table Styling */
    .table-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-left: 0; margin-right: 0; padding: 0; overflow: hidden; }
    .placeholder-card { padding: 40px 0; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .exams-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .exams-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .exams-table td { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    .bold-title { font-weight: 600; color: #0f172a; }
    .empty-state-cell { text-align: center; color: #64748b; font-size: 14px; font-weight: 500; padding: 36px; }

    /* Badges */
    .status-badge { background: #f1f5f9; color: #64748b; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px; }
    .status-badge.active { background: #dcfce7; color: #166534; }
  `]
})
export class ExamsPage {
  activeTab: 'manage' | 'marks' = 'manage';
  examSeriesList: any[] = [];

  constructor() {
    addIcons({ addOutline, menuOutline, documentTextOutline });
  }

  onCreateSeries() {
    // Handle exam series creation modal / drawer
  }
}