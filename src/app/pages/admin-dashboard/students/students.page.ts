import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonAvatar,
  IonButtons, IonMenuButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personAddOutline, filterOutline, menuOutline } from 'ionicons/icons';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonAvatar,
    IonButtons, IonMenuButton, IonIcon
  ],
  template: `
    <ion-content class="students-content">
      <!-- Top Bar with Menu Trigger -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn"></ion-menu-button>
          </ion-buttons>
          <h2 class="page-title ion-no-margin">Student Management</h2>
        </div>
      </div>

      <div class="students-container ion-padding">
        
        <!-- Header Actions & Directory Title -->
        <div class="directory-header-row">
          <h3 class="directory-title">Registered Students Directory</h3>
          <ion-button class="register-btn" fill="solid">
            <ion-icon name="person-add-outline" slot="start"></ion-icon>
            + Register Student
          </ion-button>
        </div>

        <!-- Filter Card -->
        <ion-card class="filter-card">
          <div class="filter-inner">
            <div class="filter-field-wrapper">
              <label class="filter-label">Filter by Class</label>
              <ion-item lines="none" class="select-item">
                <ion-select placeholder="-- All Classes --" interface="popover">
                  <ion-select-option value="all">-- All Classes --</ion-select-option>
                  <ion-select-option value="form1">Form 1</ion-select-option>
                  <ion-select-option value="form2">Form 2</ion-select-option>
                  <ion-select-option value="form3">Form 3</ion-select-option>
                  <ion-select-option value="form4">Form 4</ion-select-option>
                </ion-select>
              </ion-item>
            </div>
            <ion-button class="filter-action-btn">
              Filter Students
            </ion-button>
          </div>
        </ion-card>

        <!-- Students Table Card -->
        <ion-card class="table-card">
          <div class="table-responsive">
            <table class="students-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Admission No.</th>
                  <th>Full Name</th>
                  <th>Class</th>
                  <th>Gender</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <ion-avatar class="table-avatar">
                      <img src="https://ionicframework.com/docs/img/demos/avatar.svg" alt="Student" />
                    </ion-avatar>
                  </td>
                  <td class="admission-col">ADM/2026/25528</td>
                  <td class="name-col">Brian Vincent</td>
                  <td>Form 2</td>
                  <td>Male</td>
                  <td class="email-col">brianvincent.student&#64;elimu.com</td>
                </tr>
                <tr>
                  <td>
                    <ion-avatar class="table-avatar">
                      <img src="https://ionicframework.com/docs/img/demos/avatar.svg" alt="Student" />
                    </ion-avatar>
                  </td>
                  <td class="admission-col">ADM/2024/23456</td>
                  <td class="name-col">Lannie Bright</td>
                  <td>Form 1</td>
                  <td>Female</td>
                  <td class="email-col">lanniebright.student&#64;elimu.com</td>
                </tr>
                <tr>
                  <td>
                    <ion-avatar class="table-avatar">
                      <img src="https://ionicframework.com/docs/img/demos/avatar.svg" alt="Student" />
                    </ion-avatar>
                  </td>
                  <td class="admission-col">ADM/2026/42358</td>
                  <td class="name-col">Shannice Otieno</td>
                  <td>Form 2</td>
                  <td>Female</td>
                  <td class="email-col">shanice.student&#64;elimu.com</td>
                </tr>
                <tr>
                  <td>
                    <ion-avatar class="table-avatar">
                      <img src="https://ionicframework.com/docs/img/demos/avatar.svg" alt="Student" />
                    </ion-avatar>
                  </td>
                  <td class="admission-col">ADM/2026/41358</td>
                  <td class="name-col">Paul Ogutu</td>
                  <td>Form 1</td>
                  <td>Male</td>
                  <td class="email-col">paulogutu.student&#64;elimu.com</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ion-card>

      </div>
    </ion-content>
  `,
  styles: [`
    .students-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .page-title { font-size: 18px; font-weight: 700; color: #0f172a; } }
    .menu-trigger-btn { color: #0f172a; }
    .students-container { max-width: 1400px; margin: 0 auto; }
    .directory-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .directory-title { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; }
    .register-btn { --background: #2563eb; --border-radius: 8px; font-weight: 600; font-size: 13px; height: 40px; }
    .filter-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 16px 20px; margin-bottom: 24px; margin-left: 0; margin-right: 0; }
    .filter-inner { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
    .filter-field-wrapper { flex: 1; min-width: 280px; }
    .filter-label { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; display: block; }
    .select-item { --background: #f8fafc; --border-radius: 8px; border: 1px solid #cbd5e1; --padding-start: 12px; height: 42px; }
    .filter-action-btn { --background: #2563eb; --border-radius: 8px; height: 42px; font-weight: 600; font-size: 13px; margin: 0; }
    .table-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-left: 0; margin-right: 0; padding: 0; overflow: hidden; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .students-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .students-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .students-table td { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    .table-avatar { width: 36px; height: 36px; }
    .admission-col { font-weight: 600; color: #0f172a; }
    .name-col { font-weight: 500; color: #0f172a; }
    .email-col { color: #2563eb; }
  `]
})
export class StudentsPage {
  constructor() {
    addIcons({ personAddOutline, filterOutline, menuOutline });
  }
}