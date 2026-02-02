# 📖 PulseDeck Handbuch

Willkommen in der offiziellen Dokumentation von PulseDeck. Dieses Handbuch begleitet dich von der ersten Anmeldung bis zur Verwaltung deiner Organisation.

---

## 🏁 Erste Schritte

### Anmeldung & Sicherheit
PulseDeck verzichtet auf komplizierte Passwort-Regeln und setzt auf **Passwortlosen Login (Magic Link)**.
1.  Gib deine E-Mail-Adresse ein.
2.  Du erhältst sofort einen Link per E-Mail.
3.  Klicke den Link – du bist eingeloggt.

**Optionales Passwort:**
Wenn du dich klassisch anmelden möchtest, kannst du in deinem **Profil** (`Avatar > Mein Profil`) ein Passwort festlegen. Du hast dann beim Login die Wahl zwischen Magic Link und Passwort.

### Profil & Skills
Ein vollständiges Profil hilft deiner Organisation, deine Talente zu nutzen.
*   **Foto:** Lädt ein Gesicht zur E-Mail (sichtbar für eingeloggte Mitglieder).
*   **Kontaktdaten:** Telefon und Adresse für die interne Vernetzung.
*   **Skills (Fähigkeiten):**
    *   Im Reiter **"Fähigkeiten & Interessen"** kannst du angeben, was du gut kannst (z.B. *Grafikdesign*, *Fahrdienst*, *Juristisches*).
    *   Diese "Tags" helfen dem Vorstand, bei Bedarf die richtigen Personen anzusprechen.

### Benachrichtigungen
PulseDeck nutzt **Push-Benachrichtigungen** direkt im Browser.
*   Aktiviere sie im Profil unter "Benachrichtigungen".
*   Du wirst informiert über neue Termine, Umfragen oder wenn du erwähnt wirst.
*   Funktioniert auch auf dem Smartphone (Android & iOS), wenn du die App zum Startbildschirm hinzufügst.

---

## 📅 Kalender & Events

### Termine finden & Filtern
Der Kalender zeigt alle Veranstaltungen deiner Organisation.
*   **Ansichten:** Wechsele zwischen Liste, Woche und Monat.
*   **Filter:** Blende Termine von Arbeitsgruppen (AGs) aus, die dich nicht interessieren.
*   **Sync:** Nutze den **"Exportieren"** Button, um den Kalender in dein privates Outlook, Google Calendar oder Apple Calendar zu abonnieren. Der Link enthält ein sicheres Token.

### Anmelden & Helferslots
Bei den meisten Terminen wird um eine Rückmeldung gebeten.
*   **Status:** Klicke auf "Zusagen", "Absagen" oder "Vielleicht".
*   **Helferslots (Schichtplan):**
    *   Bei großen Events (Sommerfeste, Stände) werden konkrete Aufgaben vergeben.
    *   Du siehst Slots wie *"14:00 - 16:00 Uhr Aufbau"*.
    *   Klicke auf einen freien Slot, um ihn zu übernehmen. Dein Name erscheint dann für alle sichtbar im Plan.

### Events teilen & Gäste
Du willst Freunde oder externe Gäste einladen?
*   **Public Page:** Jeder Termin hat eine öffentliche Vorschau-Seite. Kopiere einfach den Link aus dem Browser oder nutze den "Teilen"-Button.
*   **Gäste-Organisationen:** Admins können befreundete Vereine direkt einladen. Diese sehen den Termin dann in ihrem eigenen Dashboard (Einladungskarte).

---

## 📢 Kommunikation

### News Feed
Der Feed ist der zentrale Nachrichtenkanal. Anders als im Chat verschwinden wichtige Infos hier nicht.
*   **Formatierung:** Du kannst Texte fett/kursiv schreiben, Listen nutzen und Bilder anhängen.
*   **Sichtbarkeit:** Beiträge müssen oft erst von einem Moderator freigegeben werden (Status "Review").

### Umfragen & Abstimmungen
Für schnelle Meinungsbilder gibt es Umfragen direkt im Feed.
*   **Abstimmen:** Klicke einfach auf eine Option. Das Ergebnis wird sofort als Balkengrafik angezeigt.
*   **Live-Update:** Du siehst Änderungen in Echtzeit.
*   **Ändern:** Du kannst deine Stimme jederzeit ändern, solange die Umfrage läuft.

### E-Mail Newsletter
Wichtige Ankündigungen landen zusätzlich als E-Mail in deinem Postfach.
*   Das Design ist automatisch im Branding deiner Organisation gehalten.
*   Du kannst dich nicht von systemkritischen Mails abmelden, aber Marketing-Mails reduzieren.

---

## 👥 Mitglieder & Rollen

### Mitgliederliste
Finde Ansprechpartner in deiner Organisation.
*   **Suche:** Suche nach Namen oder filtere nach Skills ("Wer kann Video-Schnitt?").
*   **Karten:** Zeigen Rolle (Vorstand, Mitglied) und Kontaktinfos.

### Rollenkonzept
*   **Mitglied:** Standard-Recht. Kann Termine sehen, zusagen, Beiträge vorschlagen.
*   **Committee (Vorstand):** Kann Beiträge freigeben, vertrauliche Ordner sehen, Termine anlegen.
*   **Admin:** Technischer Vollzugriff. Bearbeitet Einstellungen, Design und Nutzer.

---

## 📂 Dateien & Wiki

### Dateiverwaltung
Der Cloud-Speicher ersetzt Dropbox & Co.
*   **Sichtbarkeit:** Ordner können auf "Nur Vorstand" oder "Nur AG XY" beschränkt sein. Achte auf das Schloss-Icon.
*   **Preview:** PDFs und Bilder können direkt im Browser angesehen werden.

### Wiki (Wissensdatenbank)
Hier wird langfristiges Wissen dokumentiert (Satzung, Protokolle, How-Tos).
*   **Struktur:** Artikel sind hierarchisch sortiert.
*   **Bearbeiten:** Jeder kann Änderungen vorschlagen. Die Formatierung erfolgt in Markdown.

---

## 🏢 Für Admins: Verwaltung

### Einstellungen & Branding
Im Bereich `Einstellungen > Organisation` definierst du den Look & Feel.
*   **Branding:** Lade Logo und Icon hoch. Wähle die **Primärfarbe** (z.B. Parteifarbe). Dies färbt Buttons, Links und E-Mails automatisch ein.
*   **Rechtliches:** Hinterlege Impressum und Datenschutz-Links für die öffentlichen Seiten.

### Nutzer einladen
1.  Gehe zu `Mitglieder > Hinzufügen`.
2.  Gib die E-Mail ein.
3.  Der Nutzer erhält eine Einladungs-Mail mit Link.
4.  **Tipp:** Du kannst den Einladungs-Link auch kopieren und per WhatsApp senden.

### E-Mail Setup (SMTP)
Damit PulseDeck E-Mails versenden kann (Newsletter, Einladungen), musst du einen SMTP-Server hinterlegen.
*   Gehe zu `Einstellungen > Newsletter`.
*   Trage Host, Port, User und Passwort deines Mail-Providers ein.
*   Teste die Verbindung mit "Test-Mail senden".

---

## ❓ Häufige Fragen (FAQ)

### Ich kann mich nicht einloggen.
*   Prüfe den Spam-Ordner nach dem Magic Link.
*   Der Link ist nur 15 Minuten gültig. Fordere notfalls einen neuen an.
*   Wenn du ein Passwort gesetzt hast, kannst du es über "Passwort vergessen" zurücksetzen (sendet wieder einen Magic Link).

### Ich sehe keine Dateien/Termine.
Wahrscheinlich fehlen dir Berechtigungen.
*   Bist du in der richtigen **Organisation** (oben links wechseln)?
*   Gehört der Inhalt zu einer **AG**, in der du nicht bist? (Tritt der AG bei).

### Wie lade ich Dateien hoch?
Navigiere in den gewünschten Ordner und klicke auf "Hochladen". Wenn der Button fehlt, hast du keine Schreibrechte in diesem Ordner (z.B. Vorstandsbereich).

---
*© 2026 PulseDeck Dokumentation • v1.2*
