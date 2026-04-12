# App Migration Notes

## Goal

Keep the current website directly usable from `index.html`, while extracting logic that can later move into an offline iOS app.

## Current Stable Entry

- `index.html`: current browser entry, safe to open directly
- `data.js`: browser-facing bundled data
- `app.jsx`: current UI and feature logic source

Do not break this path while refactoring.

## New App-Oriented Core

- `src/core/constants.js`
  Shared constants for categories, flavors, quiz modes, and storage keys.
- `src/core/quizEngine.js`
  Pure quiz-generation helpers. Intended to be reused by SwiftUI, React Native, or a future web rebuild.
- `src/core/storage.js`
  Small storage abstraction. Current browser implementation maps to `localStorage`; future iOS storage can swap in `UserDefaults`, files, or SQLite.

## Data That Is Already App-Friendly

- `data/formulas.json`
- `data/herbs.json`
- `data/clauses.json`
- `data/compare-groups.json`

These are already suitable for app-bundle local assets.

## Browser-Specific Logic To Replace Later

- `localStorage`
- `alert`
- `confirm`
- direct React DOM mounting

For iOS, these should move to:

- persistence: `UserDefaults`, file storage, or SQLite
- dialogs: native alerts / sheets
- rendering: SwiftUI views or React Native screens

## Suggested Next Steps

1. Migrate current quiz code in `app.jsx` to use `src/core/quizEngine.js` without changing visible behavior.
2. Migrate favorites and wrong-book access to `src/core/storage.js`.
3. Split `app.jsx` into feature sections such as analysis, compare, quiz, and shared components.
4. After core logic is stable, choose SwiftUI or React Native for the offline app shell.
