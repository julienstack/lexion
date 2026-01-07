import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';

interface Member {
  id: number;
  name: string;
  role: string;
  status: 'Active' | 'Inactive';
  email: string;
  joinDate: string;
  avatar?: string;
}

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    AvatarModule,
    MenuModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white">Mitgliederverwaltung</h1>
          <p class="text-gray-400 mt-1">Verwalte alle Mitglieder an einem Ort</p>
        </div>
        <div class="flex gap-2">
          <p-button label="Exportieren" icon="pi pi-download" severity="secondary" [outlined]="true"></p-button>
          <p-button label="Neues Mitglied" icon="pi pi-user-plus" severity="danger" [raised]="true"></p-button>
        </div>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <p-table 
          [value]="members" 
          [paginator]="true" 
          [rows]="10" 
          [showCurrentPageReport]="true"
          currentPageReportTemplate="{first} bis {last} von {totalRecords} Mitgliedern"
          [rowsPerPageOptions]="[10, 25, 50]"
          [globalFilterFields]="['name', 'email', 'role']"
          styleClass="custom-table"
          [(selection)]="selectedMembers"
          dataKey="id">
          
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 4rem" class="!bg-gray-800/50 !border-gray-700">
                <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
              </th>
              <th class="!bg-gray-800/50 !text-gray-300 !border-gray-700">
                <div class="flex items-center gap-2">
                  <span class="font-semibold">Mitglied</span>
                </div>
              </th>
              <th class="!bg-gray-800/50 !text-gray-300 !border-gray-700">
                <span class="font-semibold">Rolle</span>
              </th>
              <th class="!bg-gray-800/50 !text-gray-300 !border-gray-700">
                <span class="font-semibold">Status</span>
              </th>
              <th class="!bg-gray-800/50 !text-gray-300 !border-gray-700">
                <span class="font-semibold">Beitritt</span>
              </th>
              <th class="!bg-gray-800/50 !text-gray-300 !border-gray-700 text-center">
                <span class="font-semibold">Aktionen</span>
              </th>
            </tr>
            <tr>
              <th class="!bg-gray-900 !border-gray-700"></th>
              <th class="!bg-gray-900 !border-gray-700">
                <p-iconfield iconPosition="left">
                  <p-inputicon styleClass="pi pi-search" />
                  <input 
                    pInputText 
                    type="text" 
                    (input)="onGlobalFilter($event)" 
                    placeholder="Suchen..." 
                    class="w-full !bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500" />
                </p-iconfield>
              </th>
              <th class="!bg-gray-900 !border-gray-700"></th>
              <th class="!bg-gray-900 !border-gray-700"></th>
              <th class="!bg-gray-900 !border-gray-700"></th>
              <th class="!bg-gray-900 !border-gray-700"></th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-member>
            <tr class="!bg-gray-900/50 hover:!bg-gray-800/50 !border-gray-800 transition-colors">
              <td class="!border-gray-800">
                <p-tableCheckbox [value]="member"></p-tableCheckbox>
              </td>
              <td class="!border-gray-800">
                <div class="flex items-center gap-3">
                  <p-avatar 
                    [label]="getInitials(member.name)" 
                    shape="circle"
                    [style]="{'background-color': getAvatarColor(member.name), 'color': '#ffffff'}"
                    class="flex-shrink-0"></p-avatar>
                  <div>
                    <div class="font-semibold text-white">{{member.name}}</div>
                    <div class="text-sm text-gray-400">{{member.email}}</div>
                  </div>
                </div>
              </td>
              <td class="!border-gray-800">
                <span class="text-gray-300">{{member.role}}</span>
              </td>
              <td class="!border-gray-800">
                <p-tag 
                  [value]="member.status === 'Active' ? 'Aktiv' : 'Inaktiv'" 
                  [severity]="member.status === 'Active' ? 'success' : 'danger'"
                  [rounded]="true"></p-tag>
              </td>
              <td class="!border-gray-800">
                <span class="text-gray-400 text-sm">{{member.joinDate}}</span>
              </td>
              <td class="!border-gray-800">
                <div class="flex justify-center gap-2">
                  <p-button 
                    icon="pi pi-eye" 
                    [rounded]="true" 
                    [text]="true" 
                    severity="secondary"
                    size="small"
                    pTooltip="Profil ansehen"></p-button>
                  <p-button 
                    icon="pi pi-pencil" 
                    [rounded]="true" 
                    [text]="true" 
                    severity="info"
                    size="small"
                    pTooltip="Bearbeiten"></p-button>
                  <p-button 
                    icon="pi pi-trash" 
                    [rounded]="true" 
                    [text]="true" 
                    severity="danger"
                    size="small"
                    pTooltip="Löschen"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="!bg-gray-900 !border-gray-800 text-center py-8">
                <div class="text-gray-400">
                  <i class="pi pi-users text-4xl mb-3"></i>
                  <p>Keine Mitglieder gefunden</p>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="summary">
            <div class="!bg-gray-900 !border-gray-800 !text-gray-400 px-4 py-3">
              Gesamt: {{members.length}} Mitglieder
              <span *ngIf="selectedMembers.length > 0" class="ml-3 text-blue-400">
                ({{selectedMembers.length}} ausgewählt)
              </span>
            </div>
          </ng-template>
        </p-table>
      </div>
    </div>

    <style>
      :host ::ng-deep .custom-table .p-datatable-wrapper {
        background: transparent;
      }
      
      :host ::ng-deep .custom-table .p-datatable-thead > tr > th {
        background-color: rgb(31 41 55 / 0.5) !important;
        color: rgb(209 213 219) !important;
        border-color: rgb(55 65 81) !important;
        font-weight: 600;
        padding: 1rem;
      }

      :host ::ng-deep .custom-table .p-datatable-tbody > tr {
        background-color: rgb(17 24 39 / 0.5) !important;
        border-color: rgb(31 41 55) !important;
        color: rgb(229 231 235) !important;
      }

      :host ::ng-deep .custom-table .p-datatable-tbody > tr:hover {
        background-color: rgb(31 41 55 / 0.5) !important;
      }

      :host ::ng-deep .custom-table .p-datatable-tbody > tr > td {
        border-color: rgb(31 41 55) !important;
        padding: 1rem;
      }

      :host ::ng-deep .custom-table .p-paginator {
        background: rgb(17 24 39) !important;
        border-color: rgb(31 41 55) !important;
        color: rgb(156 163 175) !important;
        padding: 1rem;
      }

      :host ::ng-deep .custom-table .p-paginator .p-paginator-pages .p-paginator-page {
        color: rgb(156 163 175) !important;
        background: transparent;
        border-radius: 0.5rem;
      }

      :host ::ng-deep .custom-table .p-paginator .p-paginator-pages .p-paginator-page:hover {
        background: rgb(55 65 81) !important;
        color: rgb(255 255 255) !important;
      }

      :host ::ng-deep .custom-table .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
        background: rgb(239 68 68) !important;
        color: rgb(255 255 255) !important;
      }

      :host ::ng-deep .custom-table .p-checkbox .p-checkbox-box {
        background: rgb(31 41 55);
        border-color: rgb(55 65 81);
      }

      :host ::ng-deep .custom-table .p-checkbox .p-checkbox-box.p-highlight {
        background: rgb(239 68 68);
        border-color: rgb(239 68 68);
      }

      :host ::ng-deep .p-inputtext {
        background: rgb(31 41 55);
        border-color: rgb(55 65 81);
        color: white;
      }

      :host ::ng-deep .p-inputtext:focus {
        border-color: rgb(239 68 68);
        box-shadow: 0 0 0 0.2rem rgb(239 68 68 / 0.25);
      }
    </style>
  `
})
export class MembersComponent {
  members: Member[] = [
    { id: 1, name: 'Max Mustermann', role: 'Vorstand', status: 'Active', email: 'max@example.com', joinDate: '15.01.2024' },
    { id: 2, name: 'Erika Musterfrau', role: 'Mitglied', status: 'Active', email: 'erika@example.com', joinDate: '03.03.2024' },
    { id: 3, name: 'John Doe', role: 'Kassierer', status: 'Inactive', email: 'john@example.com', joinDate: '22.05.2023' },
    { id: 4, name: 'Jane Roe', role: 'Schriftführer', status: 'Active', email: 'jane@example.com', joinDate: '11.08.2024' },
    { id: 5, name: 'Hans Müller', role: 'Mitglied', status: 'Active', email: 'hans@example.com', joinDate: '30.11.2024' },
    { id: 6, name: 'Sarah Schmidt', role: 'Vorstand', status: 'Active', email: 'sarah@example.com', joinDate: '05.02.2024' },
    { id: 7, name: 'Tom Weber', role: 'Mitglied', status: 'Active', email: 'tom@example.com', joinDate: '18.06.2024' },
    { id: 8, name: 'Lisa König', role: 'Mitglied', status: 'Inactive', email: 'lisa@example.com', joinDate: '29.09.2023' },
  ];

  selectedMembers: Member[] = [];

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

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    // Table filtering will be handled by PrimeNG
  }
}
