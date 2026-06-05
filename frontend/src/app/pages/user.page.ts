import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PublicUserProfile, Thread, UserService } from '../foro.api';
import { KarmaWidgetComponent } from '../foro.ui';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterLink, DatePipe, KarmaWidgetComponent],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-8">
      <a routerLink="/" class="text-sm text-brand-600 hover:underline">← Inicio</a>
      @if (profile) {
        <div class="card mt-4 p-6">
          <div class="flex items-center gap-4">
            <img [src]="avatarUrl()" [alt]="profile.user.name" class="h-16 w-16 rounded-full object-cover" />
            <div>
              <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ profile.user.name }}</h1>
              @if (memberSince) {
                <p class="text-xs text-slate-500">Miembro desde {{ memberSince | date: 'mediumDate' }}</p>
              }
            </div>
          </div>
          <div class="mt-4">
            <app-karma-widget [karma]="profile.stats.karma" [rank]="$any(profile.stats.rank)" />
          </div>
          <div class="mt-4 grid grid-cols-2 gap-4 text-center">
            <div class="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <p class="text-xl font-bold">{{ profile.stats.threads_count }}</p>
              <p class="text-xs text-slate-500">Hilos</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <p class="text-xl font-bold">{{ profile.stats.replies_count }}</p>
              <p class="text-xs text-slate-500">Respuestas</p>
            </div>
          </div>
        </div>
        <h2 class="mt-8 text-lg font-semibold">Hilos publicados</h2>
        <div class="mt-3 space-y-3">
          @for (t of threads; track t.id) {
            <a [routerLink]="['/threads', t.id]" class="card block p-4 hover:border-brand-300">
              <h3 class="font-semibold">{{ t.title }}</h3>
              <p class="mt-1 text-xs text-slate-500">{{ t.replies_count }} respuestas</p>
            </a>
          }
          @if (threads.length === 0) {
            <p class="text-sm text-slate-500">Sin hilos públicos.</p>
          }
        </div>
      } @else if (!loading) {
        <p class="mt-6 text-slate-500">Usuario no encontrado.</p>
      }
    </div>
  `,
})
export class UserPage implements OnInit {
  profile: PublicUserProfile | null = null;
  threads: Thread[] = [];
  loading = true;
  private userId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.userService.getProfile(this.userId).subscribe({
      next: (p) => {
        this.profile = p;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
    this.userService.getThreads(this.userId).subscribe((res) => (this.threads = res.data));
  }

  get memberSince(): string | null {
    return this.profile?.user.created_at ?? null;
  }

  avatarUrl(): string {
    if (this.profile?.user.avatar) return this.profile.user.avatar;
    const name = encodeURIComponent(this.profile?.user.name ?? 'U');
    return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`;
  }
}

