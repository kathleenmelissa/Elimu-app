import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
  IonItem, IonSelect, IonSelectOption, IonButtons, IonMenuButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, menuOutline, documentTextOutline, openOutline } from 'ionicons/icons';

@Component({
  selector: 'app-learning-materials',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
    IonItem, IonSelect, IonSelectOption, IonButtons, IonMenuButton, IonIcon
  ],
  template: `
    <ion-content class="materials-content">
      <!-- Top Nav Bar -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn"></ion-menu-button>
          </ion-buttons>
          <h2 class="page-title ion-no-margin">Learning Materials</h2>
        </div>
      </div>

      <div class="materials-container ion-padding">
        
        <!-- Header Actions & Section Title -->
        <div class="directory-header-row">
          <h3 class="directory-title">Uploaded Notes & Revision Papers</h3>
          <ion-button class="upload-btn" fill="solid" (click)="onUploadMaterial()">
            <ion-icon name="add-outline" slot="start"></ion-icon>
            + Upload Material
          </ion-button>
        </div>

        <!-- Filter Card -->
        <ion-card class="filter-card">
          <div class="filter-inner">
            <div class="filter-field-wrapper">
              <label class="filter-label">Filter by Class</label>
              <ion-item lines="none" class="select-item">
                <ion-select [(ngModel)]="selectedClass" placeholder="-- All Classes --" interface="popover">
                  <ion-select-option value="all">-- All Classes --</ion-select-option>
                  <ion-select-option value="form1">Form 1</ion-select-option>
                  <ion-select-option value="form2">Form 2</ion-select-option>
                  <ion-select-option value="form3">Form 3</ion-select-option>
                  <ion-select-option value="form4">Form 4</ion-select-option>
                </ion-select>
              </ion-item>
            </div>
            <ion-button class="filter-action-btn" (click)="filterMaterials()">
              Filter Materials
            </ion-button>
          </div>
        </ion-card>

        <!-- Learning Materials Table Card -->
        <ion-card class="table-card">
          <div class="table-responsive">
            <table class="materials-table">
              <thead>
                <tr>
                  <th>Title / Description</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Date Added</th>
                  <th>Resource Link</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="bold-text">Form 1 calculus notes</td>
                  <td>Form 1</td>
                  <td>Mathematics</td>
                  <td>Oct 7, 2026</td>
                  <td>
                    <a href="javascript:void(0)" class="resource-link">
                      Access File <ion-icon name="open-outline" class="link-icon"></ion-icon>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="bold-text">Form 2 Vector Calculus notes</td>
                  <td>Form 2</td>
                  <td>Mathematics</td>
                  <td>Oct 7, 2026</td>
                  <td>
                    <a href="javascript:void(0)" class="resource-link">
                      Access File <ion-icon name="open-outline" class="link-icon"></ion-icon>
                    </a>
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
    .materials-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .page-title { font-size: 18px; font-weight: 700; color: #0f172a; } }
    .menu-trigger-btn { color: #0f172a; }
    .materials-container { max-width: 1400px; margin: 0 auto; }

    /* Directory Header Row */
    .directory-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    .directory-title { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; }
    .upload-btn { --background: #2563eb; --border-radius: 8px; font-weight: 600; font-size: 13px; height: 40px; margin: 0; }

    /* Filter Card Styling */
    .filter-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 16px 20px; margin-bottom: 24px; margin-left: 0; margin-right: 0; }
    .filter-inner { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
    .filter-field-wrapper { flex: 1; min-width: 280px; }
    .filter-label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; display: block; }
    .select-item { --background: #f8fafc; --border-radius: 8px; border: 1px solid #cbd5e1; --padding-start: 12px; height: 42px; }
    .filter-action-btn { --background: #2563eb; --border-radius: 8px; height: 42px; font-weight: 600; font-size: 13px; margin: 0; }

    /* Table Styling */
    .table-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-left: 0; margin-right: 0; padding: 0; overflow: hidden; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .materials-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .materials-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .materials-table td { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    .bold-text { font-weight: 600; color: #0f172a; }
    
    .resource-link { color: #2563eb; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; &:hover { text-decoration: underline; } }
    .link-icon { font-size: 14px; }
  `]
})
export class LearningMaterialsPage {
  selectedClass = 'all';

  constructor() {
    addIcons({ addOutline, menuOutline, documentTextOutline, openOutline });
  }

  onUploadMaterial() {
    // Handle material upload modal / form
  }

  filterMaterials() {
    // Handle filtering learning materials by class
  }
}