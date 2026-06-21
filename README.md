# Game-LinkedIn

Prima vertical slice di un portfolio professionale esplorabile come gioco top-down.
Il visitatore raggiunge una sede, interagisce con la porta e apre il relativo pannello carriera.

## Requisiti

- Node.js `^20.19.0` oppure `>=22.12.0`
- npm

## Avvio locale

```bash
npm install
npm run dev
```

Aprire l'indirizzo mostrato da Vite nel browser.

## Verifica

```bash
npm test
npm run build
```

La build statica viene prodotta in `dist/`.

## Controlli

- Desktop: frecce o WASD per muoversi; Spazio/Invio per interagire; Esc per chiudere il pannello.
- Mobile: joystick virtuale a sinistra e pulsante `A` a destra.

## Aggiornare i contenuti

Ruolo, periodo, progetti, skill e contatti vivono esclusivamente in
`src/data/career.ts`. La sede attuale usa dati dimostrativi e può essere sostituita
senza modificare le scene di gioco.

La geometria della mappa e i riferimenti `refId` vivono in
`public/maps/first-location.json`.

## Asset

La vertical slice usa forme pixel-art originali generate a runtime. Le note di
provenienza sono in `public/assets/CREDITS.md`; non vengono usati asset Nintendo.
