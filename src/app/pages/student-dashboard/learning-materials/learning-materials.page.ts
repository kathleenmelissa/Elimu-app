import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonButton, IonIcon, IonBadge, IonSearchbar
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { bookOutline, downloadOutline, searchOutline, documentTextOutline } from 'ionicons/icons';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-learning-materials',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, IonContent, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton, IonCard, IonCardContent, IonButton, IonIcon, IonBadge, IonSearchbar
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/student/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Learning Materials</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="materials-content">
      <div class="container">
        
        <!-- Search bar -->
        <div class="search-section">
          <ion-searchbar [(ngModel)]="searchTerm" (ionInput)="filterMaterials()" placeholder="Search by title or subject..." mode="ios"></ion-searchbar>
        </div>

        <!-- Materials List Section -->
        <div class="section-block">
          <h3>Available Study Resources ({{ filteredMaterials.length }})</h3>

          <div *ngIf="filteredMaterials.length === 0" class="empty-state">
            <p>No learning materials available at the moment.</p>
          </div>

          <div class="materials-grid">
            <div *ngFor="let item of filteredMaterials" class="material-card">
              <div class="card-top">
                <div class="icon-box">
                  <ion-icon name="document-text-outline"></ion-icon>
                </div>
                <ion-badge color="light" class="class-badge">{{ item.className || 'General' }}</ion-badge>
              </div>

              <div class="card-body">
                <span class="subject-tag">{{ item.subject }}</span>
                <h4>{{ item.title }}</h4>
                <p class="date-text">Added: {{ item.dateFormatted }}</p>
              </div>

              <div class="card-footer">
                <a [href]="item.fileUrl" target="_blank" class="download-btn">
                  <ion-icon name="download-outline"></ion-icon> Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .materials-content { --background: #f8fafc; }
    .container { padding: 20px; max-width: 900px; margin: 0 auto; }
    .search-section { margin-bottom: 16px; --background: #ffffff; }
    .section-block h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 14px; }

    .empty-state { background: #ffffff; padding: 24px; border-radius: 12px; text-align: center; color: #64748b; font-size: 13px; border: 1px dashed #cbd5e1; }

    /* Grid Layout */
    .materials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .material-card { background: #ffffff; border-radius: 14px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s; &:hover { transform: translateY(-2px); } }

    .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .icon-box { background: #eff6ff; color: #2563eb; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .class-badge { font-weight: 600; color: #475569; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; }

    .card-body { margin-bottom: 16px; }
    .subject-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #2563eb; background: #dbeafe; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 6px; }
    .material-card h4 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; line-height: 1.3; }
    .date-text { font-size: 12px; color: #64748b; margin: 0; }

    .card-footer { border-top: 1px solid #f1f5f9; padding-top: 12px; }
    .download-btn { display: flex; align-items: center; justify-content: center; gap: 6px; background: #eff6ff; color: #2563eb; font-weight: 600; font-size: 13px; padding: 10px; border-radius: 8px; text-decoration: none; transition: background 0.2s; &:hover { background: #dbeafe; } }
  `]
})
export class LearningMaterialsPage implements OnInit {
  allMaterials: any[] = [];
  filteredMaterials: any[] = [];
  searchTerm: string = '';

  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({ bookOutline, downloadOutline, searchOutline, documentTextOutline });
  }

  ngOnInit() {
    this.loadMaterials();
  }

  async loadMaterials() {
    try {
      const snap = await getDocs(collection(this.firestore, 'materials'));
      const items: any[] = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        let formattedDate = 'Recent';
        if (data['createdAt'] && data['createdAt'].toDate) {
          formattedDate = data['createdAt'].toDate().toLocaleDateString();
        }

        items.push({
          id: docSnap.id,
          title: data['title'] || 'Untitled Material',
          subject: data['subject'] || 'General',
          className: data['className'] || 'General',
          fileUrl: data['fileUrl'] || '#',
          dateFormatted: formattedDate,
          ...data
        });
      });

      this.allMaterials = items;
      this.filteredMaterials = items;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading learning materials:', error);
    }
  }

  filterMaterials() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredMaterials = this.allMaterials;
    } else {
      this.filteredMaterials = this.allMaterials.filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.subject.toLowerCase().includes(term) ||
        item.className.toLowerCase().includes(term)
      );
    }
  }
}