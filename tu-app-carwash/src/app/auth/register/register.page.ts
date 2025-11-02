import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonInput, IonButton, IonItem, IonLabel, IonText, IonToast, IonIcon, IonRouterLink } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonInput, IonButton, IonItem, IonLabel, IonText, IonToast, IonIcon, IonRouterLink, CommonModule, ReactiveFormsModule, RouterLink]
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  isLoading = false;
  errorMessage = '';

  @ViewChild('nameInput', { static: false }) nameInput!: IonInput;

  ngAfterViewInit(): void {
    // Mover el foco al primer campo al entrar a la página para evitar que el foco quede en el enlace de la página anterior
    setTimeout(() => this.nameInput?.setFocus(), 0);
  }

  onNavLinkClick(event?: Event) {
    const el = (event?.currentTarget as HTMLElement) || (document.activeElement as HTMLElement | null);
    if (el && typeof el.blur === 'function') {
      el.blur();
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('password_confirmation');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message;
        }
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToLogin(event?: Event) {
    this.onNavLinkClick(event);
    setTimeout(() => this.router.navigate(['/auth/login']), 0);
  }
}
