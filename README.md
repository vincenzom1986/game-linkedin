# Game-LinkedIn

Portfolio professionale esplorabile come gioco top-down.
Il visitatore percorre la città, raggiunge le sei sedi, interagisce con le porte e apre i relativi pannelli carriera.

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

Ruolo, periodo, progetti, skill e contatti delle sei sedi vivono esclusivamente in
`src/data/career.ts` e possono essere aggiornati senza modificare le scene di gioco.

La geometria della mappa e i riferimenti `refId` vivono in
`public/maps/career-city.json`.

## Asset

La vertical slice usa forme pixel-art originali generate a runtime. Le note di
provenienza sono in `public/assets/CREDITS.md`; non vengono usati asset Nintendo.
