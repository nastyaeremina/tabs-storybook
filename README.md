# Tabs — Storybook

Standalone Storybook for the unified **Tabs** component (POR-19174 tab unification).

Key point this prototype fixes: the **`spacing`** prop is the **leading inset** of the
bar (how far the first tab is indented from the left edge) — it is **not** the gap
between tabs, which is a fixed 12px. Use the `spacing` control on the **Docs** /
**Default** story to see the inset move while the gap stays constant.

## Run locally

```bash
npm install
npm run storybook   # http://localhost:6007
```

## Build static site

```bash
npm run build       # outputs to storybook-static/
```
