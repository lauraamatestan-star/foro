import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../foro.api';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-md px-4 py-12">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Nueva contraseña</h1>
      <form (ngSubmit)="submit()" class="card mt-6 space-y-4 p-6">
        <div>
          <label class="mb-1 block text-sm font-medium">Email</label>
          <input [(ngModel)]="email" name="email" type="email" class="input-field" required />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Token</label>
          <input [(ngModel)]="token" name="token" class="input-field" required />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Nueva contraseña</label>
          <input [(ngModel)]="password" name="password" type="password" class="input-field" required minlength="8" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Confirmar</label>
          <input [(ngModel)]="password_confirmation" name="password_confirmation" type="password" class="input-field" required />
        </div>
        @if (message) {
          <p class="text-sm text-emerald-600">{{ message }}</p>
        }
        @if (error) {
          <p class="text-sm text-red-600">{{ error }}</p>
        }
        <button type="submit" class="btn-primary w-full" [disabled]="loading">Restablecer</button>
      </form>
      <a routerLink="/login" class="mt-4 inline-block text-sm text-brand-600 hover:underline">← Login</a>
    </div>
  `,
})
export class ResetPage implements OnInit {
  email = '';
  token = '';
  password = '';
  password_confirmation = '';
  message = '';
  error = '';
  loading = false;

  constructor(
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  submit(): void {
    this.loading = true;
    this.error = '';
    this.auth
      .resetPassword({
        email: this.email,
        token: this.token,
        password: this.password,
        password_confirmation: this.password_confirmation,
      })
      .subscribe({
        next: (res) => {
          this.message = res.message;
          this.loading = false;
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al restablecer';
          this.loading = false;
        },
      });
  }
}

