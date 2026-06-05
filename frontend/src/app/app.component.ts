import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './foro.api';
import { ThemeToggleComponent } from './foro.ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FormsModule, ThemeToggleComponent],
  template: `
    <header class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <a routerLink="/" class="flex items-center gap-2 font-bold tracking-tight text-slate-900 dark:text-white">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">FC</span>
          Foro Comunidad
        </a>
        <form (ngSubmit)="search()" class="hidden min-w-[12rem] flex-1 max-w-xs sm:flex">
          <input [(ngModel)]="searchQ" name="q" class="input-field py-1.5 text-sm" placeholder="Buscar..." />
        </form>
        <nav class="flex items-center gap-2 sm:gap-4">
          <app-theme-toggle />
          @if (auth.isAuthenticated()) {
            <a routerLink="/threads/new" class="btn-primary text-sm">+ Nuevo hilo</a>
            <a routerLink="/profile" routerLinkActive="text-brand-600" class="btn-ghost hidden sm:inline-flex">Perfil</a>
            <button type="button" (click)="logout()" class="text-sm font-medium text-red-600 hover:underline dark:text-red-400">Salir</button>
          } @else {
            <a routerLink="/login" class="btn-ghost">Entrar</a>
            <a routerLink="/register" class="btn-primary hidden sm:inline-flex">Registro</a>
          }
        </nav>
      </div>
    </header>
    <main class="min-h-[calc(100vh-4rem)]">
      <router-outlet />
    </main>
    <footer class="border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800">
      <a routerLink="/legal/privacy" class="hover:text-brand-600">Privacidad</a>
      <span class="mx-2">·</span>
      <a routerLink="/legal/terms" class="hover:text-brand-600">Términos</a>
    </footer>
  `,
})
export class AppComponent {
  searchQ = '';

  constructor(
    public readonly auth: AuthService,
    private readonly router: Router
  ) {}

  search(): void {
    const q = this.searchQ.trim();
    this.router.navigate(['/'], { queryParams: q ? { q } : {} });
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
