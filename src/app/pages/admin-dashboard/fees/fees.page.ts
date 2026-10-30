import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonCard, IonButton,
  IonButtons, IonMenuButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, menuOutline, cashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonCard, IonButton,
    IonButtons, IonMenuButton, IonIcon
  ],
  template: `
    <ion-content class="fees-content">
      <!-- Top Nav Bar -->
      <div class="top-nav-bar">
        <div class="header-left">
          <ion-buttons>
            <ion-menu-button class="menu-trigger-btn"></ion-menu-button>
          </ion-buttons>
          <h2 class="page-title ion-no-margin">Fee Management</h2>
        </div>
      </div>

      <div class="fees-container ion-padding">
        
        <!-- Tab Switcher Header -->
        <div class="tabs-header-row">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'structures'" 
            (click)="activeTab = 'structures'">
            Fee Structures
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'balances'" 
            (click)="activeTab = 'balances'">
            Student Fee Balances & Payments
          </button>
        </div>

        <!-- Tab 1: Fee Structures Content -->
        <div *ngIf="activeTab === 'structures'">
          <!-- Directory Action Header -->
          <div class="directory-header-row">
            <h3 class="directory-title">Class Fee Structure Directory</h3>
            <ion-button class="add-fee-btn" fill="solid" (click)="onAddFeeItem()">
              <ion-icon name="add-outline" slot="start"></ion-icon>
              + Add Fee Item
            </ion-button>
          </div>

          <!-- Fee Structure Table Card -->
          <ion-card class="table-card">
            <div class="table-responsive">
              <table class="fees-table">
                <thead>
                  <tr>
                    <th>Level / Grade</th>
                    <th>Term</th>
                    <th>Fee Description</th>
                    <th>Amount (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="bold-text">Form 2</td>
                    <td>Term 1</td>
                    <td>Tuition</td>
                    <td class="amount-col">KES 20,000</td>
                  </tr>
                  <tr>
                    <td class="bold-text">Grade 7</td>
                    <td>Term 1</td>
                    <td>Tuition</td>
                    <td class="amount-col">KES 20,000</td>
                  </tr>
                  <tr>
                    <td class="bold-text">Form 1</td>
                    <td>Term 1</td>
                    <td>Tuition</td>
                    <td class="amount-col">KES 45,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ion-card>
        </div>

        <!-- Tab 2: Student Fee Balances & Payments Content -->
        <div *ngIf="activeTab === 'balances'">
          <ion-card class="table-card placeholder-card">
            <div class="empty-state-cell">
              Student fee accounts, ledgers, and payment history will appear here.
            </div>
          </ion-card>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .fees-content { --background: #f8fafc; }
    .top-nav-bar { background: #ffffff; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e2e8f0; }
    .header-left { display: flex; align-items: center; gap: 12px; .page-title { font-size: 18px; font-weight: 700; color: #0f172a; } }
    .menu-trigger-btn { color: #0f172a; }
    .fees-container { max-width: 1400px; margin: 0 auto; }

    /* Top Tabs Styling */
    .tabs-header-row { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
    .tab-btn { background: transparent; border: none; padding: 8px 18px; font-size: 14px; font-weight: 600; color: #64748b; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; }
    .tab-btn.active { background: #2563eb; color: #ffffff; }

    /* Directory Header */
    .directory-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .directory-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
    .add-fee-btn { --background: #2563eb; --border-radius: 8px; font-weight: 600; font-size: 13px; height: 40px; margin: 0; }

    /* Table Styling */
    .table-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-left: 0; margin-right: 0; padding: 0; overflow: hidden; }
    .placeholder-card { padding: 40px 0; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .fees-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    .fees-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .fees-table td { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    .bold-text { font-weight: 600; color: #0f172a; }
    .amount-col { font-weight: 600; color: #0f172a; }
    .empty-state-cell { text-align: center; color: #64748b; font-size: 14px; font-weight: 500; padding: 36px; }
  `]
})
export class FeesPage {
  activeTab: 'structures' | 'balances' = 'structures';

  constructor() {
    addIcons({ addOutline, menuOutline, cashOutline });
  }

  onAddFeeItem() {
    // Handle opening add fee item modal or form
  }
}