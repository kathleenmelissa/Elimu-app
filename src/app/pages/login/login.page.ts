import {
  Component, inject, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonItem, IonInput, IonButton, IonIcon, IonSpinner
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, alertCircleOutline } from 'ionicons/icons';
import lottie, { AnimationItem } from 'lottie-web';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonItem, IonInput, IonButton, IonIcon, IonSpinner
  ],
  template: `
    <ion-content class="login-content" [fullscreen]="true">
      <div class="login-container">

        <!-- Left / top: animation and welcome text -->
        <section class="hero" [class.no-animation]="animationFailed">
          <div #lottieHost class="lottie-host" aria-hidden="true"></div>
          <div class="hero-text">
            <h1>Welcome to Elimu Portal</h1>
            <p>Your classes, fees, results and schedule, all in one place.</p>
          </div>
        </section>

        <!-- Right / bottom: login form -->
        <section class="form-side">
          <div class="login-card">
            <h2>Sign in</h2>
            <p class="subtitle">Use the email and password issued by your school.</p>

            <form (ngSubmit)="onLogin()" novalidate>
              <ion-item lines="outline" class="input-item">
                <ion-icon name="mail-outline" slot="start"></ion-icon>
                <ion-input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="Email address"
                  autocomplete="email"
                  inputmode="email"
                  enterkeyhint="next"
                  required></ion-input>
              </ion-item>

              <ion-item lines="outline" class="input-item">
                <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
                <ion-input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="Password"
                  autocomplete="current-password"
                  enterkeyhint="go"
                  required></ion-input>
                <ion-button
                  slot="end"
                  fill="clear"
                  type="button"
                  class="toggle-btn"
                  [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
                  (click)="showPassword = !showPassword">
                  <ion-icon slot="icon-only" [name]="showPassword ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
                </ion-button>
              </ion-item>

              <div *ngIf="errorMessage" class="error-box" role="alert">
                <ion-icon name="alert-circle-outline"></ion-icon>
                <span>{{ errorMessage }}</span>
              </div>

              <ion-button type="submit" expand="block" class="login-btn" [disabled]="loading">
                <ion-spinner *ngIf="loading" name="crescent" slot="start"></ion-spinner>
                {{ loading ? 'Signing in...' : 'Login' }}
              </ion-button>
            </form>
          </div>
        </section>

      </div>
    </ion-content>
  `,
  styles: [`
    /* Tune the look here */
    :host {
      --brand: #2563eb;
      --brand-dark: #1d4ed8;
      --ink: #0f172a;
      --muted: #64748b;
    }

    .login-content { --background: linear-gradient(160deg, #eff6ff 0%, #dbeafe 45%, #f8fafc 100%); }

    .login-container {
      min-height: 100%;
      display: grid;
      grid-template-columns: 1fr;
      align-items: center;
      gap: 8px;
      padding: 16px;
      max-width: 1100px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    /* ----- Hero (animation) ----- */
    .hero { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .lottie-host { width: 100%; max-width: 260px; aspect-ratio: 1 / 1; }
    .hero.no-animation .lottie-host { display: none; }
    .hero-text h1 { font-size: 22px; font-weight: 800; color: var(--ink); margin: 4px 0 6px; }
    .hero-text p { font-size: 14px; color: var(--muted); margin: 0; line-height: 1.5; max-width: 340px; }

    /* ----- Form card ----- */
    .form-side { display: flex; justify-content: center; }
    .login-card {
      width: 100%;
      max-width: 400px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 28px 24px;
      box-shadow: 0 10px 30px rgba(37, 99, 235, 0.12);
      animation: fadeUp 0.5s ease both;
    }
    h2 { font-size: 22px; font-weight: 800; color: var(--ink); margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: var(--muted); margin: 0 0 22px; }

    .input-item { margin-bottom: 14px; --background: #ffffff; --border-radius: 10px; --border-color: #cbd5e1; --highlight-color-focused: var(--brand); }
    .input-item ion-icon[slot="start"] { color: var(--muted); margin-inline-end: 10px; }
    .toggle-btn { --padding-start: 6px; --padding-end: 6px; margin: 0; height: 36px; color: var(--muted); }

    .error-box {
      display: flex; align-items: center; gap: 8px;
      background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
      border-radius: 10px; padding: 10px 12px; font-size: 13px; margin: 0 0 14px;
    }
    .error-box ion-icon { font-size: 18px; flex-shrink: 0; }

    .login-btn { --background: var(--brand); --background-hover: var(--brand-dark); --border-radius: 10px; height: 46px; font-weight: 600; margin: 6px 0 0; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .login-card { animation: none; }
    }

    /* ----- Wide screens: animation on the left, form on the right ----- */
    @media (min-width: 900px) {
      .login-container { grid-template-columns: 1.1fr 1fr; gap: 40px; padding: 32px; }
      .lottie-host { max-width: 440px; }
      .hero-text h1 { font-size: 30px; }
      .hero-text p { font-size: 16px; max-width: 420px; }
      .login-card { padding: 36px 32px; }
    }

    /* Short phones in landscape: keep the form reachable */
    @media (max-height: 560px) and (max-width: 899px) {
      .lottie-host { max-width: 140px; }
      .hero-text p { display: none; }
    }
  `]
})
export class LoginPage implements AfterViewInit, OnDestroy {
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';
  animationFailed = false;

  @ViewChild('lottieHost', { static: true }) lottieHost!: ElementRef<HTMLDivElement>;

  // Where the downloaded animation lives (see notes: src/assets/animations/login-blue.json)
  private readonly animationPath = 'assets/animations/login-blue.json';
  private animation?: AnimationItem;
  private reduceMotion = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, alertCircleOutline });
  }

  // ---------- Animation ----------
  ngAfterViewInit() {
    this.reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    this.animation = lottie.loadAnimation({
      container: this.lottieHost.nativeElement,
      renderer: 'svg',
      loop: !this.reduceMotion,
      autoplay: !this.reduceMotion,
      path: this.animationPath,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true }
    });

    // If the file is missing or invalid, hide the animation instead of leaving a blank gap
    this.animation.addEventListener('data_failed', () => {
      console.error(
        `[Lottie] Could not load "${this.animationPath}". ` +
        'Open this address in the browser to check: ' +
        `${window.location.origin}/${this.animationPath}  ` +
        '(a 404 means the file is in the wrong folder; text that is not JSON means it is not a .json file).'
      );
      this.animationFailed = true;
      this.cdr.detectChanges();
    });
    this.animation.addEventListener('DOMLoaded', () => console.info('[Lottie] animation loaded'));
  }

  // Ionic keeps pages alive; don't burn battery animating a page that is not visible
  ionViewWillEnter() {
    if (!this.reduceMotion) this.animation?.play();
  }

  ionViewDidLeave() {
    this.animation?.pause();
  }

  ngOnDestroy() {
    this.animation?.destroy();
    this.animation = undefined;
  }

  // ---------- Login ----------
  async onLogin() {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.loading = true;

    try {
      const cleanEmail = this.email.trim();
      const userProfile = await this.authService.login(cleanEmail, this.password);
      const userRole = (userProfile.role || '').toLowerCase().trim();

      // Reset loading state BEFORE navigation so the UI unfreezes immediately
      this.loading = false;
      this.password = '';

      await this.router.navigate(this.destinationFor(userRole));
    } catch (error: any) {
      console.error('Login error:', error);
      this.loading = false;
      this.errorMessage = this.friendlyError(error);
    }
  }

  private destinationFor(role: string): string[] {
    switch (role) {
      case 'admin':      return ['/admin', 'home'];
      case 'teacher':    return ['/teacher', 'home'];
      case 'accountant': return ['/accountant/dashboard'];
      case 'vc':         return ['/vc', 'dashboard'];
      case 'student':
      default:           return ['/student', 'home'];
    }
  }

  // Never show raw Firebase text such as "Firebase: Error (auth/invalid-credential)."
  private friendlyError(error: any): string {
    const byCode: { [code: string]: string } = {
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/user-not-found': 'Invalid email or password.',
      'auth/wrong-password': 'Invalid email or password.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled. Please contact the school administrator.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
      'auth/network-request-failed': 'Network error. Check your connection and try again.'
    };

    const code = String(error?.code || '');
    if (byCode[code]) return byCode[code];

    // Messages from your own AuthService (e.g. "Account profile not found") are fine to show
    const message = String(error?.message || '');
    if (message && !/firebase/i.test(message)) return message;

    return 'Invalid email or password.';
  }
}