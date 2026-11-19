# Blip v2-demo

A small example app built with Vue 3, TypeScript, Vite and FKUI (Försäkringskassan's design
system). All data comes from a mock backend and is made up.

Based on [fk-demo-app](https://github.com/anst9000/fk-demo-app), with these views:

- **Start**
- **Applikationer**: list with search, filters (archived, orderable, test application,
  release bound, decommissioning release) and column settings, a view grouped by delsystem, and a
  detail page with the application's packages, versions and deliveries
- **Leveranser**: list and detail page with the packages in each delivery
- **Delsystem**: list and detail page (old demo data, not yet linked to the applications)

See [BEGREPP.md](BEGREPP.md) for what delsystem, applikation, paket, version and leverans mean.

The whole app is wrapped in `FErrorHandlingApp` (with `ErrorPlugin`), `FOffline` shows a message
when the network drops, and the page header has a light/dark/auto theme switch. See
[FKUI-THEME.md](FKUI-THEME.md) for how the themes work.

## Backend

The app fetches all data over HTTP from `VITE_API_URL` (default `/api`), see `src/api/http.ts`.

When `VITE_API_URL` is not set, a mock backend answers on `/api` inside the Vite dev and preview
servers (`mock-server/plugin.ts`). It serves `mock-server/data/applikationer.json` as it is, and
builds packages, versions and deliveries from it (`mock-server/generate.ts`). Every answer is
delayed 300 ms.

| Endpoint | Returns |
|---|---|
| `GET /api/applikationer` | The delsystem with their applications |
| `GET /api/applikationer/:id/versioner` | An application's versions and packages, newest first |
| `GET /api/leveranser` | All deliveries, newest first; `?applikation=:id` for one application's |
| `GET /api/leveranser/:id` | One delivery |
| `GET /api/delsystem`, `GET /api/delsystem/:id` | The old delsystem demo data |

Add `?fel=500` (or another status) to any endpoint to get an error answer. To use a real backend,
copy `.env.example` to `.env.local` and set `VITE_API_URL`.

## Commands

```sh
npm install
npm run dev      # development server
npm run build    # type check and production build
npm run preview  # serve the production build
```
