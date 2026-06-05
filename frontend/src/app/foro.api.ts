/**
 * foro.api.ts — Toda la lógica de datos del foro.
 * Tipos, servicios HTTP, guards de rutas e interceptor de autenticación en un solo módulo.
 */

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  tap,
  firstValueFrom,
} from 'rxjs';
import { environment } from '../environments/environment';

// ─── Tipos de usuario ───────────────────────────────────────────────────────

export type UserRank = 'Novato' | 'Colaborador' | 'Leyenda';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  banner?: string | null;
  karma?: number;
  rank?: UserRank;
  provider?: string;
  is_admin?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ProfileStats {
  threads_count: number;
  replies_count: number;
  karma: number;
  rank: UserRank;
}

export interface ProfileResponse {
  user: User;
  stats: ProfileStats;
}

export interface PublicUser {
  id: number;
  name: string;
  avatar?: string | null;
  banner?: string | null;
  karma: number;
  rank: UserRank | string;
  created_at: string;
}

export interface PublicUserProfile {
  user: PublicUser;
  stats: { threads_count: number; replies_count: number; karma: number; rank: string };
}

// ─── Tipos de hilos y categorías ────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export type ThreadSort = 'recent' | 'top' | 'unresolved';

export interface Thread {
  id: number;
  title: string;
  body: string;
  user_id: number;
  category_id: number;
  upvotes: number;
  downvotes: number;
  views: number;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  user?: Pick<User, 'id' | 'name' | 'avatar' | 'karma' | 'rank'>;
  category?: Category;
  replies_count?: number;
  is_bookmarked?: boolean;
  user_vote?: 1 | -1 | null;
}

export interface PaginatedThreads {
  data: Thread[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface VoteResult {
  upvotes: number;
  downvotes: number;
  score: number;
  user_vote: 1 | -1 | null;
}

export interface CreateThreadPayload {
  title: string;
  body: string;
  category_id: number;
}

// ─── Tipos de respuestas ────────────────────────────────────────────────────

export interface Reply {
  id: number;
  body: string;
  user_id: number;
  thread_id: number;
  parent_id?: number | null;
  is_best: boolean;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  user?: Pick<User, 'id' | 'name' | 'avatar' | 'karma' | 'rank'>;
  children?: Reply[];
  user_vote?: 1 | -1 | null;
  thread?: { id: number; title: string };
}

// ─── Tipos de administración ────────────────────────────────────────────────

export interface AdminDashboard {
  stats: {
    users_count: number;
    threads_count: number;
    replies_count: number;
    reports_pending: number;
  };
}

export interface ContentReport {
  id: number;
  reason: string;
  status: string;
  created_at: string;
  user?: { id: number; name: string; email: string };
  reportable?: { id: number; title?: string; body?: string };
}

// ─── Tema ───────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark';

// ─── AuthService ────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = 'foro_token';
  private readonly userKey = 'foro_user';

  readonly user$ = new BehaviorSubject<User | null>(null);

  constructor(private readonly http: HttpClient) {
    const stored = localStorage.getItem(this.userKey);
    if (stored) {
      try {
        this.user$.next(JSON.parse(stored) as User);
      } catch {
        this.clearSession();
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => this.persistSession(res))
    );
  }

  register(data: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((res) => this.persistSession(res))
    );
  }

  /** Inicia el flujo OAuth redirigiendo al backend (Socialite). */
  redirectToGoogle(): void {
    window.location.href = `${this.apiUrl}/auth/google/redirect`;
  }

  /** Completa sesión tras callback OAuth (?token=...). */
  completeOAuthCallback(token: string): Observable<User> {
    localStorage.setItem(this.tokenKey, token);
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`).pipe(
      map((res) => res.user),
      tap((user) => {
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.user$.next(user);
      })
    );
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of({ message: 'ok' });
      })
    );
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  isAdmin(): boolean {
    return !!this.user$.value?.is_admin;
  }

  /** Valida token al arrancar la app. */
  validateSession(): Promise<void> {
    if (!this.token) {
      return Promise.resolve();
    }
    return firstValueFrom(
      this.http.get<ProfileResponse>(`${this.apiUrl}/profile`).pipe(
        tap((res) => {
          localStorage.setItem(this.userKey, JSON.stringify(res.user));
          this.user$.next(res.user);
        }),
        catchError(() => {
          this.clearSession();
          return of(null);
        }),
        map(() => undefined)
      )
    );
  }

  forgotPassword(email: string): Observable<{ message: string; debug_token?: string; debug_email?: string }> {
    return this.http.post<{ message: string; debug_token?: string; debug_email?: string }>(
      `${this.apiUrl}/password/forgot`,
      { email }
    );
  }

  resetPassword(payload: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/password/reset`, payload);
  }

  private persistSession(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userKey, JSON.stringify(res.user));
    this.user$.next(res.user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user$.next(null);
  }
}

// ─── ThreadService ────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ThreadService {
  private readonly base = `${environment.apiUrl}/threads`;

  constructor(private readonly http: HttpClient) {}

  list(
    page = 1,
    sort: ThreadSort = 'recent',
    options?: { categoryId?: number | null; q?: string }
  ): Observable<PaginatedThreads> {
    let params = new HttpParams().set('page', page).set('sort', sort);
    if (options?.categoryId) {
      params = params.set('category_id', options.categoryId);
    }
    if (options?.q?.trim()) {
      params = params.set('q', options.q.trim());
    }
    return this.http.get<PaginatedThreads>(this.base, { params });
  }

  get(id: number): Observable<Thread> {
    return this.http.get<Thread>(`${this.base}/${id}`);
  }

  create(payload: CreateThreadPayload): Observable<Thread> {
    return this.http.post<Thread>(this.base, payload);
  }

  update(
    threadId: number,
    payload: Partial<CreateThreadPayload>
  ): Observable<Thread> {
    return this.http.put<Thread>(`${this.base}/${threadId}`, payload);
  }

  delete(threadId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${threadId}`);
  }

  vote(threadId: number, value: 1 | -1): Observable<VoteResult> {
    return this.http.post<VoteResult>(`${this.base}/${threadId}/vote`, { value });
  }

  bookmark(threadId: number): Observable<{ is_bookmarked: boolean }> {
    return this.http.post<{ is_bookmarked: boolean }>(`${this.base}/${threadId}/bookmark`, {});
  }

  unbookmark(threadId: number): Observable<{ is_bookmarked: boolean }> {
    return this.http.delete<{ is_bookmarked: boolean }>(`${this.base}/${threadId}/bookmark`);
  }
}

// ─── ReplyService ─────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ReplyService {
  constructor(private readonly http: HttpClient) {}

  list(threadId: number): Observable<Reply[]> {
    return this.http.get<Reply[]>(`${environment.apiUrl}/threads/${threadId}/replies`);
  }

  create(threadId: number, body: string, parentId?: number): Observable<Reply> {
    return this.http.post<Reply>(`${environment.apiUrl}/threads/${threadId}/replies`, {
      body,
      parent_id: parentId ?? null,
    });
  }

  markBest(replyId: number): Observable<Reply> {
    return this.http.post<Reply>(`${environment.apiUrl}/replies/${replyId}/best`, {});
  }

  vote(replyId: number, value: 1 | -1): Observable<VoteResult> {
    return this.http.post<VoteResult>(`${environment.apiUrl}/replies/${replyId}/vote`, { value });
  }

  update(replyId: number, body: string): Observable<Reply> {
    return this.http.put<Reply>(`${environment.apiUrl}/replies/${replyId}`, { body });
  }

  delete(replyId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/replies/${replyId}`);
  }
}

// ─── ProfileService ───────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly base = `${environment.apiUrl}/profile`;

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.base);
  }

  update(data: Partial<Pick<User, 'name' | 'email' | 'avatar'>>): Observable<User> {
    return this.http.put<User>(this.base, data);
  }

  updateImages(avatar?: File, banner?: File): Observable<User> {
    const form = new FormData();
    if (avatar) form.append('avatar', avatar);
    if (banner) form.append('banner', banner);
    return this.http.post<User>(`${this.base}/update-images`, form);
  }

  myThreads(page = 1): Observable<PaginatedThreads> {
    return this.http.get<PaginatedThreads>(`${this.base}/threads`, { params: { page } });
  }

  myReplies(page = 1): Observable<{ data: Reply[]; current_page: number; last_page: number }> {
    return this.http.get<{ data: Reply[]; current_page: number; last_page: number }>(
      `${this.base}/replies`,
      { params: { page } }
    );
  }

  bookmarks(page = 1): Observable<PaginatedThreads> {
    return this.http.get<PaginatedThreads>(`${this.base}/bookmarks`, { params: { page } });
  }

  updatePassword(current_password: string, password: string, password_confirmation: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/password`, {
      current_password,
      password,
      password_confirmation,
    });
  }

  deleteAccount(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.base);
  }
}

// ─── CategoryService ──────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }
}

// ─── UserService ──────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly http: HttpClient) {}

  getProfile(userId: number): Observable<PublicUserProfile> {
    return this.http.get<PublicUserProfile>(`${environment.apiUrl}/users/${userId}`);
  }

  getThreads(userId: number, page = 1): Observable<PaginatedThreads> {
    return this.http.get<PaginatedThreads>(`${environment.apiUrl}/users/${userId}/threads`, {
      params: { page },
    });
  }
}

// ─── AdminService ───────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = `${environment.apiUrl}/admin`;

  constructor(private readonly http: HttpClient) {}

  dashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.base}/dashboard`);
  }

  users(page = 1): Observable<{ data: User[]; current_page: number; last_page: number }> {
    return this.http.get<{ data: User[]; current_page: number; last_page: number }>(
      `${this.base}/users`,
      { params: { page } }
    );
  }

  banUser(userId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/users/${userId}/ban`, {});
  }

  unbanUser(userId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/users/${userId}/unban`, {});
  }

  threads(page = 1): Observable<PaginatedThreads> {
    return this.http.get<PaginatedThreads>(`${this.base}/threads`, { params: { page } });
  }

  deleteThread(threadId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/threads/${threadId}`);
  }

  reports(page = 1): Observable<{ data: ContentReport[]; current_page: number; last_page: number }> {
    return this.http.get<{ data: ContentReport[]; current_page: number; last_page: number }>(
      `${this.base}/reports`,
      { params: { page } }
    );
  }

  resolveReport(reportId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/reports/${reportId}/resolve`, {});
  }

  categories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  createCategory(name: string, slug: string): Observable<Category> {
    return this.http.post<Category>(`${this.base}/categories`, { name, slug });
  }

  deleteCategory(categoryId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/categories/${categoryId}`);
  }
}

// ─── ReportService ────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private readonly http: HttpClient) {}

  report(type: 'thread' | 'reply', id: number, reason: string): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${environment.apiUrl}/reports`, { type, id, reason });
  }
}

// ─── ThemeService ─────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'foro_theme';
  readonly mode = signal<ThemeMode>(this.readStored());

  constructor() {
    this.apply(this.mode());
  }

  toggle(): void {
    const next: ThemeMode = this.mode() === 'dark' ? 'light' : 'dark';
    this.mode.set(next);
    localStorage.setItem(this.storageKey, next);
    this.apply(next);
  }

  private readStored(): ThemeMode {
    const stored = localStorage.getItem(this.storageKey) as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private apply(mode: ThemeMode): void {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }
}

// ─── Guards ───────────────────────────────────────────────────────────────────

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (!auth.isAdmin()) {
    return router.createUrlTree(['/profile']);
  }

  return true;
};

// ─── AuthInterceptor ──────────────────────────────────────────────────────────

const TOKEN_KEY = 'foro_token';

/**
 * Adjunta el Bearer token de Sanctum a cada petición saliente.
 * Lee directamente de localStorage para evitar dependencia circular con AuthService.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(req);
  }
}
