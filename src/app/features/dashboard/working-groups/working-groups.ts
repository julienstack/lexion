import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';

interface WorkingGroup {
  id: number;
  name: string;
  description: string;
  lead: string;
  membersCount: number;
  nextMeeting: string;
  contact: {
    type: 'Signal' | 'Discord' | 'WhatsApp' | 'Email';
    value: string;
    link?: string;
    icon: string;
  };
  tags: string[];
}

@Component({
  selector: 'app-working-groups',
  standalone: true,
  imports: [CommonModule, ButtonModule, AccordionModule, TagModule, AvatarModule, CardModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white">Arbeitsgemeinschaften (AGs)</h1>
          <p class="text-gray-400 mt-2">Hier findest du alle aktiven Gruppen, denen du beitreten kannst</p>
        </div>
        <p-button label="Neue AG gründen" icon="pi pi-plus" severity="danger" [raised]="true"></p-button>
      </div>

      <p-accordion [multiple]="true" styleClass="ag-list">
        @for (ag of ags; track ag.id) {
          <p-accordion-panel [value]="ag.id.toString()">
            <p-accordion-header>
              <div class="flex items-center gap-4 w-full">
                <p-avatar 
                  [label]="getInitials(ag.name)" 
                  shape="circle"
                  size="large"
                  [style]="{'background-color': getAvatarColor(ag.name), 'color': '#ffffff'}"
                ></p-avatar>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-white mb-1">{{ag.name}}</h3>
                  <div class="flex gap-4 items-center flex-wrap text-sm text-gray-400">
                    <span class="flex items-center gap-2">
                      <i class="pi" [ngClass]="ag.contact.icon"></i>
                      {{ag.contact.type}}
                    </span>
                    <span class="flex items-center gap-2">
                      <i class="pi pi-users"></i>
                      {{ag.membersCount}} Mitglieder
                    </span>
                    <span class="flex items-center gap-2">
                      <i class="pi pi-calendar"></i>
                      {{ag.nextMeeting}}
                    </span>
                  </div>
                </div>
              </div>
            </p-accordion-header>

            <p-accordion-content>
              <div class="pt-4 pb-2">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <!-- Left Column -->
                  <div class="lg:col-span-2 space-y-6">
                    <!-- Description -->
                    <div class="bg-gray-800/40 rounded-xl p-5">
                      <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Beschreibung</h4>
                      <p class="text-gray-300 leading-relaxed">{{ag.description}}</p>
                    </div>

                    <!-- Tags & Info Row -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="bg-gray-800/40 rounded-xl p-5">
                        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Schwerpunkte</h4>
                        <div class="flex gap-2 flex-wrap">
                          @for (tag of ag.tags; track tag) {
                            <p-tag [value]="tag" [rounded]="true" severity="secondary"></p-tag>
                          }
                        </div>
                      </div>

                      <div class="bg-gray-800/40 rounded-xl p-5 space-y-4">
                        <div class="flex items-center gap-3">
                          <i class="pi pi-user text-gray-500"></i>
                          <div>
                            <div class="text-xs text-gray-500">Leitung</div>
                            <div class="text-white font-medium">{{ag.lead}}</div>
                          </div>
                        </div>
                        <div class="flex items-center gap-3">
                          <i class="pi pi-clock text-gray-500"></i>
                          <div>
                            <div class="text-xs text-gray-500">Nächstes Treffen</div>
                            <div class="text-white font-medium">{{ag.nextMeeting}}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Right Column: Join -->
                  <div class="lg:col-span-1">
                    <div class="bg-gray-800/60 rounded-xl p-6 text-center h-full flex flex-col">
                      <div class="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
                           [style.backgroundColor]="getAvatarColor(ag.name) + '20'">
                        <i class="pi text-2xl" 
                           [ngClass]="ag.contact.icon"
                           [style.color]="getAvatarColor(ag.name)"></i>
                      </div>
                      
                      <h4 class="text-lg font-bold text-white mb-1">Gruppe beitreten</h4>
                      <p class="text-sm text-gray-400 mb-6">Über {{ag.contact.type}} kommunizieren</p>
                      
                      <div class="flex-1"></div>
                      
                      <a [href]="ag.contact.link || '#'" target="_blank" class="block mb-3">
                        <p-button 
                          [label]="ag.contact.type + ' beitreten'" 
                          [icon]="'pi ' + ag.contact.icon"
                          styleClass="w-full"
                          severity="danger"
                          [raised]="true"></p-button>
                      </a>
                      
                      <div class="flex gap-2">
                        <p-button 
                          icon="pi pi-eye"
                          label="Details" 
                          styleClass="flex-1"
                          severity="secondary"
                          [text]="true"></p-button>
                        <p-button 
                          icon="pi pi-share-alt"
                          label="Teilen" 
                          styleClass="flex-1"
                          severity="secondary"
                          [text]="true"></p-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </p-accordion-content>
          </p-accordion-panel>
        }
      </p-accordion>
    </div>

    <style>
      :host {
        --p-accordion-panel-border-width: 0;
        --p-accordion-header-border-width: 0;
        --p-accordion-content-border-width: 0;
        --p-accordion-header-padding: 1.25rem;
        --p-accordion-content-padding: 0 1.25rem 1.25rem 1.25rem;
        --p-accordion-header-background: rgb(31 41 55 / 0.4);
        --p-accordion-header-hover-background: rgb(31 41 55 / 0.6);
        --p-accordion-header-active-background: rgb(31 41 55 / 0.6);
        --p-accordion-content-background: rgb(31 41 55 / 0.2);
        --p-accordion-header-border-radius: 0.75rem;
      }

      :host ::ng-deep .ag-list .p-accordionpanel {
        margin-bottom: 0.75rem;
        border-radius: 0.75rem;
        overflow: hidden;
        background: rgb(31 41 55 / 0.3);
      }

      :host ::ng-deep .ag-list .p-accordionpanel:last-child {
        margin-bottom: 0;
      }
    </style>
  `
})
export class WorkingGroupsComponent {
  ags: WorkingGroup[] = [
    {
      id: 1,
      name: 'AG Technik & IT',
      description: 'Wir kümmern uns um die Server-Infrastruktur, das WLAN im Vereinsheim und entwickeln interne Tools wie dieses Dashboard.',
      lead: 'Alex T.',
      membersCount: 8,
      nextMeeting: 'Mo, 20:00 Uhr',
      contact: {
        type: 'Discord',
        value: '#tech-talk',
        link: 'https://discord.gg/example',
        icon: 'pi-discord'
      },
      tags: ['IT', 'Infrastructure', 'Coding']
    },
    {
      id: 2,
      name: 'AG Social Media',
      description: 'Content Creation für Instagram, TikTok und LinkedIn. Wir sorgen für Reichweite und gutes Image.',
      lead: 'Maria S.',
      membersCount: 12,
      nextMeeting: 'Mi, 18:30 Uhr',
      contact: {
        type: 'Signal',
        value: 'Invite Link',
        link: 'https://signal.group/example',
        icon: 'pi-comment'
      },
      tags: ['Marketing', 'Design', 'Public Relations']
    },
    {
      id: 3,
      name: 'AG Veranstaltungen',
      description: 'Planung und Durchführung von Sommerfest, Weihnachtsfeier und monatlichen Meetups.',
      lead: 'Jonas B.',
      membersCount: 15,
      nextMeeting: 'Do, 19:00 Uhr',
      contact: {
        type: 'WhatsApp',
        value: 'Gruppe Events',
        link: 'https://chat.whatsapp.com/example',
        icon: 'pi-whatsapp'
      },
      tags: ['Events', 'Orga', 'Party']
    },
    {
      id: 4,
      name: 'AG Nachhaltigkeit',
      description: 'Erarbeitung von Konzepten für einen grüneren Verein und Organisation von Müllsammel-Aktionen.',
      lead: 'Lena M.',
      membersCount: 6,
      nextMeeting: '1. Di im Monat',
      contact: {
        type: 'Email',
        value: 'nachhaltigkeit@verein.de',
        link: 'mailto:nachhaltigkeit@verein.de',
        icon: 'pi-envelope'
      },
      tags: ['Green', 'Umwelt', 'Impact']
    }
  ];

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }
}
