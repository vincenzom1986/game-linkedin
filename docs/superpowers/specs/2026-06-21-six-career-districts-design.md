# Game-LinkedIn — Sei quartieri di carriera

**Data:** 2026-06-21  
**Stato:** design approvato in conversazione; specifica in revisione utente  
**Ambito:** sostituire la sede dimostrativa con tutte le esperienze lavorative del CV

## 1. Obiettivo

Trasformare il vertical slice esistente in un portfolio giocabile che racconti tutte e
sei le esperienze lavorative di Vincenzo Marrari. Il visitatore esplora una città
pixel-art dall'alto, raggiunge le sedi in ordine cronologico suggerito e scopre che cosa
Vincenzo ha fatto e imparato in ciascuna azienda.

L'incremento deve:

- includere tutte le esperienze lavorative, senza saltarne nessuna;
- rappresentare ogni azienda con un quartiere e un edificio riconoscibili;
- mostrare il logo storico corretto per il periodo dell'esperienza;
- raccontare ruolo, attività ed esperienza in prima persona;
- mantenere libera l'esplorazione, senza sblocchi obbligatori;
- funzionare con tastiera e controlli touch;
- pubblicare soltanto email e LinkedIn come contatti personali.

Studi, università e master non compaiono in questa mappa. Potranno essere aggiunti in un
incremento separato.

## 2. Decisioni approvate

| Tema | Decisione |
|---|---|
| Struttura | Un'unica città con sei quartieri, uno per azienda |
| Ordine | Cronologico, dal primo lavoro a EY |
| Libertà | Tutte le sedi sono raggiungibili fin dall'inizio |
| Visuale | Telecamera fissa top-down, coerente in tutto il mondo |
| Stile | Pixel art originale 16-bit, ricca e leggibile, ispirata al genere adventure |
| Edifici | Solo esterni; niente interni esplorabili |
| Interazione | Punto di interazione davanti all'ingresso |
| Racconto | Prima persona, conciso e basato esclusivamente sul CV |
| Contatti | Solo LinkedIn ed email; esclusi telefono, indirizzo e data di nascita |

Le immagini fornite dall'utente e il concept approvato definiscono il livello di
dettaglio e la prospettiva, non sono asset da copiare. Il gioco userà grafica originale
o con licenza compatibile; non userà sprite, interfacce o ambienti Nintendo.

## 3. Esperienza del visitatore

Il giocatore compare nel primo quartiere, dedicato a The Big Now. Una strada principale
forma un percorso cronologico a serpentina attraverso le sei sedi, ma incroci e sentieri
secondari permettono di visitarle in qualsiasi ordine.

Avvicinandosi all'ingresso di un edificio:

1. compare il prompt per interagire;
2. Spazio/Invio o il tasto touch apre il racconto della sede;
3. il personaggio si ferma finché il pannello è aperto;
4. il pannello presenta azienda, ruolo, periodo, attività, esperienza e competenze;
5. la sede viene registrata come visitata nel diario;
6. Esc, il pulsante di chiusura o il tasto touch riporta al mondo.

Il diario mostra `sedi visitate / 6` e permette di rileggere ogni sede scoperta. Nessun
contenuto è bloccato: il percorso suggerito serve a rendere leggibile la crescita
professionale, non a imporre una sequenza.

Vicino al quartiere EY è presente l'area Contatti. LinkedIn ed email sono sempre
accessibili; completare sei visite aggiorna soltanto lo stato visivo del diario.

## 4. Mondo e direzione artistica

### 4.1 Regole visive comuni

- Inquadratura top-down costante, senza viste frontali, isometriche o cambi di camera.
- Pixel grid coerente e scaling intero; texture smoothing disattivato.
- Edifici, alberi, acqua, strade e props condividono scala e direzione della luce.
- Sagome degli edifici leggibili e ingressi sempre visibili dalla strada.
- Percorsi abbastanza larghi per movimento desktop e joystick touch.
- Vegetazione, acqua, muri e arredi definiscono i quartieri senza creare vicoli ciechi
  involontari.
- Il concept approvato rappresenta densità e atmosfera; collisioni e leggibilità hanno
  priorità sulla quantità di decorazioni.

### 4.2 Disposizione

La città usa una composizione compatta a sei aree, collegate da una strada cronologica.
La geometria può essere adattata durante la costruzione, ma deve conservare:

- un unico mondo continuo;
- un ingresso chiaro per quartiere;
- un punto d'interazione per sede;
- collegamenti alternativi che garantiscano esplorazione libera;
- spawn presso The Big Now e area finale presso EY.

### 4.3 Identità dei quartieri

| Ordine | Azienda | Tema del quartiere | Elementi distintivi |
|---:|---|---|---|
| 1 | The Big Now | Distretto creativo | poster, murales, colori energici, piccolo studio digitale |
| 2 | SG Holding | Piazza degli eventi | palco, banner, luci, strutture temporanee |
| 3 | Wunderman Thompson | Giardino degli insight | osservatorio, antenne, flussi dati luminosi |
| 4 | Armando Testa | Quartiere della comunicazione | affissioni, forme grafiche, insegne iconiche |
| 5 | Dentsu | Distretto media e ricerca | padiglioni moderni, schermi, laboratorio |
| 6 | EY | Cittadella AI e leadership | data hub, terminali, torre luminosa, giallo e antracite |

I temi differenziano le aree, ma palette del terreno, pavimentazioni, illuminazione e
vegetazione mantengono la città visivamente unitaria.

## 5. Contenuti delle sei sedi

I testi seguenti derivano esclusivamente dal CV fornito. La UI può dividerli in più
pagine per non produrre blocchi di testo lunghi.

### 5.1 The Big Now — Digital Strategist, 2016–2017

**Cosa facevo**

- ricerca di trend e segnali culturali;
- sviluppo di strategie digitali e piani editoriali;
- creazione di contenuti coerenti con target e posizionamento.

**Esperienza, prima persona**

> Ho iniziato trasformando trend, target e obiettivi di marca in strategie digitali e
> piani editoriali. Qui ho costruito le basi del mio approccio strategico ai contenuti.

### 5.2 SG Holding — Creative Strategist, 2017–2018

**Cosa facevo**

- sviluppo di strategie creative a partire da insight culturali e trend;
- ideazione di eventi e formati di branded content;
- traduzione della ricerca in concept applicabili alla comunicazione.

**Esperienza, prima persona**

> Ho imparato a trasformare insight culturali in idee, eventi e formati concreti,
> collegando strategia creativa ed esperienza del pubblico.

### 5.3 Wunderman Thompson — Research & Insight Analyst, 2018–2021

**Cosa facevo**

- social analytics e monitoraggio della reputazione;
- analisi di scenari di crisi in collaborazione con le PR;
- report e insight a supporto di media e contenuti.

**Esperienza, prima persona**

> Ho consolidato il mio metodo di ricerca lavorando su reputazione, segnali social e
> scenari di crisi, trasformando i dati in indicazioni utili per media, contenuti e PR.

### 5.4 Armando Testa — Data Analyst Supervisor, 2021

**Cosa facevo**

- analisi della reputazione e dei contenuti social;
- text analytics, sentiment, trend e benchmark;
- costruzione di KPI dashboard per la lettura dei risultati.

**Esperienza, prima persona**

> Ho unito analisi testuale e misurazione delle performance, rendendo sentiment, trend e
> benchmark leggibili attraverso KPI e dashboard operative.

### 5.5 Dentsu — Research Insight Supervisor, 2021–2022

**Cosa facevo**

- consumer research a supporto della creatività;
- neuroscienze e analisi data-driven;
- sintesi degli insight per stakeholder e team di progetto.

**Esperienza, prima persona**

> Ho approfondito consumer research e neuroscienze, traducendo analisi complesse in
> insight chiari per creatività, stakeholder e decisioni di progetto.

### 5.6 EY — Manager, Research & Insight, 2022–oggi

**Cosa faccio**

- gestione di social listening, reputation analysis e progetti data-driven avanzati;
- applicazione di GenAI e automazione ai processi di ricerca;
- sviluppo di dashboard, modelli strategici, data strategy e innovazione.

**Esperienza, prima persona**

> Oggi guido progetti di Research & Insight che integrano reputazione, dati, GenAI e
> automazione. Trasformo l'analisi in modelli strategici e strumenti utili alle decisioni.

## 6. Loghi aziendali

Tutte le sei sedi devono mostrare il proprio logo; nessuna può essere omessa. Il logo
deve corrispondere al marchio usato nel periodo dell'esperienza, non necessariamente
all'identità aziendale attuale.

Fonti candidate già individuate:

| Azienda | Direzione di sourcing |
|---|---|
| The Big Now | identità storica 2015 e comunicati Dentsu sull'acquisizione del 2018 |
| SG Holding | identità nata dal rebranding Sinergie Group del marzo 2017 |
| Wunderman Thompson | logo storico 2019; l'azienda è poi confluita in VML |
| Armando Testa | sito ufficiale Armando Testa |
| Dentsu | sito ufficiale Dentsu o SVG con fonte ufficiale documentata |
| EY | sito/media center ufficiale EY |

Riferimenti di verifica:

- `https://www.behance.net/gallery/23303521/THE-BIG-NOW-Brand-Image`
- `https://www.adcgroup.it/e20-express/news/industry/agenzie/sinergie.html`
- `https://commons.wikimedia.org/wiki/File:Wunderman_thompson_logo.png`
- `https://www.armandotesta.it/`
- `https://commons.wikimedia.org/wiki/File:Dentsu-logo_black.svg`
- `https://www.ey.com/en_gl/media`

Ogni file deve avere una voce in `public/assets/CREDITS.md` con azienda, URL sorgente,
data di recupero e nota d'uso/licenza disponibile. I loghi non vengono ridisegnati,
deformati o usati in modo da suggerire approvazione o partnership con il portfolio.

Se un asset non viene caricato a runtime, l'edificio e l'interazione restano disponibili
e l'insegna mostra il nome testuale dell'azienda. Il fallback non elimina il requisito di
includere il logo corretto nel pacchetto finale.

## 7. Pannello della sede

L'interfaccia evita l'aspetto di una web card moderna. È un riquadro dialogo pixel-art
nel terzo inferiore dello schermo, sovrapposto al mondo.

Contenuti in sequenza:

1. logo, azienda, ruolo e periodo;
2. `Cosa facevo` con due o tre attività;
3. `La mia esperienza` in prima persona;
4. competenze e strumenti pertinenti.

Il pannello:

- mette in pausa il movimento ma non la scena;
- supporta pagine successive quando il testo non entra;
- espone Avanti, Indietro e Chiudi a tastiera e touch;
- resta leggibile in landscape e portrait;
- non mostra clienti associati a una specifica azienda quando il CV non documenta tale
  relazione.

## 8. Modello dati e componenti

`src/data/career.ts` resta l'unica fonte dei contenuti professionali. Il modello
`Location` viene esteso senza spostare testi nella scena:

```ts
interface Location {
  id: string
  name: string
  kind: 'work'
  order: number
  building: string
  logo: string
  period: string
  role: string
  summary: string
  activities: string[]
  experience: string
  skills: Skill[]
  tools?: string[]
  district: DistrictTheme
}

interface DistrictTheme {
  id: string
  label: string
  palette: string[]
  landmark: string
}
```

La forma definitiva può riusare `projects` o `InfoEntry` dove utile, ma deve conservare
campi distinti per attività ed esperienza. `order` rende esplicita la cronologia.

Responsabilità:

- **career data:** contenuti, ordine, logo e tema della sede;
- **tilemap/world data:** coordinate, collisioni, spawn e trigger con `refId`;
- **WorldScene:** risoluzione dei `refId`, movimento, collisioni ed emissione eventi;
- **UIScene:** prompt, pannello paginato, diario e contatti;
- **JournalState:** insieme delle sedi visitate e snapshot `visitate / totale`;
- **asset credits:** provenienza e condizioni d'uso di tiles, sprite e loghi.

La scena non contiene condizioni specifiche per nomi di aziende: aggiungere o spostare
una sede avviene nei dati e nella mappa, non con rami `if` dedicati.

## 9. Privacy e contenuti pubblici

Il modello pubblico ammette soltanto:

- URL LinkedIn;
- email professionale/pubblica;
- eventuale URL pubblico del CV.

Telefono, indirizzo, data di nascita e altri dati personali presenti nel PDF non vengono
copiati in `career.ts`, nell'HTML, negli asset, nei test o nei metadati. La validazione dei
dati deve applicare questa allowlist invece di tentare di filtrare campi sensibili a
posteriori.

## 10. Errori e fallback

- `refId` sconosciuto nella mappa: errore esplicito in sviluppo e test fallito.
- Logo non disponibile a runtime: insegna testuale, nessun blocco della sede.
- Testo più lungo del pannello: paginazione o scorrimento controllato, mai overflow.
- Tastiera non disponibile su dispositivo touch: il gioco continua con joystick e tasto
  azione.
- Viewport ridotto: camera e UI si adattano senza cambiare prospettiva o rimuovere
  contenuti.
- Sede già visitata: il pannello resta rileggibile e il conteggio non aumenta una seconda
  volta.

## 11. Verifica

### Test automatici

- esistono esattamente sei sedi di tipo `work` con ID univoci;
- gli ordini sono `1..6` e corrispondono alla cronologia approvata;
- ogni sede ha logo, ruolo, periodo, attività, esperienza e tema;
- tutti i `refId` della mappa risolvono una sede valida;
- una visita incrementa il diario una sola volta;
- apertura e chiusura del pannello aggiornano correttamente lo stato `panel-open`;
- il formatter produce pagine leggibili senza omettere attività o esperienza;
- il modello contatti accetta soltanto LinkedIn, email e URL CV;
- nessun placeholder dimostrativo (`demo-studio`, `hello@example.com`) resta nei dati.

### Verifica manuale

- percorrere l'intera città da The Big Now a EY senza attraversare collisioni;
- raggiungere ogni quartiere anche fuori ordine;
- aprire, sfogliare e chiudere tutte le sei schede;
- verificare loghi e fallback testuale;
- verificare resa pixel-art top-down e scaling senza smoothing;
- provare frecce/WASD, Spazio/Invio, Esc e controlli touch;
- verificare landscape e portrait;
- controllare diario, contatti e assenza di dati personali esclusi;
- eseguire test suite e build di produzione.

## 12. Scope

### Incluso

- sei quartieri esterni e sei edifici aziendali;
- percorso cronologico suggerito ed esplorazione libera;
- tutti i loghi storici con fonti registrate;
- contenuti CV in prima persona;
- pannello paginato, diario visite e area contatti;
- collisioni, tastiera, touch e layout responsive;
- test e build statica.

### Escluso

- studi, università e master;
- interni esplorabili;
- NPC, combattimento, nemici e mini-giochi;
- attribuzione di clienti a singole aziende non documentata nel CV;
- telefono, indirizzo, data di nascita e altri dati personali;
- audio e salvataggio persistente tra sessioni.

## 13. Criteri di accettazione

L'incremento è completo quando una nuova visita può aprire il gioco su desktop o mobile,
muoversi liberamente in una città top-down coerente, riconoscere tutte e sei le aziende,
leggere il racconto professionale di ogni sede, vedere il diario arrivare a `6 / 6` e
raggiungere LinkedIn o email, senza incontrare placeholder, dati sensibili o asset non
documentati.
