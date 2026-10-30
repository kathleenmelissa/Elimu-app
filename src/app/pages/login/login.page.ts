import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonCard, IonItem, IonInput, IonButton } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonCard, 
    IonItem, 
    IonInput, 
    IonButton
  ],
  template: `
    <ion-content class="login-content">
      <div class="login-container">
        <ion-card class="login-card">
          <h2>Elimu Portal Login</h2>
          
          <form (ngSubmit)="onLogin()">
            <ion-item lines="outline" class="input-item">
              <ion-input type="email" [(ngModel)]="email" name="email" placeholder="Email Address" required></ion-input>
            </ion-item>

            <ion-item lines="outline" class="input-item">
              <ion-input type="password" [(ngModel)]="password" name="password" placeholder="Password" required></ion-input>
            </ion-item>

            <ion-button type="submit" expand="block" class="login-btn" [disabled]="loading">
              {{ loading ? 'Signing In...' : 'Login' }}
            </ion-button>

            <p *ngIf="errorMessage" class="error-text">{{ errorMessage }}</p>
          </form>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-content { --background: #f8fafc; }
    .login-container { display: flex; align-items: center; justify-content: center; height: 100vh; padding: 20px; }
    .login-card { width: 100%; max-width: 400px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 24px; text-align: center; }
    .input-item { margin-bottom: 16px; --background: #ffffff; --border-radius: 8px; }
    .login-btn { --background: #2563eb; --border-radius: 8px; height: 44px; font-weight: 600; margin-top: 20px; }
    .error-text { color: #dc2626; font-size: 13px; text-align: center; margin-top: 12px; }
  `]
})
export class LoginPage {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  async onLogin() {
    this.errorMessage = '';

    // Quick validation
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.loading = true;

    try {
      const cleanEmail = this.email.trim();
      const userProfile = await this.authService.login(cleanEmail, this.password);
      const userRole = (userProfile.role || '').toLowerCase().trim();

      console.log('Navigating for role:', userRole);

      // Determine destination route based on role
      let destinationSegments = ['/student', 'home'];
      if (userRole === 'admin') {
        destinationSegments = ['/admin', 'home'];
      } else if (userRole === 'teacher') {
        destinationSegments = ['/teacher', 'home'];
      } else if (userRole === 'accountant') {
        destinationSegments = ['/accountant', 'home'];
      } else if (userRole === 'student') {
        destinationSegments = ['/student', 'home'];
      }

      // Reset loading state BEFORE navigation so UI unfreezes immediately
      this.loading = false;

      // Navigate using route segments
      await this.router.navigate(destinationSegments);

    } catch (error: any) {
      console.log('Login error caught:', error);
      this.loading = false;
      this.errorMessage = error?.message || 'Invalid email or password.';
    }
  }
}