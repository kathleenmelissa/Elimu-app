import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
  IonItem, IonInput, IonSelect, IonSelectOption, IonButtons, IonMenuButton
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personAddOutline, menuOutline, trashOutline, linkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-parents',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
    IonItem, IonInput, IonSelect, IonSelectOption, IonButtons, IonMenuButton
  ],
  template: `
    <ion-content class="parents-content">
      <!-- Top Bar with Menu Trigger -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn"></ion-menu-button>
          </ion-buttons>
          <h2 class="page-title ion-no-margin">Parent Registration & Student Linking</h2>
        </div>
      </div>

      <div class="parents-container ion-padding">
        
        <!-- Register & Link Parent Card -->
        <ion-card class="form-card">
          <h3 class="card-section-title">Register Parent & Link to Student</h3>
          
          <form (ngSubmit)="onRegisterParent()">
            <ion-grid class="ion-no-padding">
              <ion-row>
                <!-- Parent Details -->
                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">Parent Full Name</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input [(ngModel)]="parentName" name="parentName" placeholder="e.g. David Mutua" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">Parent Email Address</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input type="email" [(ngModel)]="parentEmail" name="parentEmail" placeholder="parent&#64;elimu.com" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">Phone Number</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input [(ngModel)]="parentPhone" name="parentPhone" placeholder="+2547XXXXXXXX" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">Temporary Password</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input type="password" [(ngModel)]="parentPassword" name="parentPassword" placeholder="At least 6 characters" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>

                <!-- Student Linking Details -->
                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">Select Student to Link</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-select [(ngModel)]="selectedStudentId" name="selectedStudentId" placeholder="-- Search or Select Student --" interface="popover">
                        <ion-select-option value="ADM/2026/25528">Brian Vincent (ADM/2026/25528)</ion-select-option>
                        <ion-select-option value="ADM/2024/23456">Lannie Bright (ADM/2024/23456)</ion-select-option>
                        <ion-select-option value="ADM/2026/42358">Shannice Otieno (ADM/2026/42358)</ion-select-option>
                        <ion-select-option value="ADM/2026/41358">Paul Ogutu (ADM/2026/41358)</ion-select-option>
                      </ion-select>
                    </ion-item>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">Relationship Type</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-select [(ngModel)]="relationship" name="relationship" placeholder="-- Select Relationship --" interface="popover">
                        <ion-select-option value="Father">Father</ion-select-option>
                        <ion-select-option value="Mother">Mother</ion-select-option>
                        <ion-select-option value="Guardian">Guardian</ion-select-option>
                      </ion-select>
                    </ion-item>
                  </div>
                </ion-col>
              </ion-row>

              <ion-row class="ion-margin-top">
                <ion-col size="12">
                  <ion-button type="submit" class="register-parent-btn">
                    Create Account & Link Student
                  </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
          </form>
        </ion-card>

        <!-- Registered Parents Directory Table Card -->
        <ion-card class="table-card">
          <h3 class="card-section-title table-title-pad">Registered Parents & Linked Students</h3>
          <div class="table-responsive">
            <table class="parents-table">
              <thead>
                <tr>
                  <th>Parent Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Linked Student</th>
                  <th>Relationship</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="name-col">Grace Mutua</td>
                  <td class="email-col">grace.mutua&#64;gmail.com</td>
                  <td>+254712345678</td>
                  <td class="student-col">Brian Vincent (ADM/2026/25528)</td>
                  <td><span class="relation-badge">Mother</span></td>
                  <td>
                    <ion-button color="danger" size="small" class="remove-btn" fill="solid">
                      Unlink & Remove
                    </ion-button>
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
    .parents-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .page-title { font-size: 18px; font-weight: 700; color: #0f172a; } }
    .menu-trigger-btn { color: #0f172a; }
    .parents-container { max-width: 1400px; margin: 0 auto; }
    
    .form-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 24px; margin-bottom: 24px; margin-left: 0; margin-right: 0; }
    .card-section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    .input-label { font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; display: block; }
    .input-item { --background: #ffffff; --border-radius: 8px; border: 1px solid #cbd5e1; --highlight-color: #2563eb; height: 44px; }
    .register-parent-btn { --background: #2563eb; --border-radius: 8px; height: 44px; font-weight: 600; font-size: 14px; margin: 0; }

    .table-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-left: 0; margin-right: 0; padding: 24px 0 0 0; overflow: hidden; }
    .table-title-pad { padding: 0 24px; margin-bottom: 16px; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .parents-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .parents-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 14px 24px; border-bottom: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .parents-table td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    .name-col { font-weight: 600; color: #0f172a; }
    .email-col { color: #2563eb; }
    .student-col { font-weight: 500; color: #334155; }
    .relation-badge { background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; }
    .remove-btn { --background: #dc2626; --border-radius: 6px; font-weight: 600; font-size: 12px; height: 32px; --padding-start: 14px; --padding-end: 14px; }
  `]
})
export class ParentsPage {
  parentName = '';
  parentEmail = '';
  parentPhone = '';
  parentPassword = '';
  selectedStudentId = '';
  relationship = '';

  constructor() {
    addIcons({ personAddOutline, menuOutline, trashOutline, linkOutline });
  }

  onRegisterParent() {
    // Handle account creation and student linkage logic here
  }
}