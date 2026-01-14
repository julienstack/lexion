import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { ConfirmationService, MessageService } from 'primeng/api';
import { WikiService } from '../../../shared/services/wiki.service';
import { WikiDoc } from '../../../shared/models/wiki-doc.model';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-wiki',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    ProgressSpinnerModule,
    MessageModule,
    ConfirmDialogModule,
    ToastModule,
    RippleModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './wiki.html',
  styleUrl: './wiki.css',
})
export class WikiComponent implements OnInit {
  private wikiService = inject(WikiService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  public auth = inject(AuthService); // Public for template access

  docs = this.wikiService.docs;
  loading = this.wikiService.loading;
  error = this.wikiService.error;

  dialogVisible = signal(false);
  editMode = signal(false);
  saving = signal(false);
  selectedCategory = signal<string | null>(null);
  currentSearchTerm = signal('');

  // explicit state for expanded rows
  expandedRows: Record<string, boolean> = {};

  toggleRow(doc: WikiDoc) {
    if (!doc.id) return;
    const expanded = { ...this.expandedRows };
    if (expanded[doc.id]) {
      delete expanded[doc.id];
    } else {
      expanded[doc.id] = true;
    }
    this.expandedRows = expanded;
  }

  currentDoc: Partial<WikiDoc> = this.getEmptyDoc();
  tempVisibility = 'public'; // Helper for visibility selection

  categoryOptions = [
    { label: 'Allgemein', value: 'General' },
    { label: 'Finanzen', value: 'Finance' },
    { label: 'Technik', value: 'Tech' },
    { label: 'Rechtliches', value: 'Legal' },
  ];

  statusOptions = [
    { label: 'Veröffentlicht', value: 'Published' },
    { label: 'Entwurf', value: 'Draft' },
    { label: 'In Prüfung', value: 'Review' },
  ];

  visibilityOptions = [
    { label: 'Öffentlich (Alle)', value: 'public' },
    { label: 'Nur Mitglieder', value: 'member' },
    { label: 'Nur Vorstand', value: 'committee' },
    { label: 'Nur Admin', value: 'admin' },
  ];

  filteredDocs = computed(() => {
    let docs = this.docs();

    // 1. Filter by Category
    if (this.selectedCategory()) {
      docs = docs.filter((d) => d.category === this.selectedCategory());
    }

    // 2. Filter by Search
    const term = this.currentSearchTerm().toLowerCase();
    if (term) {
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(term) ||
          d.description.toLowerCase().includes(term) ||
          d.author.toLowerCase().includes(term)
      );
    }

    return docs;
  });

  ngOnInit(): void {
    this.wikiService.fetchDocs();
  }

  getEmptyDoc(): Partial<WikiDoc> {
    return {
      title: '',
      description: '',
      content: '',
      author: '',
      category: 'General',
      status: 'Draft',
      last_updated: new Date().toISOString().split('T')[0],
      allowed_roles: ['public', 'member', 'committee', 'admin']
    };
  }

  openNew() {
    this.currentDoc = this.getEmptyDoc();
    this.tempVisibility = 'public';
    this.editMode.set(false);
    this.dialogVisible.set(true);
  }

  editDoc(doc: WikiDoc) {
    this.currentDoc = { ...doc };
    this.tempVisibility = this.getVisibilityFromRoles(doc.allowed_roles);
    this.editMode.set(true);
    this.dialogVisible.set(true);
  }

  async saveDoc() {
    if (!this.currentDoc.title || !this.currentDoc.description) return;

    this.currentDoc.last_updated = new Date().toISOString().split('T')[0];
    this.currentDoc.allowed_roles = this.getRolesFromVisibility(this.tempVisibility);

    this.saving.set(true);
    try {
      if (this.editMode() && this.currentDoc.id) {
        await this.wikiService.updateDoc(this.currentDoc.id, this.currentDoc);
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Artikel aktualisiert',
        });
      } else {
        await this.wikiService.addDoc(this.currentDoc as WikiDoc);
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Artikel erstellt',
        });
      }
      this.dialogVisible.set(false);
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: (e as Error).message,
      });
    }
    this.saving.set(false);
  }

  confirmDelete(doc: WikiDoc) {
    this.confirmationService.confirm({
      message: `Möchtest du den Artikel "${doc.title}" wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja, löschen',
      rejectLabel: 'Abbrechen',
      accept: async () => {
        try {
          await this.wikiService.deleteDoc(doc.id!);
          this.messageService.add({
            severity: 'success',
            summary: 'Gelöscht',
            detail: 'Artikel wurde gelöscht',
          });
        } catch (e) {
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: (e as Error).message,
          });
        }
      },
    });
  }

  filterCategory(category: string | null) {
    this.selectedCategory.set(category);
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.currentSearchTerm.set(input.value);
  }

  getCountByCategory(category: string): number {
    return this.docs().filter((d) => d.category === category).length;
  }

  getCategorySeverity(category: string) {
    switch (category) {
      case 'General':
        return 'info';
      case 'Finance':
        return 'success';
      case 'Tech':
        return 'contrast';
      case 'Legal':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      General: 'Allgemein',
      Finance: 'Finanzen',
      Tech: 'Technik',
      Legal: 'Rechtlich',
    };
    return labels[category] || category;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Published: 'Veröffentlicht',
      Draft: 'Entwurf',
      Review: 'In Prüfung',
    };
    return labels[status] || status;
  }

  // --- Helpers for Visibility Mapping ---
  getVisibilityFromRoles(roles: string[] = []): string {
    if (!roles || roles.length === 0) return 'public';
    if (roles.includes('public')) return 'public';
    if (roles.includes('member') && !roles.includes('public')) return 'member'; // "member" implies no public
    if (roles.includes('committee') && !roles.includes('member')) return 'committee';
    if (roles.includes('admin') && !roles.includes('committee')) return 'admin';
    return 'public'; // Default
  }

  getRolesFromVisibility(vis: string): string[] {
    switch (vis) {
      case 'public': return ['public', 'member', 'committee', 'admin'];
      case 'member': return ['member', 'committee', 'admin'];
      case 'committee': return ['committee', 'admin'];
      case 'admin': return ['admin'];
      default: return ['public', 'member', 'committee', 'admin'];
    }
  }
}
