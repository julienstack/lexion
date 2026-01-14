import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-impressum',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
            <div class="max-w-4xl mx-auto px-6 py-16">
                <a routerLink="/" class="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <i class="pi pi-arrow-left"></i>
                    Zurück zur Startseite
                </a>
                
                <h1 class="text-4xl font-bold text-white mb-8">Impressum</h1>
                
                <div class="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 class="text-2xl font-semibold text-white mb-4">Angaben gemäß § 5 TMG</h2>
                        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                            <p class="text-gray-300">
                                <strong class="text-white">[Vereinsname e.V.]</strong><br>
                                [Straße und Hausnummer]<br>
                                [PLZ] [Stadt]<br>
                                Deutschland
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-white mb-4">Vertreten durch</h2>
                        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                            <p class="text-gray-300">
                                [Vorname Nachname], Vorsitzende/r<br>
                                [Vorname Nachname], Stellvertretende/r Vorsitzende/r
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-white mb-4">Kontakt</h2>
                        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                            <p class="text-gray-300">
                                Telefon: [Telefonnummer]<br>
                                E-Mail: <a href="mailto:kontakt@beispiel.de" class="text-red-400 hover:text-red-300">[E-Mail-Adresse]</a>
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-white mb-4">Registereintrag</h2>
                        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                            <p class="text-gray-300">
                                Eintragung im Vereinsregister<br>
                                Registergericht: Amtsgericht [Stadt]<br>
                                Registernummer: VR [Nummer]
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-white mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
                        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                            <p class="text-gray-300">
                                [Vorname Nachname]<br>
                                [Straße und Hausnummer]<br>
                                [PLZ] [Stadt]
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-white mb-4">Haftungsausschluss</h2>
                        
                        <h3 class="text-xl font-medium text-white mt-6 mb-3">Haftung für Inhalte</h3>
                        <p class="text-gray-400 leading-relaxed">
                            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
                            Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. 
                            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
                            nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
                            Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde 
                            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige 
                            Tätigkeit hinweisen.
                        </p>

                        <h3 class="text-xl font-medium text-white mt-6 mb-3">Haftung für Links</h3>
                        <p class="text-gray-400 leading-relaxed">
                            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen 
                            Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
                            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
                            Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche 
                            Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
                        </p>

                        <h3 class="text-xl font-medium text-white mt-6 mb-3">Urheberrecht</h3>
                        <p class="text-gray-400 leading-relaxed">
                            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
                            dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
                            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung 
                            des jeweiligen Autors bzw. Erstellers.
                        </p>
                    </section>
                </div>

                <div class="mt-12 pt-8 border-t border-gray-700/50">
                    <p class="text-gray-500 text-sm">
                        Zuletzt aktualisiert: Januar 2024
                    </p>
                </div>
            </div>
        </div>
    `,
})
export class ImpressumComponent { }
