import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AuthService,
  Category,
  CategoryService,
  Reply,
  ReplyService,
  ReportService,
  Thread,
  ThreadService,
} from '../foro.api';
import {
  MarkdownEditorComponent,
  MarkdownPipe,
  ReplyTreeComponent,
  UserKarmaBadgeComponent,
  VoteControlsComponent,
} from '../foro.ui';

@Component({
  selector: 'app-thread-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    FormsModule,
    VoteControlsComponent,
    MarkdownEditorComponent,
    MarkdownPipe,
    ReplyTreeComponent,
    UserKarmaBadgeComponent,
  ],
  templateUrl: './thread.page.html',
})
export class ThreadPage implements OnInit {
  thread: Thread | null = null;
  replies: Reply[] = [];
  categories: Category[] = [];
  replyBody = '';
  replyParentId: number | null = null;
  loading = true;
  notFound = false;
  editing = false;
  editTitle = '';
  editBody = '';
  editCategoryId: number | null = null;
  reportReason = '';
  showReport = false;
  private threadId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly threadService: ThreadService,
    private readonly replyService: ReplyService,
    private readonly categoryService: CategoryService,
    private readonly reportService: ReportService,
    public readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.threadId = Number(this.route.snapshot.paramMap.get('id'));
    this.categoryService.list().subscribe((cats) => (this.categories = cats));
    this.loadThread();
    this.loadReplies();
  }

  get isThreadAuthor(): boolean {
    return !!this.thread && this.auth.user$.value?.id === this.thread.user_id;
  }

  get canEditThread(): boolean {
    return this.isThreadAuthor || this.auth.isAdmin();
  }

  loadThread(): void {
    this.threadService.get(this.threadId).subscribe({
      next: (t) => {
        this.thread = t;
        this.loading = false;
        this.notFound = false;
      },
      error: () => {
        this.loading = false;
        this.notFound = true;
      },
    });
  }

  loadReplies(): void {
    this.replyService.list(this.threadId).subscribe((res) => (this.replies = res));
  }

  score(thread: Thread): number {
    return thread.upvotes - thread.downvotes;
  }

  onThreadVote(value: 1 | -1): void {
    if (!this.thread) return;
    this.threadService.vote(this.thread.id, value).subscribe((res) => {
      this.thread!.upvotes = res.upvotes;
      this.thread!.downvotes = res.downvotes;
      this.thread!.user_vote = res.user_vote ?? undefined;
    });
  }

  onReplyVote(event: { reply: Reply; value: 1 | -1 }): void {
    this.replyService.vote(event.reply.id, event.value).subscribe((res) => {
      event.reply.upvotes = res.upvotes;
      event.reply.downvotes = res.downvotes;
      event.reply.user_vote = res.user_vote ?? undefined;
    });
  }

  toggleBookmark(): void {
    if (!this.thread || !this.auth.isAuthenticated()) return;
    const req = this.thread.is_bookmarked
      ? this.threadService.unbookmark(this.thread.id)
      : this.threadService.bookmark(this.thread.id);
    req.subscribe((res) => (this.thread!.is_bookmarked = res.is_bookmarked));
  }

  setReplyTo(reply: Reply): void {
    this.replyParentId = reply.id;
    this.replyBody = `@${reply.user?.name} `;
  }

  markBest(reply: Reply): void {
    this.replyService.markBest(reply.id).subscribe(() => {
      this.loadReplies();
      if (this.thread) this.thread.is_resolved = true;
    });
  }

  submitReply(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.replyService
      .create(this.threadId, this.replyBody, this.replyParentId ?? undefined)
      .subscribe(() => {
        this.replyBody = '';
        this.replyParentId = null;
        this.loadReplies();
      });
  }

  startEdit(): void {
    if (!this.thread) return;
    this.editing = true;
    this.editTitle = this.thread.title;
    this.editBody = this.thread.body;
    this.editCategoryId = this.thread.category_id;
  }

  saveEdit(): void {
    if (!this.thread || !this.editCategoryId) return;
    this.threadService
      .update(this.thread.id, {
        title: this.editTitle,
        body: this.editBody,
        category_id: this.editCategoryId,
      })
      .subscribe((t) => {
        this.thread = t;
        this.editing = false;
      });
  }

  deleteThread(): void {
    if (!this.thread || !confirm('¿Eliminar este hilo?')) return;
    this.threadService.delete(this.thread.id).subscribe(() => this.router.navigate(['/']));
  }

  submitReport(): void {
    if (!this.thread || !this.reportReason.trim()) return;
    this.reportService.report('thread', this.thread.id, this.reportReason).subscribe({
      next: () => {
        this.showReport = false;
        this.reportReason = '';
        alert('Reporte enviado. Gracias.');
      },
    });
  }

  onReplyUpdated(): void {
    this.loadReplies();
  }
}


