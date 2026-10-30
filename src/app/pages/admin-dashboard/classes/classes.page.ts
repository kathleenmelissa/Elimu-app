import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
  IonButtons, IonMenuButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, menuOutline } from 'ionicons/icons';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
    IonButtons, IonMenuButton, IonIcon
  ],
  template: `
    <ion-content class="classes-content">
      <!-- Top Bar with Menu Trigger -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn"></ion-menu-button>
          </ion-buttons>
          <h2 class="page-title ion-no-margin">Classes & Subjects Setup</h2>
        </div>
      </div>

      <div class="classes-container ion-padding">
        <ion-grid class="ion-no-padding">
          <ion-row>
            
            <!-- Classes / Streams Section -->
            <ion-col size="12" size-xl="6">
              <ion-card class="setup-card">
                <div class="card-header-row">
                  <h3 class="section-title">Classes / Streams</h3>
                  <ion-button class="action-btn" fill="solid">
                    <ion-icon name="add-outline" slot="start"></ion-icon>
                    + Add Class
                  </ion-button>
                </div>

                <div class="table-responsive">
                  <table class="setup-table">
                    <thead>
                      <tr>
                        <th>Class Name</th>
                        <th>Level / Grade</th>
                        <th>Stream</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="bold-text">Form 2</td>
                        <td>Form 2</td>
                        <td>Pink</td>
                        <td><span class="status-badge active">ACTIVE</span></td>
                      </tr>
                      <tr>
                        <td class="bold-text">Form 1</td>
                        <td>Form 1</td>
                        <td>Red</td>
                        <td><span class="status-badge active">ACTIVE</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ion-card>
            </ion-col>

            <!-- School Subjects Section -->
            <ion-col size="12" size-xl="6">
              <ion-card class="setup-card">
                <div class="card-header-row">
                  <h3 class="section-title">School Subjects</h3>
                  <ion-button class="action-btn" fill="solid">
                    <ion-icon name="add-outline" slot="start"></ion-icon>
                    + Add Subject
                  </ion-button>
                </div>

                <div class="table-responsive">
                  <table class="setup-table">
                    <thead>
                      <tr>
                        <th>Subject Name</th>
                        <th>Code</th>
                        <th>Category</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="bold-text">Mathematics</td>
                        <td>MAT-101</td>
                        <td>Compulsory</td>
                        <td><span class="status-badge active">ACTIVE</span></td>
                      </tr>
                      <tr>
                        <td class="bold-text">Physics</td>
                        <td>PHY-101</td>
                        <td>Sciences</td>
                        <td><span class="status-badge active">ACTIVE</span></td>
                      </tr>
                      <tr>
                        <td class="bold-text">Biology</td>
                        <td>BIO-101</td>
                        <td>Sciences</td>
                        <td><span class="status-badge active">ACTIVE</span></td>
                      </tr>
                      <tr>
                        <td class="bold-text">Computer Studies</td>
                        <td>COMP-101</td>
                        <td>Technical</td>
                        <td><span class="status-badge active">ACTIVE</span></td>
                      </tr>
                      <tr>
                        <td class="bold-text">English</td>
                        <td>ENG-101</td>
                        <td>Languages</td>
                        <td><span class="status-badge active">ACTIVE</span></td>
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
    .classes-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .page-title { font-size: 18px; font-weight: 700; color: #0f172a; } }
    .menu-trigger-btn { color: #0f172a; }
    .classes-container { max-width: 1400px; margin: 0 auto; }
    
    .setup-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 24px; margin: 6px; }
    .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; }
    .action-btn { --background: #2563eb; --border-radius: 8px; font-weight: 600; font-size: 13px; height: 38px; }

    .table-responsive { width: 100%; overflow-x: auto; }
    .setup-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .setup-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .setup-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    .bold-text { font-weight: 600; color: #0f172a; }
    .status-badge { background: #dcfce7; color: #166534; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 6px; letter-spacing: 0.5px; }
  `]
})
export class ClassesPage {
  constructor() {
    addIcons({ addOutline, menuOutline });
  }
}