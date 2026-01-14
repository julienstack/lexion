import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EventsService } from '../../../shared/services/events.service';
import { CalendarEvent } from '../../../shared/models/calendar-event.model';
import { AuthService } from '../../../shared/services/auth.service';
import { WorkingGroupsService } from '../../../shared/services/working-groups.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    DatePipe,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    ProgressSpinnerModule,
    MessageModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class CalendarComponent implements OnInit {
  private eventsService = inject(EventsService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  public auth = inject(AuthService);

  // For AG linking
  private workingGroupsService = inject(WorkingGroupsService);
  workingGroups = this.workingGroupsService.workingGroups;

  events = this.eventsService.events;
  loading = this.eventsService.loading;
  error = this.eventsService.error;

  dialogVisible = signal(false);
  editMode = signal(false);
  saving = signal(false);

  currentEvent: Partial<CalendarEvent> = this.getEmptyEvent();
  eventDate: Date | null = null;
  tempVisibility = 'public';

  typeOptions = [
    { label: 'Allgemein', value: 'general' },
    { label: 'Persönlich', value: 'personal' },
    { label: 'AG', value: 'ag' },
  ];

  visibilityOptions = [
    { label: 'Öffentlich (Alle)', value: 'public' },
    { label: 'Nur Mitglieder', value: 'member' },
    { label: 'Nur Vorstand', value: 'committee' },
    { label: 'Nur Admin', value: 'admin' },
    { label: 'Nur AG-Mitglieder', value: 'ag-only' },
  ];

  ngOnInit(): void {
    this.eventsService.fetchEvents();
    this.workingGroupsService.fetchWorkingGroups();
  }

  getEmptyEvent(): Partial<CalendarEvent> {
    return {
      title: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '19:00',
      end_time: null,
      type: 'general',
      location: '',
      description: null,
      ag_name: null,
      working_group_id: null,
      allowed_roles: ['public', 'member', 'committee', 'admin']
    };
  }

  get sortedEvents() {
    return [...this.events()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  openNew() {
    this.currentEvent = this.getEmptyEvent();
    this.eventDate = new Date();
    this.tempVisibility = 'public';
    this.editMode.set(false);
    this.dialogVisible.set(true);
  }

  editEvent(event: CalendarEvent) {
    this.currentEvent = { ...event };
    this.eventDate = new Date(event.date);
    // Detect AG-only visibility
    if (event.working_group_id && (!event.allowed_roles || event.allowed_roles.length === 0)) {
      this.tempVisibility = 'ag-only';
    } else {
      this.tempVisibility = this.getVisibilityFromRoles(event.allowed_roles);
    }
    this.editMode.set(true);
    this.dialogVisible.set(true);
  }

  async saveEvent() {
    if (!this.currentEvent.title || !this.currentEvent.location) return;

    if (this.eventDate) {
      this.currentEvent.date = this.eventDate.toISOString().split('T')[0];
    }

    // Handle AG-only visibility
    if (this.tempVisibility === 'ag-only') {
      this.currentEvent.allowed_roles = []; // Empty = relies on AG membership check in RLS
    } else {
      this.currentEvent.allowed_roles = this.getRolesFromVisibility(this.tempVisibility);
    }

    // Set ag_name from selected working group
    if (this.currentEvent.type === 'ag' && this.currentEvent.working_group_id) {
      const selectedGroup = this.workingGroups().find(
        g => g.id === this.currentEvent.working_group_id
      );
      if (selectedGroup) {
        this.currentEvent.ag_name = selectedGroup.name;
      }
    } else {
      this.currentEvent.working_group_id = null;
      this.currentEvent.ag_name = null;
    }

    this.saving.set(true);
    try {
      if (this.editMode() && this.currentEvent.id) {
        await this.eventsService.updateEvent(
          this.currentEvent.id,
          this.currentEvent
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Termin aktualisiert',
        });
      } else {
        await this.eventsService.addEvent(this.currentEvent as CalendarEvent);
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Termin erstellt',
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

  confirmDelete(event: CalendarEvent) {
    this.confirmationService.confirm({
      message: `Möchtest du "${event.title}" wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja, löschen',
      rejectLabel: 'Abbrechen',
      accept: async () => {
        try {
          await this.eventsService.deleteEvent(event.id!);
          this.messageService.add({
            severity: 'success',
            summary: 'Gelöscht',
            detail: 'Termin wurde gelöscht',
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

  parseDate(dateStr: string): Date {
    return new Date(dateStr);
  }

  // --- Helpers ---
  getVisibilityFromRoles(roles: string[] = []): string {
    if (!roles || roles.length === 0) return 'public';
    if (roles.includes('public')) return 'public';
    if (roles.includes('member') && !roles.includes('public')) return 'member';
    if (roles.includes('committee') && !roles.includes('member')) return 'committee';
    if (roles.includes('admin') && !roles.includes('committee')) return 'admin';
    return 'public';
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
