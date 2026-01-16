import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
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
    TagModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DialogModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './wiki.html',
  styleUrl: './wiki.css',
})
export class WikiComponent implements OnInit {
  private wikiService = inject(WikiService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  public auth = inject(AuthService);

  docs = this.wikiService.docs;
  loading = this.wikiService.loading;
  error = this.wikiService.error;

  dialogVisible = signal(false);
  editMode = signal(false);
  saving = signal(false);
  selectedCategory = signal<string | null>(null);
  currentSearchTerm = signal('');
  selectedArticle = signal<WikiDoc | null>(null);

  /** Expanded state for each category */
  expandedCategories: Record<string, boolean> = {
    General: true,
    Finance: false,
    Tech: false,
    Legal: false
  };

  currentDoc: Partial<WikiDoc> = this.getEmptyDoc();
  tempVisibility = 'public';

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
    if (this.selectedCategory()) {
      docs = docs.filter((d) => d.category === this.selectedCategory());
    }
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

  /** Toggle category expansion and filter */
  toggleCategory(category: string) {
    this.expandedCategories[category] = !this.expandedCategories[category];
    if (this.expandedCategories[category]) {
      this.selectedCategory.set(category);
    }
  }

  /** Filter by category (clicking on "All" or category header) */
  filterCategory(category: string | null) {
    this.selectedCategory.set(category);
    this.selectedArticle.set(null);
  }

  /** Get articles for a specific category */
  getDocsByCategory(category: string): WikiDoc[] {
    const term = this.currentSearchTerm().toLowerCase();
    let docs = this.docs().filter(d => d.category === category);
    if (term) {
      docs = docs.filter(
        d =>
          d.title.toLowerCase().includes(term) ||
          d.description.toLowerCase().includes(term)
      );
    }
    return docs;
  }

  /** Select an article to view */
  selectArticle(doc: WikiDoc) {
    this.selectedArticle.set(doc);
    this.selectedCategory.set(doc.category);
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
    this.currentDoc.allowed_roles = this.getRolesFromVisibility(
      this.tempVisibility
    );

    this.saving.set(true);
    try {
      if (this.editMode() && this.currentDoc.id) {
        await this.wikiService.updateDoc(this.currentDoc.id, this.currentDoc);
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Artikel aktualisiert',
        });
        // Update selected article if it was edited
        if (this.selectedArticle()?.id === this.currentDoc.id) {
          this.selectedArticle.set(this.currentDoc as WikiDoc);
        }
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
          // Clear selection if deleted article was selected
          if (this.selectedArticle()?.id === doc.id) {
            this.selectedArticle.set(null);
          }
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

  getVisibilityFromRoles(roles: string[] = []): string {
    if (!roles || roles.length === 0) return 'public';
    if (roles.includes('public')) return 'public';
    if (roles.includes('member') && !roles.includes('public')) return 'member';
    if (roles.includes('committee') && !roles.includes('member'))
      return 'committee';
    if (roles.includes('admin') && !roles.includes('committee')) return 'admin';
    return 'public';
  }

  getRolesFromVisibility(vis: string): string[] {
    switch (vis) {
      case 'public':
        return ['public', 'member', 'committee', 'admin'];
      case 'member':
        return ['member', 'committee', 'admin'];
      case 'committee':
        return ['committee', 'admin'];
      case 'admin':
        return ['admin'];
      default:
        return ['public', 'member', 'committee', 'admin'];
    }
  }
}
