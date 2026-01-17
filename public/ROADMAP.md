# 🚀 Lexion Roadmap

> **Letzte Aktualisierung:** 17. Januar 2026  
> **Aktuelle Version:** Alpha 0.3.0

---

## 📋 Was ist diese Seite?

Diese Roadmap zeigt dir, welche Features geplant sind, woran gerade gearbeitet wird und was bereits umgesetzt wurde. Du kannst hier den Fortschritt von Lexion verfolgen!

---

## 🎯 Aktuell in Arbeit

<!-- AI-TODO: Aktuelle Aufgaben hier -->

*Aktuell keine laufenden Entwicklungen. Nächster Sprint wird bald gestartet!*

---

## 📅 Geplante Features

### Priorität: Hoch ⭐⭐⭐

- [x] **Termin-Anmeldung** – Mitglieder können sich für Events an-/abmelden ✅
- [x] **Dateiverwaltung** – Upload von Dokumenten mit Suche ✅
- [x] **iCal-Export** – Kalender-Sync für externe Apps ✅
- [x] **Dashboard-Statistiken** – Echte Zahlen statt Platzhalter ✅

### Priorität: Mittel ⭐⭐

- [ ] **Kommentare bei Beiträgen** – Diskussionen im Feed
- [ ] **Abstimmungen/Umfragen** – Einfache Polls für Mitglieder
- [ ] **Aufgaben für AGs** – To-Do-Listen innerhalb einer AG
- [ ] **Mitglieder-Tags** – Flexible Kennzeichnungen

### Priorität: Niedrig ⭐

- [ ] **Gamification** – Punkte/Badges für aktive Teilnahme
- [ ] **PWA/Mobile Push** – Native App-Feeling
- [ ] **Öffentliche Landingpage** – Infos für Externe
- [ ] **Jahresberichte** – Automatische Statistiken

---

## ✅ Abgeschlossen (Patch Notes)

### v0.5.0 – 17. Januar 2026

**📊 Dashboard-Statistiken**
- [x] StatisticsService für Echtzeit-Zähler
- [x] Statistik-Karten auf Dashboard-Startseite
- [x] Mitglieder-Zähler (Gesamt + Aktiv)
- [x] Termine-Zähler (Anstehend + Diesen Monat)
- [x] Wiki-Artikel, Dateien und News-Zähler
- [x] AG-Anzahl als Zusatzinfo

---

### v0.4.0 – 17. Januar 2026

**📁 Dateiverwaltung**
- [x] files Tabelle mit RLS-Policies für Berechtigungen
- [x] FileService für Upload, Download, Suche
- [x] Files-Komponente mit Grid-Ansicht
- [x] Ordner-Navigation (Breadcrumbs)
- [x] Sichtbarkeitsoptionen (Mitglieder/Vorstand/Admin/AG)
- [x] Sidebar-Link "Dateien"

---

### v0.3.1 – 17. Januar 2026

**📤 iCal-Export**
- [x] Edge Function für .ics-Generierung
- [x] Download-Button im Kalender
- [x] Abo-Link zum Kopieren (für Kalender-Apps)
- [x] Optional: AG-spezifische Kalender

---

### v0.3.0 – 17. Januar 2026

**📅 Termin-Anmeldung**
- [x] event_registrations Tabelle mit RLS-Policies
- [x] EventRegistrationService für An-/Abmeldung
- [x] Anmelde-Button bei jedem Termin im Kalender
- [x] Teilnehmerliste mit Dialog-Ansicht
- [x] Status-Anzeige (Zugesagt/Vielleicht)

---

### v0.2.1 – 17. Januar 2026

**📧 E-Mail-Templates**
- [x] Einfaches, zugängliches Newsletter-Design (Link-Liste)
- [x] Konfigurierbar: Logo-URL, Footer-Text, Primärfarbe
- [x] Datenbank-Migration für Template-Einstellungen
- [x] UI im Feed-Bereich für E-Mail-Design

**🗺️ Roadmap-Seite**
- [x] ROADMAP.md als zentrale Planungsdatei
- [x] Roadmap-Komponente mit Markdown-Rendering
- [x] Erreichbar über Alpha-Badge (Map-Icon)

---

### v0.2.0 – 17. Januar 2026

**🔐 Berechtigungssystem**
- [x] Globale Berechtigungen für Mitglieder (feed:create, wiki:edit, etc.)
- [x] AG-spezifische Rollen (Mitglied, Admin, Leitung)
- [x] PermissionsService für reaktive Berechtigungsprüfung
- [x] Mitglieder-Dialog mit Rollen- und Berechtigungsverwaltung
- [x] AG-Mitglieder-Verwaltungsdialog
- [x] SQL-Migration für permissions und ag_memberships

**🎨 UI-Verbesserungen**
- [x] Feed: Buttons nur für berechtigte Nutzer sichtbar
- [x] Wiki: Edit-Button basierend auf Berechtigung
- [x] Kalender: Event-Erstellung berechtigungsgesteuert
- [x] AG-Seite: Rollen-Badge und Mitgliederverwaltung

---

### v0.1.0 – 14. Januar 2026

**🎉 Erster Alpha-Release**
- [x] Dashboard mit Navigation
- [x] Mitgliederverwaltung
- [x] Arbeitsgruppen (AGs)
- [x] Kalender/Events
- [x] Wiki/Wissensdatenbank
- [x] Feed/News mit Newsletter
- [x] Kontakte
- [x] Onboarding-Flow
- [x] Feedback-System
- [x] Issue-Tracker
- [x] Dark Mode

---

## 💡 Feature-Wünsche

Hast du eine Idee? Nutze den **Feedback-Button** (Alpha-Badge unten links) oder melde dich beim Entwickler-Team!

---

<!-- 
================================================================================
AI-INTERNAL: TODO-Liste für Entwicklung
(Dieser Bereich wird nicht in der UI angezeigt)
================================================================================

## Backlog (Priorisiert)

### Sprint: Event-Anmeldung (NEXT)
- [ ] event_registrations Tabelle in Supabase
- [ ] EventRegistrationService
- [ ] Anmelde-Button im Kalender
- [ ] Teilnehmerliste pro Event
- [ ] RLS-Policies

### Sprint: Dateiverwaltung
- [ ] Supabase Storage Bucket konfigurieren
- [ ] File Upload Component
- [ ] Ordner-Struktur
- [ ] Suche/Filter
- [ ] Vorschau für PDFs/Bilder

### Sprint: iCal Export
- [ ] iCal-Format generieren
- [ ] Download-Button im Kalender
- [ ] Personalisierter iCal-Link (mit Token)
- [ ] AG-spezifische Kalender

## Archiv (Abgeschlossen)

### Sprint: Email Templates (v0.2.1, 17.01.2026)
- [x] DB Migration für logo_url, footer_text, primary_color
- [x] Newsletter Edge Function vereinfacht
- [x] UI für Email Design in Feed-Konfiguration
- [x] Einfaches HTML-Template (Link-Liste)

### Sprint: Roadmap (v0.2.1, 17.01.2026)
- [x] ROADMAP.md erstellen
- [x] Roadmap-Komponente mit Markdown-Rendering
- [x] Link im Alpha-Badge
- [x] Route /dashboard/roadmap

### Sprint: Permissions (v0.2.0, 17.01.2026)
- [x] SQL-Migration Permissions
- [x] PermissionsService
- [x] Member Model erweitert
- [x] WorkingGroupsService AG-Rollen
- [x] Feed/Wiki/Calendar Berechtigungen
- [x] Member Dialog mit Permissions UI
- [x] AG Members Dialog

-->
