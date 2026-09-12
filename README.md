# sasmlm

SPA de **líderes y socios**. Vue 3 + Vite + TypeScript. Hoy es el esqueleto de Vite; Router, Pinia y Tailwind se instalan en la Fase 1.

Contrato: [`docs/08-frontend.md`](../docs/08-frontend.md) · API: [`docs/05-api.md`](../docs/05-api.md).

## Mapa de `src`

| Carpeta | Responsabilidad |
| --- | --- |
| `api/` | Cliente HTTP por recurso. Cero UI. |
| `components/ui/` | Botón, input, tabla, modal — presentacionales. |
| `components/layout/` | Sidebar, topbar, breadcrumbs. |
| `composables/` | Lógica reutilizable (`useAuth`, `usePagination`). |
| `layouts/` | `AuthLayout`, `AppLayout`, `PublicLayout`. |
| `router/` | Rutas y guards por rol. |
| `stores/` | Pinia (`auth`, opcional `team`, `store`). |
| `types/` | DTOs del JSON. |
| `utils/` | formatters de moneda/fecha. |
| `views/auth/` | Login, registro líder, 2FA, reset, accept invitation. |
| `views/dashboard/` | KPIs. |
| `views/team/` | Árbol y listado. |
| `views/invitations/` | Enviar y listar. |
| `views/store/` | CRUD productos y órdenes (dueño). |
| `views/landing/` | Editor de bloques. |
| `views/reports/` | Cierre de mes. |
| `views/profile/` | Perfil y 2FA. |

Las vistas públicas de landing/tienda pueden vivir bajo `views/public/` cuando se implementen (Fase 3); el layout es `PublicLayout`.

## Rutas de UI previstas

| Path | Rol | Fase |
| --- | --- | --- |
| `/login`, `/register`, `/invitations/:token` | guest | 1–2 |
| `/app` | leader, partner | 4 |
| `/app/team` | leader | 2 |
| `/app/invitations` | leader | 2 |
| `/app/store/*` | ambos | 3 |
| `/app/landing` | ambos | 3 |
| `/app/commissions` | leader | 2 |
| `/app/reports` | leader | 4 |
| `/app/profile` | ambos | 1 |
| `/l/:slug`, `/s/:slug` | público | 3 |

## Reglas

- Una view no importa `axios`/`ofetch` directo: pasa por `api/`.
- El guard de router no duplica policies del backend; el backend manda. El guard solo evita flashes de UI.
- `partner` no ve menú de comisiones ni invitaciones.

## Variable de entorno

`VITE_API_URL` apunta al host Laravel (Laragon: `http://rexmlm.test`).
