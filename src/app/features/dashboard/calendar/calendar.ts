import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'event' | 'deadline';
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, DatePickerModule, FormsModule, ButtonModule, TagModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white">Kalender</h1>
          <p class="text-gray-400 mt-1">Termine und Events im Überblick</p>
        </div>
        <p-button label="Neuer Termin" icon="pi pi-plus" severity="danger" [raised]="true"></p-button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Calendar -->
        <div class="lg:col-span-2">
          <div class="bg-gray-800/40 rounded-xl p-6">
            <p-datepicker 
              [(ngModel)]="date" 
              [inline]="true" 
              [showWeek]="true"
              styleClass="w-full"
            ></p-datepicker>
          </div>
        </div>

        <!-- Right: Upcoming Events -->
        <div class="lg:col-span-1">
          <div class="bg-gray-800/40 rounded-xl p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-white">Kommende Termine</h2>
              <span class="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full font-medium">
                {{events.length}} Events
              </span>
            </div>

            <div class="space-y-3">
              @for (event of events; track event.id) {
                <div class="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900/70 transition-colors cursor-pointer">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                         [class]="getEventBg(event.type)">
                      <i class="pi" [class]="getEventIcon(event.type)" [class]="getEventColor(event.type)"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-white mb-1">{{event.title}}</h3>
                      <div class="flex items-center gap-2 text-sm text-gray-400">
                        <i class="pi pi-calendar text-xs"></i>
                        <span>{{event.date}}</span>
                        <span>•</span>
                        <span>{{event.time}}</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <p-button 
              label="Alle Termine anzeigen" 
              icon="pi pi-list"
              styleClass="w-full mt-4"
              severity="secondary"
              [text]="true"></p-button>
          </div>
        </div>
      </div>
    </div>

    <style>
      :host ::ng-deep .p-datepicker {
        background: transparent;
        border: none;
        width: 100%;
      }

      :host ::ng-deep .p-datepicker-header {
        background: rgb(31 41 55 / 0.5);
        border: none;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        padding: 0.75rem;
      }

      :host ::ng-deep .p-datepicker table {
        width: 100%;
      }

      :host ::ng-deep .p-datepicker table th {
        color: rgb(156 163 175);
        font-weight: 600;
        padding: 0.75rem;
      }

      :host ::ng-deep .p-datepicker table td {
        padding: 0.25rem;
      }

      :host ::ng-deep .p-datepicker table td > span {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.5rem;
        color: rgb(229 231 235);
      }

      :host ::ng-deep .p-datepicker table td > span:hover {
        background: rgb(55 65 81);
      }

      :host ::ng-deep .p-datepicker table td.p-datepicker-today > span {
        background: rgb(239 68 68);
        color: white;
      }

      :host ::ng-deep .p-datepicker-prev,
      :host ::ng-deep .p-datepicker-next {
        color: rgb(156 163 175);
      }

      :host ::ng-deep .p-datepicker-prev:hover,
      :host ::ng-deep .p-datepicker-next:hover {
        background: rgb(55 65 81);
        color: white;
      }
    </style>
  `
})
export class CalendarComponent {
  date: Date = new Date();

  events: CalendarEvent[] = [
    { id: 1, title: 'Vorstandssitzung', date: 'Heute', time: '19:00', type: 'meeting' },
    { id: 2, title: 'AG Technik Treffen', date: 'Mo, 13. Jan', time: '20:00', type: 'meeting' },
    { id: 3, title: 'Sommerfest Planung', date: 'Mi, 15. Jan', time: '18:30', type: 'event' },
    { id: 4, title: 'Mitgliedsbeiträge fällig', date: 'Fr, 31. Jan', time: '23:59', type: 'deadline' },
    { id: 5, title: 'Mitgliederversammlung', date: 'Sa, 15. Feb', time: '14:00', type: 'event' },
  ];

  getEventBg(type: string): string {
    switch (type) {
      case 'meeting': return 'bg-blue-500/20';
      case 'event': return 'bg-green-500/20';
      case 'deadline': return 'bg-red-500/20';
      default: return 'bg-gray-500/20';
    }
  }

  getEventIcon(type: string): string {
    switch (type) {
      case 'meeting': return 'pi-users';
      case 'event': return 'pi-star';
      case 'deadline': return 'pi-clock';
      default: return 'pi-calendar';
    }
  }

  getEventColor(type: string): string {
    switch (type) {
      case 'meeting': return 'text-blue-400';
      case 'event': return 'text-green-400';
      case 'deadline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }
}
