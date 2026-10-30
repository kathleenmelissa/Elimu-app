import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
  IonItem, IonInput, IonTextarea, IonButtons, IonMenuButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { businessOutline, menuOutline, bedOutline } from 'ionicons/icons';

@Component({
  selector: 'app-hostel',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
    IonItem, IonInput, IonTextarea, IonButtons, IonMenuButton, IonIcon
  ],
  template: `
    <ion-content class="hostel-content">
      <!-- Top Bar with Menu Trigger -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn"></ion-menu-button>
          </ion-buttons>
          <h2 class="page-title ion-no-margin">Hostel & Dormitory Registration</h2>
        </div>
      </div>

      <div class="hostel-container ion-padding">
        <ion-grid class="ion-no-padding">
          <ion-row>
            
            <!-- Left Column: Register New Dormitory Form -->
            <ion-col size="12" size-xl="4">
              <ion-card class="form-card">
                <h3 class="card-section-title">Register New Dormitory</h3>
                
                <form (ngSubmit)="onSaveDormitory()">
                  <div class="form-group">
                    <label class="input-label">Dormitory Name / Block</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input [(ngModel)]="dormName" name="dormName" placeholder="e.g. Windsor Block A" required></ion-input>
                    </ion-item>
                  </div>

                  <div class="form-group">
                    <label class="input-label">Total Number of Beds</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input type="number" [(ngModel)]="totalBeds" name="totalBeds" placeholder="e.g. 24" required></ion-input>
                    </ion-item>
                  </div>

                  <div class="form-group">
                    <label class="input-label">Standard Price per Bed / Term (KES)</label>
                    <ion-item lines="outline" class="input-item">
                      <ion-input type="number" [(ngModel)]="pricePerBed" name="pricePerBed" placeholder="6000" required></ion-input>
                    </ion-item>
                    <span class="helper-text">Standard university boarding rate applied automatically.</span>
                  </div>

                  <div class="form-group">
                    <label class="input-label">Description / Location Notes</label>
                    <ion-item lines="outline" class="textarea-item">
                      <ion-textarea [(ngModel)]="description" name="description" rows="3" placeholder="e.g. Upper campus standard double-deck room block."></ion-textarea>
                    </ion-item>
                  </div>

                  <ion-button type="submit" class="save-dorm-btn ion-margin-top">
                    Save Dormitory & Generate Beds
                  </ion-button>
                </form>
              </ion-card>
            </ion-col>

            <!-- Right Column: Configured Dormitories & Occupancy Table -->
            <ion-col size="12" size-xl="8">
              <ion-card class="table-card">
                <h3 class="card-section-title table-title-pad">Configured Dormitories & Occupancy</h3>
                <div class="table-responsive">
                  <table class="hostel-table">
                    <thead>
                      <tr>
                        <th>Dorm Name</th>
                        <th>Beds</th>
                        <th>Rate/Term</th>
                        <th>Occupancy Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div class="dorm-name-cell"><strong>Windsor Block A</strong></div>
                          <div class="dorm-sub-cell">2nd Years</div>
                        </td>
                        <td class="beds-col">50 Total</td>
                        <td class="rate-col">KES 6,000</td>
                        <td>
                          <div class="occupancy-badges">
                            <span class="badge vacant">49 Vacant</span>
                            <span class="separator">/</span>
                            <span class="badge booked">1 Booked</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="dorm-name-cell"><strong>Windsor Block B</strong></div>
                          <div class="dorm-sub-cell">3rs Years</div>
                        </td>
                        <td class="beds-col">34 Total</td>
                        <td class="rate-col">KES 6,000</td>
                        <td>
                          <div class="occupancy-badges">
                            <span class="badge vacant">33 Vacant</span>
                            <span class="separator">/</span>
                            <span class="badge booked">1 Booked</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="dorm-name-cell"><strong>Windsor Block C</strong></div>
                          <div class="dorm-sub-cell">4TH YEARS</div>
                        </td>
                        <td class="beds-col">20 Total</td>
                        <td class="rate-col">KES 6,000</td>
                        <td>
                          <div class="occupancy-badges">
                            <span class="badge vacant">20 Vacant</span>
                            <span class="separator">/</span>
                            <span class="badge booked zero">0 Booked</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ion-card>
            </ion-col>

          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  `,
  styles: [`
    .hostel-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .page-title { font-size: 18px; font-weight: 700; color: #0f172a; } }
    .menu-trigger-btn { color: #0f172a; }
    .hostel-container { max-width: 1400px; margin: 0 auto; }
    
    .form-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 24px; margin: 6px; }
    .card-section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 20px; }
    .table-title-pad { padding: 0 24px; margin-bottom: 16px; }
    
    .form-group { margin-bottom: 16px; }
    .input-label { font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; display: block; }
    .input-item { --background: #ffffff; --border-radius: 8px; border: 1px solid #cbd5e1; --highlight-color: #2563eb; height: 44px; }
    .textarea-item { --background: #ffffff; --border-radius: 8px; border: 1px solid #cbd5e1; --highlight-color: #2563eb; }
    .helper-text { font-size: 11px; color: #64748b; margin-top: 4px; display: block; }
    .save-dorm-btn { --background: #2563eb; --border-radius: 8px; height: 44px; font-weight: 600; font-size: 14px; width: 100%; margin: 0; }

    .table-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 24px 0 0 0; margin: 6px; overflow: hidden; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .hostel-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .hostel-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 14px 24px; border-bottom: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .hostel-table td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    
    .dorm-name-cell { color: #0f172a; font-size: 14px; }
    .dorm-sub-cell { font-size: 12px; color: #64748b; margin-top: 2px; }
    .beds-col { font-weight: 500; color: #334155; }
    .rate-col { font-weight: 600; color: #0f172a; }

    .occupancy-badges { display: flex; align-items: center; gap: 6px; }
    .badge { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
    .badge.vacant { background: #dcfce7; color: #166534; }
    .badge.booked { background: #e0f2fe; color: #0369a1; }
    .badge.booked.zero { background: #f1f5f9; color: #64748b; }
    .separator { color: #94a3b8; font-weight: 600; }
  `]
})
export class HostelPage {
  dormName = '';
  totalBeds: number | null = null;
  pricePerBed: number = 6000;
  description = '';

  constructor() {
    addIcons({ businessOutline, menuOutline, bedOutline });
  }

  onSaveDormitory() {
    // Handle dormitory creation and bed generation logic here
  }
}