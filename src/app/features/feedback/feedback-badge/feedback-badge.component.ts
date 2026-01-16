import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SupabaseService } from '../../../shared/services/supabase';
import { AuthService } from '../../../shared/services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-feedback-badge',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TextareaModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './feedback-badge.component.html',
  styles: [`
    :host {
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 9999;
    }
    
    :host ::ng-deep .p-dialog {
      background: #1f2937 !important;
      border: 1px solid #374151 !important;
      border-radius: 1rem !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
    }
    
    :host ::ng-deep .p-dialog-header {
      background: transparent !important;
      border-bottom: 1px solid #374151 !important;
      padding: 1.25rem 1.5rem !important;
    }
    
    :host ::ng-deep .p-dialog-title {
      color: #fff !important;
      font-weight: 700 !important;
      font-size: 1.25rem !important;
    }
    
    :host ::ng-deep .p-dialog-header-close {
      color: #9ca3af !important;
    }
    
    :host ::ng-deep .p-dialog-header-close:hover {
      color: #fff !important;
      background: #374151 !important;
    }
    
    :host ::ng-deep .p-dialog-content {
      background: transparent !important;
      padding: 1.5rem !important;
      color: #fff !important;
    }
  `]
})
export class FeedbackBadgeComponent {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);
  private messageService = inject(MessageService);

  /** Only show feedback badge to logged-in users */
  isLoggedIn = computed(() => !!this.supabase.user());

  visible = signal(false);
  loading = signal(false);

  // Form Data
  type = signal('suggestion');
  description = signal('');

  typeOptions = [
    { label: 'Vorschlag', value: 'suggestion' },
    { label: 'Fehlermeldung', value: 'bug' }
  ];

  isHovered = signal(false);

  toggleDialog() {
    this.visible.update(v => !v);
  }

  async submitFeedback() {
    if (!this.description().trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Pflichtfeld', detail: 'Bitte gib eine Beschreibung ein.' });
      return;
    }

    this.loading.set(true);
    const userId = this.supabase.user()?.id;

    const { error } = await this.supabase.insertFeedback(
      this.type(),
      this.description(),
      userId
    );

    this.loading.set(false);

    if (error) {
      console.error('Feedback error:', error);
      this.messageService.add({ key: 'feedback-toast', severity: 'error', summary: 'Fehler', detail: 'Feedback konnte nicht gesendet werden.' });
    } else {
      this.messageService.add({ key: 'feedback-toast', severity: 'success', summary: 'Gesendet', detail: 'Vielen Dank für dein Feedback!' });
      this.visible.set(false);
      this.description.set('');
      this.type.set('suggestion');
    }
  }

  onMouseEnter() {
    this.isHovered.set(true);
  }

  onMouseLeave() {
    this.isHovered.set(false);
  }
}
