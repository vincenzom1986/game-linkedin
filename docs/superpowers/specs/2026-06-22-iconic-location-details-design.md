# Specifica di Progetto — Dettagli Iconici e Personalizzazione delle Sedi

Questo documento descrive il design per l'aggiunta di elementi grafici e animati iconici per ciascuna delle sei sedi di carriera nella mappa di gioco.

## Requisiti di Progetto

Gli elementi iconici da aggiungere sono legati a ciascuna azienda e devono integrarsi in modo armonioso con lo stile grafico 16-bit della città e con le meccaniche di movimento del giocatore:

1. **The Big Now**:
   - Una grande **mucca volante** dotata di ali (ispirata alla silhouette del logo aziendale).
   - Posizione fluttuante sopra il tetto dell'edificio.
   - Animazione: Un leggero fluttuare verticale continuo.
   - Collisione: Nessuna (si trova a mezz'aria).

2. **SG Company (SG Holding)**:
   - Un gruppo di **persone che fanno l'aperitivo** all'aperto.
   - Posizionati nel cortile adiacente all'ingresso.
   - Animazione: Piccoli movimenti ciclici di idle (es. alzare i bicchieri, parlare).
   - Collisione: Ostacolo solido.

3. **Armando Testa**:
   - La scultura del **Punt e Mes** (sfera rossa sospesa sopra una mezza sfera rossa) e la statua dell'**ippopotamo azzurro**.
   - Posizionati nel giardino davanti alla sede (a sinistra e a destra del percorso principale).
   - Animazione: La scultura del Punt e Mes è statica; l'ippopotamo ha una leggera animazione ciclica (es. dondolio/rotazione lenta).
   - Collisione: Ostacoli solidi.

4. **Dentsu**:
   - Un **giardino giapponese** ornamentale.
   - Composto da tre elementi fisici: un acero rosso giapponese, una lanterna tradizionale di pietra e un laghetto Koi.
   - Posizione: Aree verdi adiacenti al sentiero d'ingresso.
   - Collisione: Ostacoli solidi per tutti gli elementi.

5. **EY**:
   - Sostituzione della facciata dell'edificio EY con un **grattacielo moderno** in vetro azzurrato e metallo con logo giallo EY.
   - Posizione: Sovrapposto all'edificio EY originale, mantenendo intatta la sagoma e l'impronta a terra originale di `378 x 298` pixel.
   - Collisione: Gestita tramite i blocchi di collisione originali della mappa.

---

## Architettura e Integrazione in Phaser

Gli elementi verranno gestiti come normali Phaser GameObjects in `WorldScene.ts`:

- **Asset di Gioco**: Tutti i file PNG (immagini e spritesheet) verranno caricati in `PreloadScene.ts`.
- **Fisica (Fisica Arcade)**:
  - Gli elementi solidi verranno inseriti in un `StaticGroup` fisico di Phaser per consentire collisioni ottimali con il giocatore senza consumi eccessivi di CPU.
  - Verrà definita una collisione tra il giocatore e il gruppo tramite `this.physics.add.collider`.
  - La dimensione del corpo fisico (`body.setSize`) verra ridotta alla base dell'oggetto per consentire al giocatore di camminare dietro la parte superiore degli elementi (es. la chioma degli alberi o le statue).
- **Animazioni**:
  - Il fluttuare della mucca e il dondolio dell'ippopotamo saranno realizzati tramite **Tweens di Phaser**, leggeri e precisi.
  - L'animazione del gruppo che fa l'aperitivo userà un'animazione a fotogrammi (`this.anims.create`) basata su uno spritesheet.

---

## Punti di Verifica

- **Compilazione**: Il progetto deve compilare senza errori TypeScript.
- **Raggiungibilità**: Il sentiero che conduce alle porte d'ingresso non deve essere bloccato da nessuno dei nuovi ostacoli.
- **Test**: Tutti i test esistenti e nuovi devono superare con successo.
