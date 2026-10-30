import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
  IonInput, IonButtons, IonMenuButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { searchOutline, menuOutline, shieldCheckmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-device-ip',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
    IonInput, IonButtons, IonMenuButton, IonIcon
  ],
  template: `
    <ion-content class="device-ip-content">
      <!-- Top Bar with Menu Trigger -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn"></ion-menu-button>
          </ion-buttons>
          <h2 class="page-title ion-no-margin">Student Device IP & Attendance Security</h2>
        </div>
      </div>

      <div class="device-ip-container ion-padding">
        
        <!-- Registry Card -->
        <ion-card class="registry-card">
          <div class="card-header-row">
            <div>
              <h3 class="section-title">Authorized Student Device Registry</h3>
              <p class="section-desc">Register or update the specific device IP address bound to each student account to prevent proxy attendance logging.</p>
            </div>
            <div class="search-wrapper">
              <ion-icon name="search-outline" class="search-icon"></ion-icon>
              <ion-input placeholder="Search by name, admission no, or email..."></ion-input>
            </div>
          </div>

          <div class="table-responsive">
            <table class="device-table">
              <thead>
                <tr>
                  <th>Adm No.</th>
                  <th>Student Name</th>
                  <th>Email Address</th>
                  <th>Registered Device IP</th>
                  <th>New Device IP</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="adm-col">ADM/2026/25528</td>
                  <td class="name-col">Brian Vincent</td>
                  <td class="email-col">brianvincent.student&#64;elimu.com</td>
                  <td><span class="ip-badge unbound">Not Bound</span></td>
                  <td>
                    <ion-input class="ip-input" placeholder="e.g. 192.168.1.x"></ion-input>
                  </td>
                  <td>
                    <ion-button class="bind-btn" size="small" fill="solid">
                      Bind Device IP
                    </ion-button>
                  </td>
                </tr>
                <tr>
                  <td class="adm-col">ADM/2024/23456</td>
                  <td class="name-col">Lannie Bright</td>
                  <td class="email-col">lanniebright.student&#64;elimu.com</td>
                  <td><span class="ip-badge unbound">Not Bound</span></td>
                  <td>
                    <ion-input class="ip-input" placeholder="e.g. 192.168.1.x"></ion-input>
                  </td>
                  <td>
                    <ion-button class="bind-btn" size="small" fill="solid">
                      Bind Device IP
                    </ion-button>
                  </td>
                </tr>
                <tr>
                  <td class="adm-col">ADM/2026/42358</td>
                  <td class="name-col">Shannice Otieno</td>
                  <td class="email-col">shanice.student&#64;elimu.com</td>
                  <td><span class="ip-badge unbound">Not Bound</span></td>
                  <td>
                    <ion-input class="ip-input" placeholder="e.g. 192.168.1.x"></ion-input>
                  </td>
                  <td>
                    <ion-button class="bind-btn" size="small" fill="solid">
                      Bind Device IP
                    </ion-button>
                  </td>
                </tr>
                <tr>
                  <td class="adm-col">ADM/2026/41358</td>
                  <td class="name-col">Paul Ogutu</td>
                  <td class="email-col">paulogutu.student&#64;elimu.com</td>
                  <td><span class="ip-badge bound">192.168.1.7</span></td>
                  <td>
                    <ion-input class="ip-input" placeholder="e.g. 192.168.1.x"></ion-input>
                  </td>
                  <td>
                    <ion-button class="bind-btn" size="small" fill="solid">
                      Bind Device IP
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
    .device-ip-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .page-title { font-size: 18px; font-weight: 700; color: #0f172a; } }
    .menu-trigger-btn { color: #0f172a; }
    .device-ip-container { max-width: 1400px; margin: 0 auto; }
    
    .registry-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 24px; margin-left: 0; margin-right: 0; }
    .card-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; }
    .section-desc { font-size: 13px; color: #64748b; margin: 0; }
    
    .search-wrapper { display: flex; align-items: center; background: #f8fafc; border: 1px solid #cbd5e1; padding: 4px 12px; border-radius: 8px; width: 320px; ion-input { --padding-start: 8px; font-size: 13px; } .search-icon { color: #64748b; font-size: 16px; } }

    .table-responsive { width: 100%; overflow-x: auto; }
    .device-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .device-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 14px 16px; border-bottom: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .device-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    .adm-col { font-weight: 600; color: #0f172a; }
    .name-col { font-weight: 500; color: #0f172a; }
    .email-col { color: #2563eb; }
    
    .ip-badge { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 6px; }
    .ip-badge.unbound { background: #f1f5f9; color: #64748b; }
    .ip-badge.bound { background: #f0fdf4; color: #166534; font-family: monospace; font-size: 12px; }

    .ip-input { --background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; max-width: 180px; height: 36px; --padding-start: 8px; font-size: 13px; }
    .bind-btn { --background: #2563eb; --border-radius: 6px; font-weight: 600; font-size: 12px; height: 34px; --padding-start: 12px; --padding-end: 12px; margin: 0; }
  `]
})
export class DeviceIpPage {
  constructor() {
    addIcons({ searchOutline, menuOutline, shieldCheckmarkOutline });
  }
}