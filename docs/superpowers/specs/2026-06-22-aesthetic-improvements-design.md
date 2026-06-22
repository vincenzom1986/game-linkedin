# Specifica di Progetto — Miglioramento Estetico ed Esperienza Utente (Stile JRPG)

**Data:** 2026-06-22  
**Stato:** Approvato in conversazione; specifica pronta per la revisione  
**Ambito:** Aggiungere dinamismo, animazioni fluide e particellari per elevare l'estetica del gioco a uno standard premium.

---

## 1. Obiettivi e Requisiti

L'incremento mira ad arricchire il gioco con feedback visivi e micro-animazioni coerenti con lo stile 16-bit RPG, migliorando sia l'usabilità sia il fattore di coinvolgimento visivo:

1. **Testo Dinamico (Typewriter):**
   - Il testo delle schede di carriera e contatti viene digitato a forte velocità (durata totale del processo fissa a circa ~150ms per pagina, indipendentemente dalla lunghezza).
   - Aggiunta di un cursore retro lampeggiante (`▊`) durante la scrittura.
   - Pressione dei tasti di interazione (INVIO/SPAZIO) o clic/tap sullo schermo salta istantaneamente la digitazione per mostrare tutto il testo.

2. **Transizioni del Pannello Dialoghi:**
   - Animazione di slide-up (dal basso verso l'alto) combinata con un fade-in all'apertura del pannello (durata: 300ms, curva: `Cubic.easeOut`).
   - Animazione di slide-down (dall'alto verso il basso) combinata con un fade-out alla chiusura (durata: 200ms, curva: `Cubic.easeIn`).

3. **Prompt di Interazione Fluttuante:**
   - Rimozione del vecchio banner statico a fondo schermo.
   - Introduzione di una nuvoletta di fumetto vettoriale (`[SPAZIO]` o `[INVIO]`) disegnata a runtime che compare a mezz'aria sopra la testa dell'avatar quando si trova vicino a una sede o all'area contatti.
   - Animazione di rimbalzo verticale continuo (floating/bouncing) per indicare chiaramente il punto di interazione.
   - Transizione di comparsa/scomparsa fluida con effetto scala e opacità (150ms).

4. **Sistemi Particellari Ambientali:**
   - **Foglie d'acero cadenti:** Sopra l'albero di acero rosso di Dentsu, foglie rosse/arancioni cadono oscillando e ruotando verso sinistra sotto l'effetto di un vento fittizio, svanendo al contatto con il suolo.
   - **Laghetto Koi:** Bollicine d'acqua semitrasparenti salgono a zig-zag dal fondo del laghetto; increspature circolari (ripples) si espandono periodicamente sulla superficie.
   - **Lucciole dorate globali:** Piccolissimi punti luminosi sparsi per il mondo che fluttuano lentamente e appaiono/scompaiono dolcemente, arricchendo l'atmosfera globale senza disturbare il gameplay.

---

## 2. Architettura Tecnica e Modifiche

### 2.1 UI e Pannello Dialoghi (`src/scenes/UIScene.ts`)

- **Gestione Typewriter:**
  - Aggiunta di un timer (`Phaser.Time.TimerEvent`) per aggiornare progressivamente il testo.
  - Calcolo del tempo per singolo carattere: `const charTime = Math.max(1, Math.floor(150 / fullText.length))`.
  - Aggiunta di un cursore retro che lampeggia ad intervalli regolari.
- **Tweens di Apertura/Chiusura:**
  - Utilizzo di `this.tweens.add` per animare le proprietà `y` e `alpha` del container `this.panel`.
  - Gestione della transizione di uscita con callback `onComplete` per nascondere il pannello ed evitare che blocchi gli input.

### 2.2 Prompt di Interazione e Particelle (`src/scenes/WorldScene.ts`)

- **Nuvoletta Fluttuante:**
  - Creazione di un container dedicato per il prompt, contenente una forma grafica (`Phaser.GameObjects.Graphics`) per il fumetto e un testo per l'indicatore di tasto.
  - Sincronizzazione della posizione del prompt con la coordinata Y del giocatore (posizionata a circa `player.y - 36`).
  - Gestione dei tweens di comparsa/scomparsa in base alla vicinanza del giocatore a un target rilevato da `nearestInteraction`.
- **Sistemi Particellari:**
  - Configurazione dei particellari nativi in Phaser 3:
    ```typescript
    this.add.particles(x, y, texture, config)
    ```
  - Dal momento che i particellari necessitano di texture, useremo texture dinamiche generate a runtime o singoli pixel colorati creati via canvas/graphics in `PreloadScene.ts` per evitare di aggiungere troppi file PNG esterni.

---

## 3. Piano di Verifica

- **Compilazione:** Esecuzione di `npm run build` per verificare che non vi siano errori TypeScript o di bundling con Vite.
- **Test Unitari:** Tutti i 32 test attuali devono continuare a passare (`npm test`). Verranno aggiornati o scritti nuovi test se le modifiche strutturali ai prompt o alle scene dovessero influenzare il comportamento testato.
- **Verifica Manuale:** Giocabilità fluida da tastiera e controlli touch, rispondenza immediata dell'interruzione della digitazione testo.
