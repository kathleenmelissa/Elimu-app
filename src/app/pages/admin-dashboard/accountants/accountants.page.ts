import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
  IonItem, IonLabel, IonInput, IonButtons, IonMenuButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personAddOutline, menuOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-accountants',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
    IonItem, IonLabel, IonInput, IonButtons, IonMenuButton, IonIcon
  ],
  template: `
    <ion-content class="accountants-content">
      <!-- Top Bar with Menu Trigger -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn"></ion-menu-button>
          </ion-buttons>
          <h2 class="page-title ion-no-margin">Accountant Registration & Management</h2>
        </div>
      </div>

      <div class="accountants-container ion-padding">
        
        <!-- Register New Accountant Card -->
        <ion-card class="form-card">
          <h3 class="card-section-title">Register New Accountant</h3>
          
          <form (ngSubmit)="onRegister()">
            <ion-grid class="ion-no-padding">
              <ion-row>
                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">Full Name</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input [(ngModel)]="fullName" name="fullName" placeholder="e.g. Jane Doe" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">Email Address</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input type="email" [(ngModel)]="email" name="email" placeholder="accountant&#64;elimu.com" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">Phone Number</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input [(ngModel)]="phone" name="phone" placeholder="+2547XXXXXXXX" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">Temporary Password</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input type="password" [(ngModel)]="password" name="password" placeholder="At least 6 characters" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>
              </ion-row>

              <ion-row class="ion-margin-top">
                <ion-col size="12">
                  <ion-button type="submit" class="register-account-btn">
                    Register Accountant Account
                  </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
          </form>
        </ion-card>

        <!-- Registered Accountants Table Card -->
        <ion-card class="table-card">
          <h3 class="card-section-title table-title-pad">Registered Accountants</h3>
          <div class="table-responsive">
            <table class="accountants-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="name-col">Kathleen Odeny</td>
                  <td class="email-col">leen.accounts&#64;elimu.com</td>
                  <td>+254794963763</td>
                  <td class="role-col">Accountant</td>
                  <td>
                    <ion-button color="danger" size="small" class="remove-btn" fill="solid">
                      Remove
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
    .accountants-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .page-title { font-size: 18px; font-weight: 700; color: #0f172a; } }
    .menu-trigger-btn { color: #0f172a; }
    .accountants-container { max-width: 1400px; margin: 0 auto; }
    
    .form-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 24px; margin-bottom: 24px; margin-left: 0; margin-right: 0; }
    .card-section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    .input-label { font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; display: block; }
    .input-item { --background: #ffffff; --border-radius: 8px; border: 1px solid #cbd5e1; --highlight-color: #2563eb; height: 44px; }
    .register-account-btn { --background: #2563eb; --border-radius: 8px; height: 44px; font-weight: 600; font-size: 14px; margin: 0; }

    .table-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-left: 0; margin-right: 0; padding: 24px 0 0 0; overflow: hidden; }
    .table-title-pad { padding: 0 24px; margin-bottom: 16px; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .accountants-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .accountants-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 14px 24px; border-bottom: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .accountants-table td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    .name-col { font-weight: 600; color: #0f172a; }
    .email-col { color: #2563eb; }
    .role-col { font-weight: 600; color: #2563eb; }
    .remove-btn { --background: #dc2626; --border-radius: 6px; font-weight: 600; font-size: 12px; height: 32px; --padding-start: 14px; --padding-end: 14px; }
  `]
})
export class AccountantsPage {
  fullName = '';
  email = '';
  phone = '';
  password = '';

  constructor() {
    addIcons({ personAddOutline, menuOutline, trashOutline });
  }

  onRegister() {
    // Handle accountant registration logic here
  }
}