import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AuthService,
  ProfileService,
  ProfileStats,
  Reply,
  Thread,
  User,
} from '../foro.api';
import { KarmaWidgetComponent } from '../foro.ui';

type ProfileTab = 'threads' | 'replies' | 'bookmarks' | 'settings';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink, KarmaWidgetComponent],
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit {
  user: User | null = null;
  stats: ProfileStats | null = null;
  activeTab: ProfileTab = 'threads';
  myThreads: Thread[] = [];
  myReplies: Reply[] = [];
  bookmarks: Thread[] = [];
  threadsPage = 1;
  threadsLastPage = 1;
  repliesPage = 1;
  repliesLastPage = 1;
  bookmarksPage = 1;
  bookmarksLastPage = 1;
  editing = false;
  editingImages = false;
  name = '';
  email = '';
  message = '';
  avatarPreview: string | null = null;
  bannerPreview: string | null = null;
  avatarFile?: File;
  bannerFile?: File;
  imageLoading = false;
  currentPassword = '';
  newPassword = '';
  newPasswordConfirm = '';

  constructor(
    private readonly profileService: ProfileService,
    public readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.reloadDashboard();
    this.loadThreads();
  }

  reloadDashboard(): void {
    this.profileService.getDashboard().subscribe({
      next: (res) => {
        this.user = res.user;
        this.stats = res.stats;
        this.name = res.user.name;
        this.email = res.user.email;
        this.auth.user$.next(res.user);
        localStorage.setItem('foro_user', JSON.stringify(res.user));
      },
    });
  }

  setTab(tab: ProfileTab): void {
    this.activeTab = tab;
    if (tab === 'threads') this.loadThreads();
    if (tab === 'replies') this.loadReplies();
    if (tab === 'bookmarks') this.loadBookmarks();
  }

  loadThreads(page = 1): void {
    this.profileService.myThreads(page).subscribe((res) => {
      this.myThreads = res.data;
      this.threadsPage = res.current_page;
      this.threadsLastPage = res.last_page;
    });
  }

  loadReplies(page = 1): void {
    this.profileService.myReplies(page).subscribe((res) => {
      this.myReplies = res.data;
      this.repliesPage = res.current_page;
      this.repliesLastPage = res.last_page;
    });
  }

  loadBookmarks(page = 1): void {
    this.profileService.bookmarks(page).subscribe((res) => {
      this.bookmarks = res.data;
      this.bookmarksPage = res.current_page;
      this.bookmarksLastPage = res.last_page;
    });
  }

  save(): void {
    this.profileService.update({ name: this.name, email: this.email }).subscribe({
      next: (user) => {
        this.user = user;
        this.auth.user$.next(user);
        localStorage.setItem('foro_user', JSON.stringify(user));
        this.editing = false;
        this.message = 'Perfil actualizado';
      },
      error: () => (this.message = 'Error al actualizar'),
    });
  }

  savePassword(): void {
    this.profileService
      .updatePassword(this.currentPassword, this.newPassword, this.newPasswordConfirm)
      .subscribe({
        next: () => {
          this.message = 'Contraseña actualizada';
          this.currentPassword = '';
          this.newPassword = '';
          this.newPasswordConfirm = '';
        },
        error: (err) => (this.message = err.error?.message || 'Error al cambiar contraseña'),
      });
  }

  deleteAccount(): void {
    if (!confirm('¿Eliminar tu cuenta permanentemente?')) return;
    this.profileService.deleteAccount().subscribe(() => {
      this.auth.logout().subscribe(() => this.router.navigate(['/']));
    });
  }

  openImageEditor(): void {
    this.editingImages = true;
    this.avatarPreview = null;
    this.bannerPreview = null;
    this.avatarFile = undefined;
    this.bannerFile = undefined;
  }

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.avatarFile = file;
    this.avatarPreview = URL.createObjectURL(file);
  }

  onBannerSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.bannerFile = file;
    this.bannerPreview = URL.createObjectURL(file);
  }

  saveImages(): void {
    if (!this.avatarFile && !this.bannerFile) {
      this.message = 'Selecciona al menos una imagen';
      return;
    }
    this.imageLoading = true;
    this.profileService.updateImages(this.avatarFile, this.bannerFile).subscribe({
      next: (user) => {
        this.user = user;
        this.auth.user$.next(user);
        localStorage.setItem('foro_user', JSON.stringify(user));
        this.editingImages = false;
        this.imageLoading = false;
        this.message = 'Imágenes actualizadas';
      },
      error: () => {
        this.message = 'Error al subir imágenes';
        this.imageLoading = false;
      },
    });
  }

  avatarUrl(): string {
    if (this.avatarPreview) return this.avatarPreview;
    if (this.user?.avatar) return this.user.avatar;
    const name = encodeURIComponent(this.user?.name ?? 'U');
    return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`;
  }

  bannerUrl(): string {
    if (this.bannerPreview) return this.bannerPreview;
    if (this.user?.banner) return this.user.banner;
    return '';
  }
}


