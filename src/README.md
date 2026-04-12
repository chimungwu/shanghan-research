# Extracted UI Structure

These files are a safe intermediate step toward an offline app architecture.

## Important

- They are not yet wired into the current website runtime.
- The live browser entry still uses `index.html` and the inlined `app.jsx` script block.
- These files exist to make future migration easier without breaking today's direct-open workflow.

## Layout

- `ui/shared.jsx`
  Shared visual components and reusable display elements.
  Exported module form (`RadarChart / FlavorBar / NatureGauge / HerbPill / FormulaCard`).
- `features/compare.jsx`
  Compare page reference.
- `features/quiz.jsx`
  Quiz page reference.
- `features/index.js`
  Feature module export entry.
- `app-shell.jsx`
  Future top-level composition root.

## Next Safe Step

Replace parts of `app.jsx` gradually by copying from these files into the runtime path only after each section is verified.
