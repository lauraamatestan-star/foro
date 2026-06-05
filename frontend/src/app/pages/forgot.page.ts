import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../foro.api';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-md px-4 py-12">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Recuperar contraseña</h1>
      <p class="mt-2 text-sm text-slate-500">Te enviaremos un token para restablecerla (en desarrollo aparece en pantalla).</p>
      <form (ngSubmit)="submit()" class="card mt-6 space-y-4 p-6">
        <div>
          <label class="mb-1 block text-sm font-medium">Email</label>
          <input [(ngModel)]="email" name="email" type="email" class="input-field" required />
        </div>
        @if (message) {
          <p class="text-sm text-emerald-600">{{ message }}</p>
        }
        @if (debugToken) {
          <p class="rounded bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            Token (solo dev): <strong>{{ debugToken }}</strong><br />
            <a routerLink="/reset-password" [queryParams]="{ email, token: debugToken }" class="underline">Ir a restablecer</a>
          </p>
        }
        @if (error) {
          <p class="text-sm text-red-600">{{ error }}</p>
        }
        <button type="submit" class="btn-primary w-full" [disabled]="loading">Enviar</button>
      </form>
      <a routerLink="/login" class="mt-4 inline-block text-sm text-brand-600 hover:underline">← Volver al login</a>
    </div>
  `,
})
export class ForgotPage {
  email = '';
  message = '';
  error = '';
  debugToken = '';
  loading = false;

  constructor(private readonly auth: AuthService) {}

  submit(): void {
    this.loading = true;
    this.error = '';
    this.message = '';
    this.debugToken = '';
    this.auth.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.message = res.message;
        this.debugToken = res.debug_token ?? '';
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo procesar la solicitud';
        this.loading = false;
      },
    });
  }
}

