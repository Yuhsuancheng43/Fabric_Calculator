# Fabric Calculator

A small tool for working out how much fabric to order for awnings, based on skin width, drop, and flap type.

## Features

- **Docril calculator**: enter width, drop, flap, and quantity for one or more rows and get a full breakdown (panel count, drop addition, rounding) plus a grand total.
- **Editable output**: the generated text summary can be tweaked by hand before you copy it, since final rounding is sometimes a judgment call rather than a fixed rule.
- **Multiple rows**: a single order can include several width/drop combinations; rows can be added and removed (the first row is always kept).
- **Fabric navigation**: switch between fabric types from a nav bar; more fabrics can be added alongside Docril as their calculation rules are worked out.
- Responsive layout for both desktop and mobile.

## Tech stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Vitest](https://vitest.dev/) for unit tests on the calculation logic

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Running tests

```bash
npm run test
```
