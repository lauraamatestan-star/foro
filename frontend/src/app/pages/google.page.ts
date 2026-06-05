import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../foro.api';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
      @if (error) {
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
        <a routerLink="/login" class="btn-primary mt-4">Volver al login</a>
      } @else {
        <p class="text-slate-600 dark:text-slate-400">Completando inicio de sesión...</p>
      }
    </div>
  `,
})
export class GooglePage implements OnInit {
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    const err = this.route.snapshot.queryParamMap.get('error');
    if (err) {
      this.error = this.mapError(err);
      return;
    }

    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.error = 'Token de autenticación no recibido.';
      return;
    }

    this.auth.completeOAuthCallback(token).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.error = 'Error al cargar tu perfil.';
      },
    });
  }

  private mapError(code: string): string {
    const messages: Record<string, string> = {
      oauth_failed:
        'Error de conexión con Google (SSL o credenciales). Reinicia el backend con .\\scripts\\start.ps1 e inténtalo de nuevo.',
      access_denied: 'Has cancelado el inicio de sesión con Google.',
      user_create_failed: 'No se pudo crear tu cuenta. Inténtalo de nuevo.',
    };
    return messages[code] ?? 'No se pudo iniciar sesión con Google.';
  }
}

