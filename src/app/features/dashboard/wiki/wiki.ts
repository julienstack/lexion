import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface WikiDoc {
    id: number;
    title: string;
    description: string;
    lastUpdated: string;
    author: string;
    category: 'General' | 'Finance' | 'Tech' | 'Legal';
    status: 'Published' | 'Draft' | 'Review';
}

@Component({
    selector: 'app-wiki',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule],
    template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-3xl font-bold text-white">Wiki & Dokumentation</h1>
            <p class="text-gray-400 mt-1">Zentrale Wissensdatenbank für alle wichtigen Informationen</p>
        </div>
        <p-button label="Neuer Artikel" icon="pi pi-plus" severity="success" [raised]="true"></p-button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar: Categories -->
        <div class="lg:col-span-1">
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 sticky top-6">
            <h3 class="text-lg font-bold text-white mb-4">Kategorien</h3>
            <ul class="space-y-2">
              <li>
                <button 
                  (click)="filterCategory(null)"
                  [class.bg-gray-800]="selectedCategory === null"
                  [class.text-white]="selectedCategory === null"
                  class="w-full text-left p-3 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white flex justify-between items-center">
                  <span>Alle</span>
                  <span class="bg-gray-700 text-xs px-2 py-0.5 rounded-full">{{docs.length}}</span>
                </button>
              </li>
              <li>
                <button 
                  (click)="filterCategory('General')"
                  [class.bg-gray-800]="selectedCategory === 'General'"
                  [class.text-white]="selectedCategory === 'General'"
                  class="w-full text-left p-3 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white flex justify-between items-center">
                  <span>Allgemein</span>
                  <span class="bg-gray-700 text-xs px-2 py-0.5 rounded-full">{{getCountByCategory('General')}}</span>
                </button>
              </li>
              <li>
                <button 
                  (click)="filterCategory('Finance')"
                  [class.bg-gray-800]="selectedCategory === 'Finance'"
                  [class.text-white]="selectedCategory === 'Finance'"
                  class="w-full text-left p-3 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white flex justify-between items-center">
                  <span>Finanzen</span>
                  <span class="bg-gray-700 text-xs px-2 py-0.5 rounded-full">{{getCountByCategory('Finance')}}</span>
                </button>
              </li>
              <li>
                <button 
                  (click)="filterCategory('Tech')"
                  [class.bg-gray-800]="selectedCategory === 'Tech'"
                  [class.text-white]="selectedCategory === 'Tech'"
                  class="w-full text-left p-3 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white flex justify-between items-center">
                  <span>Technik</span>
                  <span class="bg-gray-700 text-xs px-2 py-0.5 rounded-full">{{getCountByCategory('Tech')}}</span>
                </button>
              </li>
              <li>
                <button 
                  (click)="filterCategory('Legal')"
                  [class.bg-gray-800]="selectedCategory === 'Legal'"
                  [class.text-white]="selectedCategory === 'Legal'"
                  class="w-full text-left p-3 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white flex justify-between items-center">
                  <span>Rechtliches</span>
                  <span class="bg-gray-700 text-xs px-2 py-0.5 rounded-full">{{getCountByCategory('Legal')}}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Main Content: Table -->
        <div class="lg:col-span-3">
          <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <p-table 
              [value]="filteredDocs" 
              [paginator]="true" 
              [rows]="10"
              [showCurrentPageReport]="true"
              currentPageReportTemplate="{first} bis {last} von {totalRecords} Artikeln"
              [rowsPerPageOptions]="[10, 25, 50]"
              styleClass="custom-table">
              
              <ng-template pTemplate="caption">
                <div class="flex justify-between items-center p-4 bg-gray-900">
                  <p-iconfield iconPosition="left" class="w-full md:w-80">
                    <p-inputicon styleClass="pi pi-search" />
                    <input 
                      pInputText 
                      type="text" 
                      (input)="onSearch($event)" 
                      placeholder="Artikel durchsuchen..." 
                      class="w-full !bg-gray-800 !border-gray-700 !text-white placeholder:!text-gray-500" />
                  </p-iconfield>
                </div>
              </ng-template>

              <ng-template pTemplate="header">
                <tr>
                  <th class="!bg-gray-800/50 !text-gray-300 !border-gray-700">
                    <span class="font-semibold">Titel</span>
                  </th>
                  <th class="!bg-gray-800/50 !text-gray-300 !border-gray-700">
                    <span class="font-semibold">Kategorie</span>
                  </th>
                  <th class="!bg-gray-800/50 !text-gray-300 !border-gray-700">
                    <span class="font-semibold">Autor</span>
                  </th>
                  <th class="!bg-gray-800/50 !text-gray-300 !border-gray-700">
                    <span class="font-semibold">Status</span>
                  </th>
                  <th class="!bg-gray-800/50 !text-gray-300 !border-gray-700">
                    <span class="font-semibold">Letztes Update</span>
                  </th>
                  <th class="!bg-gray-800/50 !text-gray-300 !border-gray-700 text-center">
                    <span class="font-semibold">Aktionen</span>
                  </th>
                </tr>
              </ng-template>

              <ng-template pTemplate="body" let-doc>
                <tr class="!bg-gray-900/50 hover:!bg-gray-800/50 !border-gray-800 transition-colors cursor-pointer">
                  <td class="!border-gray-800">
                    <div>
                      <div class="font-semibold text-white">{{doc.title}}</div>
                      <div class="text-xs text-gray-500 mt-1">{{doc.description}}</div>
                    </div>
                  </td>
                  <td class="!border-gray-800">
                    <p-tag [value]="getCategoryLabel(doc.category)" [severity]="getCategorySeverity(doc.category)"></p-tag>
                  </td>
                  <td class="!border-gray-800 text-gray-400">{{doc.author}}</td>
                  <td class="!border-gray-800">
                    <div class="flex items-center gap-2">
                      <i class="pi text-sm" [ngClass]="{
                        'pi-check-circle text-green-500': doc.status === 'Published',
                        'pi-file text-yellow-500': doc.status === 'Draft',
                        'pi-eye text-blue-500': doc.status === 'Review'
                      }"></i>
                      <span class="text-sm" [ngClass]="{
                        'text-green-500': doc.status === 'Published',
                        'text-yellow-500': doc.status === 'Draft',
                        'text-blue-500': doc.status === 'Review'
                      }">{{getStatusLabel(doc.status)}}</span>
                    </div>
                  </td>
                  <td class="!border-gray-800 text-gray-400 text-sm">{{doc.lastUpdated}}</td>
                  <td class="!border-gray-800">
                    <div class="flex justify-center gap-2">
                      <p-button 
                        icon="pi pi-eye" 
                        [rounded]="true" 
                        [text]="true" 
                        severity="secondary"
                        size="small"></p-button>
                      <p-button 
                        icon="pi pi-pencil" 
                        [rounded]="true" 
                        [text]="true" 
                        severity="info"
                        size="small"></p-button>
                    </div>
                  </td>
                </tr>
              </ng-template>

              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="6" class="!bg-gray-900 !border-gray-800 text-center py-8">
                    <div class="text-gray-400">
                      <i class="pi pi-file text-4xl mb-3"></i>
                      <p>Keine Artikel gefunden</p>
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
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

      :host ::ng-deep .custom-table .p-datatable-header {
        background: rgb(17 24 39) !important;
        border: none !important;
        padding: 0 !important;
      }
    </style>
  `
})
export class WikiComponent {
    docs: WikiDoc[] = [
        { id: 1, title: 'Onboarding Guide 2026', description: 'Wichtiges für neue Mitglieder', lastUpdated: '05.01.2026', author: 'Max M.', category: 'General', status: 'Published' },
        { id: 2, title: 'Reisekostenabrechnung', description: 'Formulare and How-To', lastUpdated: '12.12.2025', author: 'Sarah K.', category: 'Finance', status: 'Published' },
        { id: 3, title: 'WLAN Zugang Vereinsheim', description: 'Passwörter und Konfiguration', lastUpdated: '02.01.2026', author: 'Admin', category: 'Tech', status: 'Published' },
        { id: 4, title: 'Satzung v3.1', description: 'Aktuelle Satzung nach Beschluss', lastUpdated: '20.11.2025', author: 'Vorstand', category: 'Legal', status: 'Published' },
        { id: 5, title: 'Social Media Guidelines', description: "Do's and Don'ts für Insta & Co.", lastUpdated: '07.01.2026', author: 'Marketing Team', category: 'General', status: 'Draft' },
        { id: 6, title: 'Jahresbudget 2026', description: 'Vorläufiger Plan', lastUpdated: '06.01.2026', author: 'Schatzmeister', category: 'Finance', status: 'Review' },
        { id: 7, title: 'DSGVO Merkblatt', description: 'Umgang mit Mitgliederdaten', lastUpdated: '10.10.2025', author: 'Datenschutz', category: 'Legal', status: 'Published' },
        { id: 8, title: 'Drucker Einrichtung', description: 'Treiber und IP-Adressen', lastUpdated: '15.08.2025', author: 'Admin', category: 'Tech', status: 'Published' },
    ];

    filteredDocs: WikiDoc[] = [...this.docs];
    selectedCategory: string | null = null;

    getCategorySeverity(category: string) {
        switch (category) {
            case 'General': return 'info';
            case 'Finance': return 'success';
            case 'Tech': return 'contrast';
            case 'Legal': return 'danger';
            default: return 'secondary';
        }
    }

    getCategoryLabel(category: string): string {
        const labels: Record<string, string> = {
            'General': 'Allgemein',
            'Finance': 'Finanzen',
            'Tech': 'Technik',
            'Legal': 'Rechtlich'
        };
        return labels[category] || category;
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'Published': 'Veröffentlicht',
            'Draft': 'Entwurf',
            'Review': 'In Prüfung'
        };
        return labels[status] || status;
    }

    getCountByCategory(category: string): number {
        return this.docs.filter(doc => doc.category === category).length;
    }

    filterCategory(category: string | null) {
        this.selectedCategory = category;
        if (category === null) {
            this.filteredDocs = [...this.docs];
        } else {
            this.filteredDocs = this.docs.filter(doc => doc.category === category);
        }
    }

    onSearch(event: Event) {
        const input = event.target as HTMLInputElement;
        const searchTerm = input.value.toLowerCase();

        let baseList = this.selectedCategory === null
            ? this.docs
            : this.docs.filter(doc => doc.category === this.selectedCategory);

        if (searchTerm) {
            this.filteredDocs = baseList.filter(doc =>
                doc.title.toLowerCase().includes(searchTerm) ||
                doc.description.toLowerCase().includes(searchTerm) ||
                doc.author.toLowerCase().includes(searchTerm)
            );
        } else {
            this.filteredDocs = baseList;
        }
    }
}
