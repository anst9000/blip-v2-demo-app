# Blip v2-demo

A small example app built with Vue 3, TypeScript, Vite and FKUI (Försäkringskassan's design
system). All data comes from a mock repository and is made up.

Based on [fk-demo-app](https://github.com/anst9000/fk-demo-app), with only these views:

- **Start**
- **Ärenden**: 10 000 made-up cases, with client-side and server-side paging, search, column
  settings and a detail page
- **Applikationer**: list and detail page
- **Delsystem**: list and detail page

The whole app is wrapped in `FErrorHandlingApp` (with `ErrorPlugin`), `FOffline` shows a message
when the network drops, and the page header has a light/dark/auto theme switch. See
[FKUI-THEME.md](FKUI-THEME.md) for how the themes work.

## Commands

```sh
npm install
npm run dev      # development server
npm run build    # type check and production build
npm run preview  # serve the production build
```
