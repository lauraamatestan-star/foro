import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './foro.api';

/** Rutas del foro — cada pantalla está en la carpeta pages/ */
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/feed.page').then((m) => m.FeedPage) },
  { path: 'login', loadComponent: () => import('./pages/login.page').then((m) => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register.page').then((m) => m.RegisterPage) },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot.page').then((m) => m.ForgotPage) },
  { path: 'reset-password', loadComponent: () => import('./pages/reset.page').then((m) => m.ResetPage) },
  { path: 'auth/callback', loadComponent: () => import('./pages/google.page').then((m) => m.GooglePage) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./pages/profile.page').then((m) => m.ProfilePage) },
  { path: 'users/:id', loadComponent: () => import('./pages/user.page').then((m) => m.UserPage) },
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./pages/admin.page').then((m) => m.AdminPage) },
  { path: 'threads/new', canActivate: [authGuard], loadComponent: () => import('./pages/thread-new.page').then((m) => m.ThreadNewPage) },
  { path: 'threads/:id', loadComponent: () => import('./pages/thread.page').then((m) => m.ThreadPage) },
  { path: 'legal/privacy', loadComponent: () => import('./pages/legal.page').then((m) => m.LegalPage), data: { page: 'privacy' } },
  { path: 'legal/terms', loadComponent: () => import('./pages/legal.page').then((m) => m.LegalPage), data: { page: 'terms' } },
  { path: '**', redirectTo: '' },
];
