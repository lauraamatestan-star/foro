import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminDashboard, AdminService, Category, ContentReport, Thread, User } from '../foro.api';

type AdminTab = 'stats' | 'users' | 'threads' | 'reports' | 'categories';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    <div class="mx-auto max-w-4xl px-4 py-8">
      <a routerLink="/profile" class="text-sm text-brand-600 hover:underline">← Perfil</a>
      <h1 class="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Panel de administración</h1>

      <div class="mt-4 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800">
        @for (t of tabs; track t.id) {
          <button type="button" class="px-3 py-2 text-sm" [class.text-brand-600]="tab === t.id" (click)="tab = $any(t.id); loadTab()">{{ t.label }}</button>
        }
      </div>

      @if (tab === 'stats' && dashboard) {
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="card p-4"><p class="text-2xl font-bold">{{ dashboard.stats.users_count }}</p><p class="text-xs text-slate-500">Usuarios</p></div>
          <div class="card p-4"><p class="text-2xl font-bold">{{ dashboard.stats.threads_count }}</p><p class="text-xs text-slate-500">Hilos</p></div>
          <div class="card p-4"><p class="text-2xl font-bold">{{ dashboard.stats.replies_count }}</p><p class="text-xs text-slate-500">Respuestas</p></div>
          <div class="card p-4"><p class="text-2xl font-bold">{{ dashboard.stats.reports_pending }}</p><p class="text-xs text-slate-500">Reportes pendientes</p></div>
        </div>
      }

      @if (tab === 'users') {
        <div class="mt-4 space-y-2">
          @for (u of users; track u.id) {
            <div class="card flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <div>
                <p class="font-medium">{{ u.name }} · {{ u.email }}</p>
                <p class="text-xs text-slate-500">Karma {{ u.karma }} @if (u.is_admin) { · Admin }</p>
              </div>
              @if (!u.is_admin) {
                <button type="button" class="btn-ghost text-xs text-red-600" (click)="ban(u.id)">Suspender</button>
              }
            </div>
          }
        </div>
      }

      @if (tab === 'threads') {
        <div class="mt-4 space-y-2">
          @for (t of adminThreads; track t.id) {
            <div class="card flex justify-between gap-2 p-3 text-sm">
              <a [routerLink]="['/threads', t.id]" class="font-medium hover:text-brand-600">{{ t.title }}</a>
              <button type="button" class="text-xs text-red-600" (click)="deleteThread(t.id)">Eliminar</button>
            </div>
          }
        </div>
      }

      @if (tab === 'reports') {
        <div class="mt-4 space-y-2">
          @for (r of reports; track r.id) {
            <div class="card p-3 text-sm">
              <p class="font-medium">{{ r.reason }}</p>
              <p class="text-xs text-slate-500">Por {{ r.user?.name }} · {{ r.created_at | date: 'short' }}</p>
              <button type="button" class="btn-ghost mt-2 text-xs" (click)="resolveReport(r.id)">Marcar resuelto</button>
            </div>
          }
          @if (reports.length === 0) {
            <p class="text-sm text-slate-500">Sin reportes pendientes.</p>
          }
        </div>
      }

      @if (tab === 'categories') {
        <form (ngSubmit)="addCategory()" class="card mt-4 flex flex-wrap gap-2 p-4">
          <input [(ngModel)]="newCatName" name="name" class="input-field flex-1" placeholder="Nombre" required />
          <input [(ngModel)]="newCatSlug" name="slug" class="input-field flex-1" placeholder="slug" required />
          <button type="submit" class="btn-primary">Añadir</button>
        </form>
        <div class="mt-4 space-y-2">
          @for (c of categories; track c.id) {
            <div class="card flex justify-between p-3 text-sm">
              <span>{{ c.name }} ({{ c.slug }})</span>
              <button type="button" class="text-xs text-red-600" (click)="deleteCategory(c.id)">Eliminar</button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class AdminPage implements OnInit {
  tab: AdminTab = 'stats';
  dashboard: AdminDashboard | null = null;
  users: User[] = [];
  adminThreads: Thread[] = [];
  reports: ContentReport[] = [];
  categories: Category[] = [];
  newCatName = '';
  newCatSlug = '';

  readonly tabs = [
    { id: 'stats', label: 'Resumen' },
    { id: 'users', label: 'Usuarios' },
    { id: 'threads', label: 'Hilos' },
    { id: 'reports', label: 'Reportes' },
    { id: 'categories', label: 'Categorías' },
  ];

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadTab();
  }

  loadTab(): void {
    if (this.tab === 'stats') {
      this.admin.dashboard().subscribe((d) => (this.dashboard = d));
    }
    if (this.tab === 'users') {
      this.admin.users().subscribe((r) => (this.users = r.data));
    }
    if (this.tab === 'threads') {
      this.admin.threads().subscribe((r) => (this.adminThreads = r.data));
    }
    if (this.tab === 'reports') {
      this.admin.reports().subscribe((r) => (this.reports = r.data));
    }
    if (this.tab === 'categories') {
      this.admin.categories().subscribe((c) => (this.categories = c));
    }
  }

  ban(userId: number): void {
    if (!confirm('¿Suspender usuario?')) return;
    this.admin.banUser(userId).subscribe(() => this.loadTab());
  }

  deleteThread(id: number): void {
    if (!confirm('¿Eliminar hilo?')) return;
    this.admin.deleteThread(id).subscribe(() => this.loadTab());
  }

  resolveReport(id: number): void {
    this.admin.resolveReport(id).subscribe(() => this.loadTab());
  }

  addCategory(): void {
    this.admin.createCategory(this.newCatName, this.newCatSlug).subscribe(() => {
      this.newCatName = '';
      this.newCatSlug = '';
      this.loadTab();
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('¿Eliminar categoría?')) return;
    this.admin.deleteCategory(id).subscribe(() => this.loadTab());
  }
}

