import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
  IonItem, IonInput, IonTextarea, IonButtons, IonMenuButton
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { menuOutline, settingsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
    IonItem, IonInput, IonTextarea, IonButtons, IonMenuButton
  ],
  template: `
    <ion-content class="settings-content">
      <!-- Top Nav Bar -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn"></ion-menu-button>
          </ion-buttons>
          <h2 class="page-title ion-no-margin">School Settings & Profile</h2>
        </div>
      </div>

      <div class="settings-container ion-padding">
        
        <!-- General Institutional Profile Card -->
        <ion-card class="form-card">
          <h3 class="card-section-title">General Institutional Profile</h3>
          
          <form (ngSubmit)="onSaveSettings()">
            <ion-grid class="ion-no-padding">
              <ion-row>
                
                <ion-col size="12">
                  <div class="form-group">
                    <label class="input-label">Official School Name</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input [(ngModel)]="schoolName" name="schoolName" placeholder="e.g. Elimu High School" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>

                <ion-col size="12">
                  <div class="form-group">
                    <label class="input-label">School Motto / Vision</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input [(ngModel)]="motto" name="motto" placeholder="e.g. Education is Light & Excellence" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">Official Contact Email</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input type="email" [(ngModel)]="email" name="email" placeholder="info&#64;elimuhigh.ac.ke" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">Phone Number</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input [(ngModel)]="phone" name="phone" placeholder="+254 700 000000" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">M-PESA Paybill / Till Number</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input [(ngModel)]="mpesaNumber" name="mpesaNumber" placeholder="e.g. 123456" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>

                <ion-col size="12" size-md="6">
                  <div class="form-group">
                    <label class="input-label">Current Term / Academic Year</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input [(ngModel)]="academicYear" name="academicYear" placeholder="e.g. Term 2, 2026" required></ion-input>
                    </ion-item>
                  </div>
                </ion-col>

                <ion-col size="12">
                  <div class="form-group">
                    <label class="input-label">Physical / Postal Address</label>
                    <ion-item lines="outline" class="textarea-item">
                      <ion-textarea [(ngModel)]="address" name="address" rows="3" placeholder="P.O. Box 456 - 00100, Nairobi, Kenya" required></ion-textarea>
                    </ion-item>
                  </div>
                </ion-col>

              </ion-row>

              <ion-row class="ion-margin-top">
                <ion-col size="12">
                  <ion-button type="submit" class="save-btn">
                    Save Changes
                  </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
          </form>
        </ion-card>

      </div>
    </ion-content>
  `,
  styles: [`
    .settings-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .page-title { font-size: 18px; font-weight: 700; color: #0f172a; } }
    .menu-trigger-btn { color: #0f172a; }
    .settings-container { max-width: 900px; margin: 0 auto; }

    .form-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 32px; margin: 0; }
    .card-section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 24px; }
    
    .form-group { margin-bottom: 18px; }
    .input-label { font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; display: block; }
    .input-item { --background: #ffffff; --border-radius: 8px; border: 1px solid #cbd5e1; --highlight-color: #2563eb; height: 44px; }
    .textarea-item { --background: #ffffff; --border-radius: 8px; border: 1px solid #cbd5e1; --highlight-color: #2563eb; }
    
    .save-btn { --background: #2563eb; --border-radius: 8px; height: 44px; font-weight: 600; font-size: 14px; width: 160px; margin: 0; }
  `]
})
export class SettingsPage {
  schoolName = '';
  motto = '';
  email = '';
  phone = '';
  mpesaNumber = '';
  academicYear = '';
  address = '';

  constructor() {
    addIcons({ menuOutline, settingsOutline });
  }

  onSaveSettings() {
    // Handle saving institutional settings and school profile
  }
}