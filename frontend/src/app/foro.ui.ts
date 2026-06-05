// componentes reutilizables del foro

import { Component, EventEmitter, Input, Output, Pipe, PipeTransform } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  AuthService,
  Reply,
  ReplyService,
  ReportService,
  ThemeService,
  UserRank,
} from './foro.api';

/** Renderizado Markdown simplificado (sin dependencias externas). */
function renderMarkdown(source: string): string {
  let html = escapeHtml(source);

  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-3 mb-1">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-3 mb-2">$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/\n/g, '<br>');

  return html;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type KarmaTier = 'novato' | 'colaborador' | 'leyenda';

export function karmaTier(karma: number): KarmaTier {
  if (karma > 500) return 'leyenda';
  if (karma >= 100) return 'colaborador';
  return 'novato';
}

export function karmaRank(karma: number, rank?: UserRank): UserRank {
  if (rank) return rank;
  if (karma > 500) return 'Leyenda';
  if (karma >= 100) return 'Colaborador';
  return 'Novato';
}

export function karmaBadgeClass(rank: UserRank): string {
  const map: Record<UserRank, string> = {
    Novato: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    Colaborador: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    Leyenda: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  };
  return map[rank];
}

@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';
    return this.sanitizer.bypassSecurityTrustHtml(
      `<div class="prose-markdown">${renderMarkdown(value)}</div>`
    );
  }
}

@Component({
  selector: 'app-vote-controls',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="flex flex-col items-center gap-0.5" (click)="$event.stopPropagation()">
      <button
        type="button"
        (click)="vote.emit(1)"
        [ngClass]="userVote === 1
          ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/30'
          : 'text-slate-400 hover:text-brand-600 dark:hover:text-brand-400'"
        class="rounded-md p-1 transition"
        aria-label="Upvote"
      >
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3l6 6H4l6-6z"/></svg>
      </button>
      <span class="text-sm font-semibold tabular-nums" [ngClass]="score > 0 ? 'text-brand-600' : score < 0 ? 'text-red-500' : 'text-slate-500'">
        {{ score }}
      </span>
      <button
        type="button"
        (click)="vote.emit(-1)"
        [ngClass]="userVote === -1
          ? 'text-red-600 bg-red-50 dark:bg-red-900/30'
          : 'text-slate-400 hover:text-red-500'"
        class="rounded-md p-1 transition"
        aria-label="Downvote"
      >
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 17l-6-6h12l-6 6z"/></svg>
      </button>
    </div>
  `,
})
export class VoteControlsComponent {
  @Input({ required: true }) score = 0;
  @Input() userVote: 1 | -1 | null | undefined = null;
  @Output() vote = new EventEmitter<1 | -1>();
}

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="theme.toggle()"
      class="btn-ghost flex items-center gap-2"
      [attr.aria-label]="theme.mode() === 'dark' ? 'Modo claro' : 'Modo oscuro'"
    >
      @if (theme.mode() === 'dark') {
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      } @else {
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  constructor(public readonly theme: ThemeService) {}
}

@Component({
  selector: 'app-google-auth-button',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="clicked.emit()"
      [disabled]="loading"
      class="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {{ label }}
    </button>
  `,
})
export class GoogleAuthButtonComponent {
  @Input() label = 'Continuar con Google';
  @Input() loading = false;
  @Output() clicked = new EventEmitter<void>();
}

@Component({
  selector: 'app-karma-icon',
  standalone: true,
  template: `
    @switch (tier) {
      @case ('novato') {
        <svg [class]="sizeClass" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#e2e8f0" />
          <path
            d="M32 14l4.2 12.9H50L37 32.4l4.2 12.9L32 40.2l-9.2 5.1 4.2-12.9-13-5.5h13.8L32 14z"
            fill="#64748b"
          />
        </svg>
      }
      @case ('colaborador') {
        <svg [class]="sizeClass" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#dbeafe" />
          <path
            d="M32 12l5.5 11.2L50 25.5 38.5 36 42 52 32 44.5 22 52l3.5-16L14 25.5l12.5-2.3L32 12z"
            fill="#2563eb"
          />
          <circle cx="32" cy="32" r="28" stroke="#93c5fd" stroke-width="2" />
        </svg>
      }
      @case ('leyenda') {
        <svg [class]="sizeClass" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#fef3c7" />
          <path d="M16 42l6-18 10 8 10-8 6 18H16z" fill="#f59e0b" />
          <path d="M22 24h6l4-8 4 8h6l-5 6 2 10-7-4-7 4 2-10-5-6z" fill="#d97706" />
        </svg>
      }
    }
  `,
})
export class KarmaIconComponent {
  @Input({ required: true }) karma = 0;
  @Input() sizeClass = 'h-14 w-14';

  get tier(): KarmaTier {
    return karmaTier(this.karma);
  }
}

@Component({
  selector: 'app-user-karma-badge',
  standalone: true,
  imports: [NgClass, KarmaIconComponent],
  template: `
    <span
      class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      [ngClass]="badgeClass"
      [title]="rankLabel + ' · ' + karma + ' karma'"
    >
      <app-karma-icon [karma]="karma" sizeClass="h-4 w-4 shrink-0" />
      <span class="tabular-nums">{{ karma }}</span>
    </span>
  `,
})
export class UserKarmaBadgeComponent {
  @Input({ required: true }) karma = 0;
  @Input() rank?: UserRank;

  get rankLabel(): UserRank {
    return karmaRank(this.karma, this.rank);
  }

  get badgeClass(): string {
    return karmaBadgeClass(this.rankLabel);
  }
}

@Component({
  selector: 'app-karma-widget',
  standalone: true,
  imports: [NgClass, KarmaIconComponent],
  template: `
    <div class="flex items-center gap-3">
      <app-karma-icon [karma]="karma" sizeClass="h-14 w-14 shrink-0" />
      <div>
        <p class="text-2xl font-bold text-brand-600 dark:text-brand-400">{{ karma }}</p>
        <span class="inline-block rounded-full px-3 py-0.5 text-xs font-semibold" [ngClass]="badgeClass">
          {{ rankLabel }}
        </span>
      </div>
    </div>
  `,
})
export class KarmaWidgetComponent {
  @Input({ required: true }) karma = 0;
  @Input() rank?: UserRank;

  get rankLabel(): UserRank {
    return karmaRank(this.karma, this.rank);
  }

  get badgeClass(): string {
    return karmaBadgeClass(this.rankLabel);
  }
}

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [FormsModule, MarkdownPipe],
  template: `
    <div class="space-y-2">
      <div class="flex gap-1 border-b border-slate-200 pb-2 dark:border-slate-700">
        <button type="button" class="btn-ghost text-xs" (click)="wrapBold()">Negrita</button>
        <button type="button" class="btn-ghost text-xs" (click)="wrapItalic()">Cursiva</button>
        <button type="button" class="btn-ghost text-xs" (click)="wrapCode()">Código</button>
        <button type="button" class="btn-ghost text-xs" (click)="preview = !preview">
          {{ preview ? 'Editar' : 'Vista previa' }}
        </button>
      </div>
      @if (!preview) {
        <textarea
          [(ngModel)]="value"
          (ngModelChange)="valueChange.emit(value)"
          [placeholder]="placeholder"
          rows="4"
          class="input-field font-mono text-sm"
        ></textarea>
      } @else {
        <div class="card min-h-[6rem] p-4 text-sm" [innerHTML]="value | markdown"></div>
      }
      <p class="text-xs text-slate-500 dark:text-slate-400">Soporta Markdown básico</p>
    </div>
  `,
})
export class MarkdownEditorComponent {
  @Input() value = '';
  @Input() placeholder = 'Escribe una respuesta...';
  @Output() valueChange = new EventEmitter<string>();
  preview = false;

  wrapBold(): void {
    this.appendWrap('**');
  }

  wrapItalic(): void {
    this.appendWrap('*');
  }

  wrapCode(): void {
    this.appendWrap('`');
  }

  private appendWrap(marker: string): void {
    this.value = this.value + marker + 'texto' + marker;
    this.valueChange.emit(this.value);
  }
}

@Component({
  selector: 'app-reply-tree',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    RouterLink,
    FormsModule,
    VoteControlsComponent,
    MarkdownPipe,
    MarkdownEditorComponent,
    ReplyTreeComponent,
    UserKarmaBadgeComponent,
  ],
  template: `
    @for (reply of replies; track reply.id) {
      <article
        class="mb-3 rounded-lg border p-4 transition"
        [ngClass]="reply.is_best
          ? 'border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500/50 dark:bg-emerald-950/30'
          : 'border-slate-200 dark:border-slate-700'"
        [style.margin-left.rem]="depth * 1.25"
      >
        @if (reply.is_best) {
          <span class="mb-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
            ✓ Mejor respuesta
          </span>
        }
        <div class="flex gap-3">
          @if (auth.isAuthenticated()) {
            <app-vote-controls
              [score]="reply.upvotes - reply.downvotes"
              [userVote]="reply.user_vote ?? null"
              (vote)="voteReply.emit({ reply, value: $event })"
            />
          } @else {
            <div class="flex w-8 shrink-0 flex-col items-center justify-center text-center">
              <span class="text-sm font-bold tabular-nums">{{ reply.upvotes - reply.downvotes }}</span>
            </div>
          }
          <div class="min-w-0 flex-1">
            <div class="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              @if (reply.user) {
                <a [routerLink]="['/users', reply.user.id]" class="font-medium text-slate-700 hover:text-brand-600 dark:text-slate-200">{{ reply.user.name }}</a>
              }
              @if (reply.user?.karma !== undefined) {
                <app-user-karma-badge [karma]="reply.user!.karma!" />
              }
              <time [attr.datetime]="reply.created_at">{{ reply.created_at | date: 'medium' }}</time>
            </div>
            @if (editingId !== reply.id) {
              <div class="text-sm" [innerHTML]="reply.body | markdown"></div>
            } @else {
              <app-markdown-editor [(value)]="editBody" />
              <div class="mt-2 flex gap-2">
                <button type="button" class="btn-primary text-xs" (click)="saveEdit(reply)">Guardar</button>
                <button type="button" class="btn-ghost text-xs" (click)="editingId = null">Cancelar</button>
              </div>
            }
            <div class="mt-3 flex flex-wrap gap-2">
              @if (auth.isAuthenticated()) {
                <button type="button" class="btn-ghost text-xs" (click)="replyTo.emit(reply)">Responder</button>
              }
              @if (isThreadAuthor && !reply.is_best) {
                <button type="button" class="text-xs font-medium text-emerald-600 hover:underline" (click)="markBest.emit(reply)">
                  Marcar como mejor respuesta
                </button>
              }
              @if (canEdit(reply)) {
                <button type="button" class="btn-ghost text-xs" (click)="startEdit(reply)">Editar</button>
                <button type="button" class="text-xs text-red-600 hover:underline" (click)="deleteReply(reply)">Eliminar</button>
              }
              @if (auth.isAuthenticated()) {
                <button type="button" class="btn-ghost text-xs" (click)="reportReply(reply)">Reportar</button>
              }
            </div>
          </div>
        </div>
        @if (reply.children?.length) {
          <div class="mt-3 border-l-2 border-slate-200 pl-3 dark:border-slate-700">
            <app-reply-tree
              [replies]="reply.children!"
              [depth]="depth + 1"
              [isThreadAuthor]="isThreadAuthor"
              (voteReply)="voteReply.emit($event)"
              (replyTo)="replyTo.emit($event)"
              (markBest)="markBest.emit($event)"
              (updated)="updated.emit()"
            />
          </div>
        }
      </article>
    }
  `,
})
export class ReplyTreeComponent {
  @Input({ required: true }) replies: Reply[] = [];
  @Input() depth = 0;
  @Input() isThreadAuthor = false;
  @Output() voteReply = new EventEmitter<{ reply: Reply; value: 1 | -1 }>();
  @Output() replyTo = new EventEmitter<Reply>();
  @Output() markBest = new EventEmitter<Reply>();
  @Output() updated = new EventEmitter<void>();

  editingId: number | null = null;
  editBody = '';

  constructor(
    public readonly auth: AuthService,
    private readonly replyService: ReplyService,
    private readonly reportService: ReportService
  ) {}

  canEdit(reply: Reply): boolean {
    const uid = this.auth.user$.value?.id;
    return !!uid && (reply.user_id === uid || this.auth.isAdmin());
  }

  startEdit(reply: Reply): void {
    this.editingId = reply.id;
    this.editBody = reply.body;
  }

  saveEdit(reply: Reply): void {
    this.replyService.update(reply.id, this.editBody).subscribe(() => {
      this.editingId = null;
      this.updated.emit();
    });
  }

  deleteReply(reply: Reply): void {
    if (!confirm('¿Eliminar esta respuesta?')) return;
    this.replyService.delete(reply.id).subscribe(() => this.updated.emit());
  }

  reportReply(reply: Reply): void {
    const reason = prompt('Motivo del reporte:');
    if (!reason?.trim()) return;
    this.reportService.report('reply', reply.id, reason).subscribe(() => alert('Reporte enviado.'));
  }
}
