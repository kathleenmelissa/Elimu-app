
import {
  Component,
  AfterViewInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
  ElementRef,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButtons,
  IonMenuButton,
  IonSpinner,
  MenuController
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  walletOutline,
  receiptOutline,
  statsChartOutline,
  logOutOutline
} from 'ionicons/icons';

import {
  Auth,
  User,
  onAuthStateChanged,
  signOut
} from '@angular/fire/auth';

import {
  Firestore,
  collection,
  getDocs
} from '@angular/fire/firestore';


interface CategoryRow {
  category: string;
  amount: number;
  percentage: number;
}


@Component({
  selector: 'app-accountant-analytics',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,

    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButtons,
    IonMenuButton,
    IonSpinner
  ],

  template: `
    <ion-split-pane content-id="analytics-main-content">

      <!-- Sidebar -->
      <ion-menu
        content-id="analytics-main-content"
        menuId="accountant-menu"
        side="start">

        <ion-header>
          <ion-toolbar class="sidebar-toolbar">

            <div class="brand-container">

              <ion-icon
                name="wallet-outline"
                class="brand-icon">
              </ion-icon>

              <ion-title class="brand-title">
                Finance Portal
              </ion-title>

            </div>

          </ion-toolbar>
        </ion-header>

        <ion-content class="sidebar-content">

          <ion-list lines="none" class="nav-list">

            <ion-item
              routerLink="/accountant/dashboard"
              routerDirection="root"
              routerLinkActive="active-link"
              class="nav-item">

              <ion-icon
                name="wallet-outline"
                slot="start">
              </ion-icon>

              <ion-label>
                Fee Management
              </ion-label>

            </ion-item>

            <ion-item
              routerLink="/accountant/expenses"
              routerDirection="root"
              routerLinkActive="active-link"
              class="nav-item">

              <ion-icon
                name="receipt-outline"
                slot="start">
              </ion-icon>

              <ion-label>
                School Expenses
              </ion-label>

            </ion-item>

            <ion-item
              routerLink="/accountant/analytics"
              routerDirection="root"
              routerLinkActive="active-link"
              class="nav-item">

              <ion-icon
                name="stats-chart-outline"
                slot="start">
              </ion-icon>

              <ion-label>
                Financial Analytics
              </ion-label>

            </ion-item>

            <ion-item
              button
              (click)="logout()"
              class="nav-item logout-item">

              <ion-icon
                name="log-out-outline"
                slot="start"
                color="danger">
              </ion-icon>

              <ion-label color="danger">
                Logout
              </ion-label>

            </ion-item>

          </ion-list>

        </ion-content>

      </ion-menu>


      <!-- Main Content -->
      <ion-content
        id="analytics-main-content"
        class="main-content-wrapper">

        <ion-header>

          <ion-toolbar class="header-gradient-toolbar">

            <ion-buttons slot="start">

              <!-- Ionic handles the menu toggle automatically -->
              <ion-menu-button
                menu="accountant-menu"
                class="menu-btn">
              </ion-menu-button>

            </ion-buttons>

            <ion-title>
              Financial Analytics & Performance
            </ion-title>

          </ion-toolbar>

        </ion-header>


        <div class="content-body">

          <!-- Loading -->
          <div
            *ngIf="isLoading"
            class="loading-box">

            <ion-spinner name="crescent"></ion-spinner>

            <span>
              Calculating financial metrics and rendering charts...
            </span>

          </div>


          <!-- Error -->
          <div
            *ngIf="!isLoading && loadError"
            class="error-box">

            {{ loadError }}

            <button
              class="retry-button"
              (click)="calculateAnalytics()">

              Retry

            </button>

          </div>


          <!-- Analytics -->
          <div
            *ngIf="!isLoading && !loadError">

            <!-- Summary Cards -->
            <div class="stats-grid">

              <div class="stat-card">

                <span class="stat-label">
                  Total Fee Revenue Collected
                </span>

                <span
                  class="stat-value"
                  style="color: #16A34A;">

                  KES {{ totalRevenue.toLocaleString() }}

                </span>

              </div>


              <div class="stat-card">

                <span class="stat-label">
                  Total Outstanding Balances
                </span>

                <span
                  class="stat-value"
                  style="color: #DC2626;">

                  KES {{ totalOutstanding.toLocaleString() }}

                </span>

              </div>


              <div class="stat-card">

                <span class="stat-label">
                  Total Approved Expenses
                </span>

                <span
                  class="stat-value"
                  style="color: #D97706;">

                  KES {{ totalExpenses.toLocaleString() }}

                </span>

              </div>


              <div class="stat-card">

                <span class="stat-label">
                  Net Fiscal Position
                </span>

                <span
                  class="stat-value"
                  [style.color]="netPosition >= 0 ? '#16A34A' : '#DC2626'">

                  KES {{ netPosition.toLocaleString() }}

                </span>

              </div>

            </div>


            <!-- Charts -->
            <div class="charts-grid">

              <!-- Fiscal Performance -->
              <div class="card">

                <div class="card-title">
                  Fiscal Performance Overview
                </div>

                <div class="chart-container">

                  <canvas #overviewCanvas></canvas>

                </div>

              </div>


              <!-- Expense Distribution -->
              <div class="card">

                <div class="card-title">
                  Expense Distribution by Category
                </div>

                <div class="donut-wrap">

                  <div class="chart-container donut">

                    <canvas #expenseCanvas></canvas>

                  </div>


                  <ul
                    class="legend"
                    *ngIf="categoryBreakdown.length > 0">

                    <li
                      *ngFor="let cat of categoryBreakdown; let i = index">

                      <span
                        class="dot"
                        [style.background]="colorFor(i)">
                      </span>

                      <span class="legend-name">
                        {{ cat.category }}
                      </span>

                      <span class="legend-val">

                        KES {{ cat.amount.toLocaleString() }}

                      </span>

                    </li>

                  </ul>


                  <p
                    class="empty-chart"
                    *ngIf="categoryBreakdown.length === 0">

                    No approved expenses recorded yet.

                  </p>

                </div>

              </div>

            </div>


            <!-- Expense Breakdown Table -->
            <div class="card">

              <div class="card-title">
                Approved Expense Breakdown Details
              </div>

              <div class="table-container">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Expense Category
                      </th>

                      <th>
                        Total Disbursed (KES)
                      </th>

                      <th>
                        Percentage of Total Expenses
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    <tr
                      *ngIf="categoryBreakdown.length === 0">

                      <td
                        colspan="3"
                        class="empty-table">

                        No approved expense categories recorded yet.

                      </td>

                    </tr>


                    <tr
                      *ngFor="let cat of categoryBreakdown">

                      <td>
                        <strong>{{ cat.category }}</strong>
                      </td>

                      <td>
                        KES {{ cat.amount.toLocaleString() }}
                      </td>

                      <td>
                        {{ cat.percentage }}%
                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </div>

      </ion-content>

    </ion-split-pane>
  `,


  styles: [`

    ion-menu {
      --width: 260px;
    }

    .sidebar-toolbar {
      --background: #0F172A;
      --color: #2563EB;
      padding: 6px 12px;
    }

    .brand-container {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
    }

    .brand-icon {
      font-size: 24px;
      color: #3880ff;
      flex-shrink: 0;
    }

    .brand-title {
      font-size: 16px;
      font-weight: 700;
      color: #FFFFFF;
      padding: 0;
      min-height: unset;
    }

    .sidebar-content {
      --background: #0F172A;
    }

    .nav-list {
      background: transparent;
      padding: 8px 0;
    }

    .nav-item {
      --background: transparent;
      --background-hover: rgba(255, 255, 255, 0.06);
      --color: #94A3B8;

      font-weight: 500;
      font-size: 14px;

      margin-bottom: 2px;
      --padding-start: 12px;
    }

    .active-link {
      --background: rgba(255, 255, 255, 0.08) !important;
      --color: #FFFFFF !important;

      font-weight: 600;

      border-left: 4px solid #2563EB;
    }

    .logout-item {
      margin-top: 12px;
    }


    /* Header */
    .header-gradient-toolbar {
      --background: linear-gradient(
        135deg,
        #1e3a8a 0%,
        #2563eb 50%,
        #3b82f6 100%
      );

      --color: #ffffff;
    }

    .menu-btn {
      color: #ffffff;
    }

    .main-content-wrapper {
      --background: #F8FAFC;
    }


    /* Main content */
    .content-body {
      padding: 2rem;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
    }


    /* Loading */
    .loading-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;

      text-align: center;
      padding: 4rem 1rem;

      color: #64748B;
      font-size: 14px;
    }


    /* Errors */
    .error-box {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      color: #DC2626;

      padding: 1rem 1.25rem;
      border-radius: 10px;

      font-size: 14px;
    }

    .retry-button {
      display: block;
      margin-top: 12px;

      background: #2563EB;
      color: white;

      border: none;
      border-radius: 6px;

      padding: 8px 16px;
      cursor: pointer;
    }


    /* Summary cards */
    .stats-grid {
      display: grid;

      grid-template-columns: repeat(
        auto-fit,
        minmax(220px, 1fr)
      );

      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 10px;

      padding: 1.25rem;

      box-shadow: 0 1px 3px rgba(0,0,0,0.02);

      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      min-width: 0;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #64748B;
      font-weight: 500;
    }

    .stat-value {
      font-size: 1.4rem;
      font-weight: 700;
      color: #0F172A;

      overflow-wrap: anywhere;
    }


    /* Charts layout */
    .charts-grid {
      display: grid;

      grid-template-columns: repeat(
        auto-fit,
        minmax(320px, 1fr)
      );

      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .charts-grid .card {
      margin-bottom: 0;
      min-width: 0;
    }


    /* Cards */
    .card {
      background-color: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 10px;

      padding: 1.5rem;

      box-shadow: 0 1px 3px rgba(0,0,0,0.02);

      margin-bottom: 1.5rem;
    }

    .card-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: #0F172A;

      margin-bottom: 1rem;
    }


    /* Canvas fixes */
    .chart-container {
      position: relative;

      display: block;
      width: 100%;

      height: 280px;
      min-height: 280px;

      overflow: hidden;
    }

    .chart-container canvas {
      display: block;

      width: 100% !important;
      height: 100% !important;

      max-width: 100%;
    }

    .chart-container.donut {
      flex: 1 1 200px;

      min-width: 200px;

      height: 240px;
      min-height: 240px;
    }


    /* Donut and legend */
    .donut-wrap {
      display: flex;
      flex-wrap: wrap;

      align-items: center;
      gap: 1rem;
    }

    .legend {
      flex: 1 1 180px;

      list-style: none;

      margin: 0;
      padding: 0;

      display: flex;
      flex-direction: column;

      gap: 8px;

      min-width: 0;
    }

    .legend li {
      display: flex;
      align-items: center;
      gap: 8px;

      font-size: 13px;
      color: #334155;
    }

    .dot {
      width: 10px;
      height: 10px;

      border-radius: 50%;
      flex-shrink: 0;
    }

    .legend-name {
      flex: 1;
      min-width: 0;

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .legend-val {
      font-weight: 600;
      color: #0F172A;
      white-space: nowrap;
    }

    .empty-chart {
      flex: 1 1 180px;

      color: #64748B;
      font-size: 13px;

      margin: 0;
    }


    /* Table */
    .table-container {
      width: 100%;
      overflow-x: auto;

      border: 1px solid #E2E8F0;
      border-radius: 10px;

      margin-top: 1rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;

      text-align: left;
      font-size: 0.85rem;
    }

    th {
      background-color: #F8FAFC;
      color: #64748B;

      font-weight: 600;

      padding: 0.85rem;

      border-bottom: 1px solid #E2E8F0;

      white-space: nowrap;
    }

    td {
      padding: 0.85rem;

      border-bottom: 1px solid #E2E8F0;

      color: #1E293B;
      vertical-align: middle;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .empty-table {
      text-align: center;
      color: #64748B;
      padding: 1.5rem;
    }


    /* Mobile */
    @media (max-width: 576px) {

      .content-body {
        padding: 1rem;
      }

      .card {
        padding: 1.1rem;
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .chart-container {
        height: 240px;
        min-height: 240px;
      }

    }

  `]

})


export class AccountantAnalyticsPage
  implements AfterViewInit, OnDestroy {


  // ------------------------------------
  // Page state
  // ------------------------------------

  isLoading = true;

  loadError = '';

  totalRevenue = 0;

  totalOutstanding = 0;

  totalExpenses = 0;

  netPosition = 0;

  categoryBreakdown: CategoryRow[] = [];


  // ------------------------------------
  // Canvas references
  // ------------------------------------

  @ViewChild('overviewCanvas')
  overviewCanvas?: ElementRef<HTMLCanvasElement>;

  @ViewChild('expenseCanvas')
  expenseCanvas?: ElementRef<HTMLCanvasElement>;


  // ------------------------------------
  // Chart colours
  // ------------------------------------

  private readonly palette = [
    '#2563EB',
    '#16A34A',
    '#D97706',
    '#DC2626',
    '#8B5CF6',
    '#EC4899',
    '#0891B2',
    '#64748B'
  ];


  // ------------------------------------
  // Chart lifecycle
  // ------------------------------------

  private observer?: ResizeObserver;

  private rafId = 0;

  private renderTimeout?: ReturnType<typeof setTimeout>;


  // ------------------------------------
  // Services
  // ------------------------------------

  private auth = inject(Auth);

  private firestore = inject(Firestore);

  private cdr = inject(ChangeDetectorRef);

  private router = inject(Router);

  private menuCtrl = inject(MenuController);


  constructor() {

    addIcons({
      walletOutline,
      receiptOutline,
      statsChartOutline,
      logOutOutline
    });

  }


  // ------------------------------------
  // Ionic lifecycle
  // ------------------------------------

  async ionViewWillEnter() {

    await this.menuCtrl.enable(
      true,
      'accountant-menu'
    );

    const user = await this.waitForUser();

    if (!user) {

      this.router.navigate(['/login']);

      return;

    }

    await this.calculateAnalytics();

  }


  async ionViewDidEnter() {

    // Wait for Ionic page transitions and layout
    await new Promise(resolve => setTimeout(resolve, 100));

    this.scheduleRender();

  }


  // ------------------------------------
  // Angular lifecycle
  // ------------------------------------

  ngAfterViewInit() {

    this.attachObserver();

    this.scheduleRender();

  }


  ngOnDestroy() {

    this.detachObserver();

  }


  // ------------------------------------
  // Chart colours
  // ------------------------------------

  colorFor(index: number): string {

    return this.palette[
      index % this.palette.length
    ];

  }


  // ------------------------------------
  // Resize observer
  // ------------------------------------

  private attachObserver() {

    if (this.observer) {
      return;
    }

    this.observer = new ResizeObserver(() => {

      this.scheduleRender();

    });


    const overview = this.overviewCanvas?.nativeElement;

    const expense = this.expenseCanvas?.nativeElement;


    if (overview?.parentElement) {

      this.observer.observe(
        overview.parentElement
      );

    }


    if (expense?.parentElement) {

      this.observer.observe(
        expense.parentElement
      );

    }

  }


  private detachObserver() {

    this.observer?.disconnect();

    this.observer = undefined;


    if (this.rafId) {

      cancelAnimationFrame(this.rafId);

      this.rafId = 0;

    }


    if (this.renderTimeout) {

      clearTimeout(this.renderTimeout);

      this.renderTimeout = undefined;

    }

  }


  // ------------------------------------
  // Reliable chart rendering
  // ------------------------------------

  private scheduleRender() {

    if (this.rafId) {

      cancelAnimationFrame(this.rafId);

    }


    if (this.renderTimeout) {

      clearTimeout(this.renderTimeout);

    }


    this.renderTimeout = setTimeout(() => {

      this.rafId = requestAnimationFrame(() => {

        this.rafId = 0;

        this.renderCharts();

      });

    }, 100);

  }


  renderCharts() {

    if (this.isLoading) {
      return;
    }


    const overview = this.overviewCanvas?.nativeElement;

    const expense = this.expenseCanvas?.nativeElement;


    if (overview) {

      this.drawOverview(overview);

    }


    if (expense) {

      this.drawDonut(expense);

    }

  }


  // ------------------------------------
  // Wait for authentication
  // ------------------------------------

  private waitForUser(): Promise<User | null> {

    return new Promise(resolve => {

      const unsub = onAuthStateChanged(
        this.auth,
        user => {

          unsub();

          resolve(user);

        }
      );

    });

  }


  // ------------------------------------
  // Safe numeric conversion
  // ------------------------------------

  private toNumber(value: any): number {

    if (typeof value === 'number') {

      return Number.isFinite(value)
        ? value
        : 0;

    }


    if (typeof value === 'string') {

      const cleaned = value
        .replace(/,/g, '')
        .replace(/KES/gi, '')
        .trim();


      const parsed = Number(cleaned);


      return Number.isFinite(parsed)
        ? parsed
        : 0;

    }


    return 0;

  }


  // ------------------------------------
  // Calculate analytics
  // ------------------------------------

  async calculateAnalytics() {

    this.isLoading = true;

    this.loadError = '';


    this.detachObserver();

    this.cdr.detectChanges();


    try {

      // --------------------------------
      // Student account balances
      // --------------------------------

      const balancesSnap = await getDocs(
        collection(
          this.firestore,
          'studentAccountBalances'
        )
      );


      let revenue = 0;

      let outstanding = 0;


      balancesSnap.forEach(document => {

        const data: any = document.data();


        revenue += this.toNumber(
          data.amountPaid
        );


        outstanding += this.toNumber(
          data.balance
        );

      });


      this.totalRevenue = revenue;

      this.totalOutstanding = outstanding;


      // --------------------------------
      // School expenses
      // --------------------------------

      const expensesSnap = await getDocs(
        collection(
          this.firestore,
          'schoolExpenses'
        )
      );


      let expenseTotal = 0;

      const categoryMap: {
        [key: string]: number
      } = {};


      expensesSnap.forEach(document => {

        const data: any = document.data();


        // Normalize the status to avoid
        // capitalization mismatches.
        const status = String(
          data.status || ''
        )
          .trim()
          .toLowerCase();


        const isApproved =
          status === 'approved';


        if (!isApproved) {
          return;
        }


        const amount = this.toNumber(
          data.amount
        );


        const category = String(
          data.category || 'Other'
        ).trim() || 'Other';


        if (amount <= 0) {
          return;
        }


        expenseTotal += amount;


        categoryMap[category] =
          (categoryMap[category] || 0)
          + amount;

      });


      this.totalExpenses = expenseTotal;


      // --------------------------------
      // Net position
      // --------------------------------

      this.netPosition =
        this.totalRevenue
        - this.totalExpenses;


      // --------------------------------
      // Expense category breakdown
      // --------------------------------

      this.categoryBreakdown = Object
        .keys(categoryMap)

        .map(category => ({

          category,

          amount: categoryMap[category],

          percentage: expenseTotal > 0
            ? Number(
                (
                  categoryMap[category]
                  / expenseTotal
                  * 100
                ).toFixed(1)
              )
            : 0

        }))

        .sort(
          (a, b) => b.amount - a.amount
        );


    } catch (error) {

      console.error(
        'Error computing analytics:',
        error
      );


      this.loadError =
        'Could not load the financial data. Please check your connection and try again.';


    } finally {

      this.isLoading = false;

      this.cdr.detectChanges();


      // Reattach after Angular recreates the canvases
      this.attachObserver();


      // Give the DOM time to complete layout
      this.scheduleRender();

    }

  }


  // ------------------------------------
  // Prepare canvas
  // ------------------------------------

  private prepareCanvas(
    canvas: HTMLCanvasElement
  ) {

    const rect = canvas.getBoundingClientRect();


    const width = rect.width;

    const height = rect.height;


    if (
      width <= 0 ||
      height <= 0
    ) {

      return null;

    }


    const ratio = Math.max(
      window.devicePixelRatio || 1,
      1
    );


    // Set the actual drawing buffer dimensions
    canvas.width = Math.round(
      width * ratio
    );

    canvas.height = Math.round(
      height * ratio
    );


    const ctx = canvas.getContext('2d');


    if (!ctx) {

      return null;

    }


    // Scale drawing operations to CSS pixels
    ctx.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0
    );


    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    return {
      ctx,
      width,
      height
    };

  }


  // ------------------------------------
  // Format chart numbers
  // ------------------------------------

  private compact(value: number): string {

    const abs = Math.abs(value);

    const sign = value < 0
      ? '-'
      : '';


    if (abs >= 1_000_000) {

      return `${sign}${(
        abs / 1_000_000
      ).toFixed(1)}M`;

    }


    if (abs >= 1_000) {

      return `${sign}${(
        abs / 1_000
      ).toFixed(1)}K`;

    }


    return `${sign}${Math.round(abs)}`;

  }


  // ------------------------------------
  // Fiscal performance chart
  // ------------------------------------

  private drawOverview(
    canvas: HTMLCanvasElement
  ) {

    const prep = this.prepareCanvas(
      canvas
    );


    if (!prep) {
      return;
    }


    const {
      ctx,
      width,
      height
    } = prep;


    const values = [

      this.totalRevenue,

      this.totalOutstanding,

      this.totalExpenses,

      this.netPosition

    ];


    const labels = [

      'Revenue',

      'Outstanding',

      'Expenses',

      'Net'

    ];


    const colors = [

      '#16A34A',

      '#DC2626',

      '#D97706',

      this.netPosition >= 0
        ? '#2563EB'
        : '#7F1D1D'

    ];


    const top = 30;

    const bottom = 38;

    const side = 12;


    const plotHeight =
      height - top - bottom;


    const maxValue = Math.max(
      0,
      ...values
    );


    const minValue = Math.min(
      0,
      ...values
    );


    const range =
      (maxValue - minValue) || 1;


    // Position of zero on the chart
    const zeroY =
      top
      + (maxValue / range)
      * plotHeight;


    const slotWidth =
      (width - side * 2)
      / values.length;


    const barWidth = Math.min(
      56,
      slotWidth * 0.6
    );


    // Zero baseline
    ctx.strokeStyle = '#CBD5E1';

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
      side,
      zeroY
    );

    ctx.lineTo(
      width - side,
      zeroY
    );

    ctx.stroke();


    // Draw bars
    values.forEach((value, index) => {

      const barHeight = value === 0
        ? 0
        : Math.max(
            2,
            (
              Math.abs(value)
              / range
            ) * plotHeight
          );


      const x =
        side
        + slotWidth * index
        + (
            slotWidth - barWidth
          ) / 2;


      const y = value >= 0
        ? zeroY - barHeight
        : zeroY;


      // Bar
      if (barHeight > 0) {

        ctx.fillStyle = colors[index];


        ctx.fillRect(
          x,
          y,
          barWidth,
          barHeight
        );

      }


      // Amount label
      ctx.fillStyle = '#0F172A';

      ctx.font = 'bold 11px sans-serif';

      ctx.textAlign = 'center';


      const labelY = value >= 0
        ? Math.max(
            12,
            y - 6
          )
        : Math.min(
            height - bottom + 12,
            y + barHeight + 13
          );


      ctx.fillText(
        this.compact(value),
        x + barWidth / 2,
        labelY
      );


      // Category label
      ctx.fillStyle = '#64748B';

      ctx.font = '11px sans-serif';


      ctx.fillText(
        labels[index],
        x + barWidth / 2,
        height - 8
      );

    });


    // Empty state
    if (
      values.every(value => value === 0)
    ) {

      ctx.fillStyle = '#64748B';

      ctx.font = '13px sans-serif';

      ctx.textAlign = 'center';


      ctx.fillText(
        'No financial data available',
        width / 2,
        height / 2
      );

    }

  }


  // ------------------------------------
  // Expense donut chart
  // ------------------------------------

  private drawDonut(
    canvas: HTMLCanvasElement
  ) {

    const prep = this.prepareCanvas(
      canvas
    );


    if (!prep) {
      return;
    }


    const {
      ctx,
      width,
      height
    } = prep;


    const centerX = width / 2;

    const centerY = height / 2;


    const outerRadius = Math.max(
      Math.min(width, height) / 2 - 8,
      10
    );


    const innerRadius =
      outerRadius * 0.6;


    const total =
      this.categoryBreakdown.reduce(
        (sum, category) => {

          return sum + category.amount;

        },
        0
      );


    // --------------------------------
    // Empty chart
    // --------------------------------

    if (total <= 0) {

      ctx.beginPath();

      ctx.arc(
        centerX,
        centerY,
        outerRadius,
        0,
        Math.PI * 2
      );


      ctx.arc(
        centerX,
        centerY,
        innerRadius,
        Math.PI * 2,
        0,
        true
      );


      ctx.closePath();


      ctx.fillStyle = '#E2E8F0';

      ctx.fill();


      ctx.fillStyle = '#64748B';

      ctx.font = '12px sans-serif';

      ctx.textAlign = 'center';


      ctx.fillText(
        'No expenses',
        centerX,
        centerY + 4
      );


      return;

    }


    // --------------------------------
    // Draw expense segments
    // --------------------------------

    let startAngle = -Math.PI / 2;


    this.categoryBreakdown.forEach(
      (category, index) => {

        if (category.amount <= 0) {
          return;
        }


        const endAngle =
          startAngle
          + (
              category.amount / total
            ) * Math.PI * 2;


        ctx.beginPath();


        ctx.arc(
          centerX,
          centerY,
          outerRadius,
          startAngle,
          endAngle
        );


        ctx.arc(
          centerX,
          centerY,
          innerRadius,
          endAngle,
          startAngle,
          true
        );


        ctx.closePath();


        ctx.fillStyle = this.colorFor(
          index
        );


        ctx.fill();


        ctx.strokeStyle = '#FFFFFF';

        ctx.lineWidth = 2;

        ctx.stroke();


        startAngle = endAngle;

      }
    );


    // --------------------------------
    // Center text
    // --------------------------------

    ctx.textAlign = 'center';


    ctx.fillStyle = '#0F172A';

    ctx.font = 'bold 15px sans-serif';


    ctx.fillText(
      this.compact(total),
      centerX,
      centerY + 2
    );


    ctx.fillStyle = '#64748B';

    ctx.font = '11px sans-serif';


    ctx.fillText(
      'Total (KES)',
      centerX,
      centerY + 18
    );

  }


  // ------------------------------------
  // Logout
  // ------------------------------------

  async logout() {

    try {

      await signOut(
        this.auth
      );


      this.router.navigate([
        '/login'
      ]);


    } catch (error) {

      console.error(
        'Logout error:',
        error
      );

    }

  }

}
 