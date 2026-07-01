# Backlog de lanzamiento — paridad Web / App / Server

Documento de trabajo para pasar de MVP de práctica a **producto lanzable**.  
Basado en la matriz flujo × Web × App × Server (marzo 2026).

**Backend de referencia:** Goi Server (`:4000` local, Render en prod) + Neon. Express legacy (`Goi Web/server`) no cuenta para usuarios reales.

### API de producción (Fase 0 — mayo 2026)

| Uso | URL |
|-----|-----|
| **Web (SPA)** | [https://go-i.vercel.app](https://go-i.vercel.app) |
| **Base API** (App + Web en prod) | `https://goi-server.onrender.com/api` |
| Health | `https://goi-server.onrender.com/api/health` |
| Health DB | `https://goi-server.onrender.com/api/health/db` |
| Uploads | `https://goi-server.onrender.com/uploads/...` |

**Decisiones de infra (mayo 2026):** Render (API) · Vercel solo web · Neon compartida dev/prod por ahora · dominio propio y BD prod separada más adelante · Expo Go (APK aplazado) · fotos en prod no críticas (plan free).

**Progreso Fase 0:** ✅ **Cerrada** (mayo 2026) — login App (Expo Go) + Web ([go-i.vercel.app](https://go-i.vercel.app)) contra Render. Fotos en prod: pendiente (disco Render / URLs absolutas).

**Progreso Fase 1:** ✅ **Cerrada** (mayo 2026). Docs: [auth-emails-y-enlaces.md](../../Goi%20Server/docs/auth-emails-y-enlaces.md), [auth-paridad-web-app.md](./auth-paridad-web-app.md). Siguiente: **Fase 2** (feed Web).

**Cómo usar este doc**

1. Marca `[x]` solo cuando el ítem esté probado (no solo “código escrito”).
2. Respeta el orden de **Fases** al final: infra → auth → feed/posts → social → extras.
3. Tras cada fase, ejecuta la **Verificación cruzada** correspondiente.
4. No hace falta paridad visual; sí **misma API y mismo comportamiento** en flujos core.

---

## Leyenda de prioridad

| Etiqueta | Significado |
|----------|-------------|
| **P0** | Bloquea lanzamiento o paridad real |
| **P1** | Importante antes de beta pública amplia |
| **P2** | Post-lanzamiento / diferenciación |

---

## Fase 0 — Infra y un solo servidor (P0)

### Goi Server + deploy

- [x] **0.1** Documentar URL de producción única (`API_URL`) para Web y App — tabla al inicio del doc
- [ ] **0.2** Confirmar que prod sirve: `/api/health`, `/api/health/db`, `/uploads/*` — health ✅ y db ✅; **fotos en web/app prod no se ven** (plan free + `/tmp`; abordar con disco Render o S3)
- [x] **0.3** Neon: schema aplicado (`npm run db:setup` o equivalente en prod)
- [x] **0.4** Variables de entorno de prod listadas (JWT, DATABASE_URL, uploads path, CORS si aplica) — sección [Variables Render](#variables-render-mayo-2026)

### Goi Web — salir de Express en runtime

- [x] **0.5** Vercel / hosting: API del frontend apunta a Goi Server — probado login web mayo 2026
- [x] **0.6** Revisar `vercel.json` / `api/index.mjs`: Express solo si queda explícitamente como legacy archivado — `api/README.md`; sin rewrite `/api`
- [x] **0.7** `VITE_API_URL` en prod = URL del Goi Server — en `vercel.json` build env
- [x] **0.8** Eliminar o ignorar `VITE_LEGACY_API_URL` y `:4001` en `.env.example` y docs de arranque

### Goi App

- [x] **0.9** `EXPO_PUBLIC_API_URL` en prod = misma URL que Web — `https://goi-server.onrender.com/api` (`.env`); login + feed OK en Expo Go
- [x] **0.10** Quitar o igualar `EXPO_PUBLIC_AUTH_API_URL` si aún existe en `.env` — vacío en `.env`
- [ ] **0.11** Build EAS `preview` / `production` probado contra API de prod (login mínimo) — **aplazado** (producto sólido; Expo Go basta de momento)

### Limpieza (pilar 4 — infra)

- [ ] **0.12** Commits/PRs del trabajo pendiente en App, Web y Server
- [ ] **0.13** Tag o rama `foundation` cuando Fase 0–2 estén en verde — **aplazado** (Fase 2+ / producto sólido)
- [ ] **0.14** README de cada repo: “arrancar solo Goi Server + cliente” — Web + Server + App actualizados (mayo 2026); falta repaso Express legacy en Web README profundo

**Verificación Fase 0:** login desde Web y App contra **la misma** API desplegada (no localhost).

- [x] App (Expo Go) — login + feed contra `https://goi-server.onrender.com/api` (mayo 2026)
- [x] Web ([go-i.vercel.app](https://go-i.vercel.app)) — login OK; fotos pendientes

#### Variables Render (mayo 2026)

| Variable | Valor / notas |
|----------|----------------|
| `DATABASE_URL` | Connection string Neon (dashboard; no commitear) |
| `JWT_SECRET` | Secreto largo distinto de dev |
| `NODE_ENV` | `production` |
| `GOI_UPLOADS_PATH` | `/tmp/goi-uploads` (efímero en plan free) |
| `GOI_DATA_DIR` | `/tmp/goi-data` |
| `PORT` | Lo asigna Render (no crear a mano) |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npx next start -H 0.0.0.0 -p $PORT` |

CORS: Goi Server permite `*` en `/api` (middleware + headers); no hace falta variable extra para App/Web cross-origin.

---

## Fase 1 — Auth, usuarios y legal (P0)

### Goi Server

- [x] **1.1** Registro: errores claros (email/username duplicado, validación password) — mayo 2026
- [x] **1.2** Forgot password: envío de email real en prod (Resend) — probado Web + App mayo 2026
- [x] **1.3** Forgot/verify en dev: `AUTH_RESET_RETURN_TOKEN` vs prod — [auth-emails-y-enlaces.md](../../Goi%20Server/docs/auth-emails-y-enlaces.md)
- [x] **1.4** Reset/verify: enlaces Web + App documentados — [auth-emails-y-enlaces.md](../../Goi%20Server/docs/auth-emails-y-enlaces.md)
- [x] **1.5** Verificación de email en v1 — Resend + GET verify en prod; probado vía Web mayo 2026

### Goi Web

- [x] **1.6** Registro + login + verify contra Server prod — mayo 2026; logout sin regresión explícita; pulidos REV-001 / REV-003
- [x] **1.7** Flujo forgot → reset (`?reset=token`) probado con email real — mayo 2026
- [x] **1.8** Enlaces legales visibles en registro o auth (`/privacidad`, `/aviso-legal`) — mayo 2026
- [x] **1.9** Mensajes de error alineados con códigos API (`409`, `AUTH_*`) — mayo 2026

### Goi App

- [x] **1.10** Registro + login + logout en dispositivo real — revisado mayo 2026 (Expo Go + Render)
- [x] **1.11** `forgot-password` + `reset-password` probados — mayo 2026
- [x] **1.12** Enlaces legales en registro y apartado Legal en perfil — mayo 2026
- [ ] **1.13** Sesión expirada (`AUTH_SESSION_STALE`) → logout limpio — código listo; regresión explícita pendiente

### Limpieza (pilar 4 — auth)

- [x] **1.14** Tipos auth y errores `AUTH_*`: revisión Web vs App — [auth-paridad-web-app.md](./auth-paridad-web-app.md)
- [ ] **1.15** Sin usuarios demo con password débil en prod (o desactivar seed público)

**Verificación Fase 1:** 3 personas externas se registran solas (Web o App) sin ayuda técnica.

**Estado:** ✅ **Fase 1 cerrada** (mayo 2026) — auth, verify, forgot/reset y legales probados en Web + App contra Render. Residual no bloqueante: **1.13** (regresión `AUTH_SESSION_STALE`), **1.15** (usuarios demo en Neon), prueba con 3 usuarios externos, pulidos [revision-pendiente.md](./revision-pendiente.md) REV-001–003.

---

## Fase 2 — Feed y publicaciones (P0)

### Goi Server

- [ ] **2.1** `GET /posts/feed`: `scope`, `limit`, `cursor` documentados y estables
- [ ] **2.2** `POST /posts`: multipart + JSON (foto sin texto obligatorio si hay media)
- [ ] **2.3** `GET /posts/:id/media` para hidratación legacy (App ya lo usa)

### Goi Web — brechas P0

- [ ] **2.4** Feed: usar **`scope=following|all`** en API (no filtrar solo en cliente)
- [ ] **2.5** Feed: **paginación con cursor** (`nextCursor`, cargar más)
- [ ] **2.6** Crear post: **multipart** (`FormData` + `files`) como en App — dejar de enviar dataUrl en JSON
- [ ] **2.7** Probar post solo foto + post foto + texto
- [ ] **2.8** (P1) Post **training**: `format: training` + `sessionId` en UI (hoy solo `workoutId` legacy)
- [ ] **2.9** (P1) Hidratar media si feed ligero sin URLs

### Goi App

- [ ] **2.10** Feed following/all + cursor (regresión)
- [ ] **2.11** Crear standard + training + multipart (regresión)
- [ ] **2.12** Editar publicación (`editar-publicacion`)
- [ ] **2.13** Cola offline: solo en error de red real (regresión)

### Paridad tipos / normalización (pilar 4)

- [ ] **2.14** Tabla o checklist: campos `Post` iguales en Web `types/post.ts` y App `types/post.ts`
- [ ] **2.15** `normalizePost` / `hasMedia` / `sessionId` mismo comportamiento
- [ ] **2.16** (P1) Decidir paquete `@goi/types` compartido vs copia manual hasta v1.1

**Verificación Fase 2:** mismo usuario publica con foto en Web y App; ambos ven el post en feed del otro.

---

## Fase 3 — Social (P0 en Web)

### Goi Server

- [ ] **3.1** Endpoints ya existentes verificados: discover, hub, follow-requests, block, blocks/previews, users/search

### Goi Web — brechas P0 (App ya tiene esto)

- [ ] **3.2** Sustituir discover vía **`GET /auth/users`** por **`GET /auth/discover`** (+ facetas si aplica)
- [ ] **3.3** Pantalla o panel **Social hub** (`GET /auth/social/hub`) — o integrar en feed sidebar
- [ ] **3.4** **Follow requests**: listar + aceptar/rechazar (`/auth/follow-requests`)
- [ ] **3.5** Perfil privado: UX de “solicitud pendiente” coherente con App
- [ ] **3.6** **Bloquear** usuario (`POST /auth/block/:id`) + lista (`/auth/blocks/previews`)
- [ ] **3.7** Perfil ajeno: usar **`GET /auth/profile/:id/public`** donde corresponda
- [ ] **3.8** (P1) Listas followers/following paginadas (`/profile/:id/social/:kind`)
- [ ] **3.9** (P1) Preferencias notificaciones (`/auth/notification-prefs`)

### Goi App — regresión

- [ ] **3.10** Tab Social: hub, discover, actividad
- [ ] **3.11** Follow, solicitudes, bloqueos, silenciar
- [ ] **3.12** Notificaciones in-app + prefs

**Verificación Fase 3:** perfil privado → solicitud → aceptar en Web → ver contenido; mismo flujo invertido App ↔ Web.

---

## Fase 4 — Entrenamientos (P1 paridad, P0 mínimo)

### Mínimo lanzamiento (ambos clientes)

- [ ] **4.1** CRUD rutinas Web + App
- [ ] **4.2** Catálogo + ficha ejercicio usable
- [ ] **4.3** Registrar sesión (`POST /workout-sessions`)
- [ ] **4.4** Vincular sesión a post (App training; Web al menos `sessionId` o equivalente)

### App-only (documentar, no bloquear paridad)

- [ ] **4.5** Entrenar en vivo (`/entrenar/[workoutId]`) — **solo App**, OK para v1
- [ ] **4.6** Recordatorio local expo-notifications — **solo App**

### Web-only (documentar)

- [ ] **4.7** `StatisticsPage` / personal body / roadmap — **solo Web** en v1

### Brechas P1

- [ ] **4.8** Web: `GET /workout-sessions/:id` + detalle con snapshot (App ya lo tiene)
- [ ] **4.9** App: alinear riqueza ficha ejercicio con Web si falta contenido

**Verificación Fase 4:** crear rutina → sesión → post training visible en feed (App; Web cuando 2.8 hecho).

---

## Fase 5 — Historias (P1)

- [ ] **5.1** Web + App: crear historia sin depender de dataUrl gigante (upload o URL `/uploads`)
- [ ] **5.2** Listar y visor en feed (regresión)
- [ ] **5.3** TTL / visibilidad según Server

---

## Fase 6 — Limpieza y optimización completa (pilar 4)

Hacer al cierre de Fase 0–3 (y repasar tras 4–5).

### Repos y código

- [ ] **6.1** Express `Goi Web/server`: rol explícito (solo tests/migraciones o archivado)
- [ ] **6.2** Cero imports activos a rutas/API eliminadas
- [ ] **6.3** `.env.example` actualizado en App, Web, Server (una URL API)
- [ ] **6.4** Eliminar exports muertos en `postsApi.ts`, `authApi.ts`, etc.

### Calidad automática

- [ ] **6.5** Goi App: `npm run verify` en CI
- [ ] **6.6** Goi Web: `tsc` + tests frontend si existen
- [ ] **6.7** Goi Web/server: `npm test` (Express) — solo si se mantiene el paquete
- [ ] **6.8** Goi Server: `tsc` en CI; tests críticos auth/posts (P1)

### Documentación mínima viva

- [ ] **6.9** Matriz flujo × Web × App × Server actualizada (este doc + tabla resumen)
- [ ] **6.10** `flujo-subida-imagenes.md` alineado con multipart (Web pendiente hasta 2.6)

### Optimización (solo si impacta producto)

- [ ] **6.11** Feed: no cargar media pesada en listado (ya en Server; verificar clientes)
- [ ] **6.12** Revisar timeouts App/Web en feed y hub (45s discover, etc.)

**Definition of Done — fundación limpia**

- [ ] Un solo backend en prod
- [ ] Matriz P0 en verde (auth, feed+posts, social en Web)
- [ ] `verify` / tests verdes
- [ ] Tag `v0.9-foundation` o equivalente

---

## P2 — Post-lanzamiento (no bloquear v1)

- [ ] Push notifications remotas (likes, follows, comentarios)
- [ ] Guardados de posts en servidor
- [ ] Informes / moderación en backend
- [ ] Verificación de email en registro
- [ ] Estadísticas unificadas (octágono Web ↔ stats API App)
- [ ] Paquete npm `@goi/types` o monorepo ligero
- [ ] Onboarding (objetivo → sugeridos → primer post)
- [ ] Beta EAS amplia + canal feedback

---

## Orden recomendado (sprints orientativos)

| Sprint | Foco | Ítems doc |
|--------|------|-----------|
| 1 | Infra prod | 0.1 – 0.14 |
| 2 | Auth + legal | 1.1 – 1.15 |
| 3 | Feed Web paridad | 2.4 – 2.7, 2.14 – 2.15 |
| 4 | Social Web paridad | 3.2 – 3.7 |
| 5 | Training + historias P1 | 2.8, 4.x, 5.x |
| 6 | Limpieza final | 6.1 – 6.12 |

---

## Checklist rápida pre-beta (15 min manual)

- [x] Registro nuevo usuario (Web) — mayo 2026
- [x] Registro nuevo usuario (App) — mayo 2026
- [x] Login App contra API prod (Render) — mayo 2026
- [x] Login Web ([go-i.vercel.app](https://go-i.vercel.app)) — mayo 2026
- [x] Verificación email (Web) — mayo 2026
- [x] Forgot / reset contraseña (Web + App) — mayo 2026
- [ ] Login / logout ambos (logout sin regresión explícita)
- [ ] Publicar con foto (Web) — **bloqueado hasta 2.6**
- [ ] Publicar con foto (App)
- [ ] Feed following + all (Web) — **bloqueado hasta 2.4**
- [ ] Follow + perfil ajeno
- [ ] Solicitud perfil privado (Web) — **bloqueado hasta 3.4**
- [ ] Rutina + sesión
- [ ] Post training con sesión (App)

---

## Referencias

- Matriz detallada: conversación / auditoría marzo 2026
- API Server: `Goi Server/docs/API-AUDIT.md`
- Imágenes posts: `docs/flujo-subida-imagenes.md`
- Refactor App (estado): `docs/refactoring-suggestions.md`
- Pulidos y bugs detectados en pruebas: [revision-pendiente.md](./revision-pendiente.md)
- Auth emails, enlaces y dev tokens: [Goi Server/docs/auth-emails-y-enlaces.md](../../Goi%20Server/docs/auth-emails-y-enlaces.md)
- Paridad tipos/errores auth Web ↔ App: [auth-paridad-web-app.md](./auth-paridad-web-app.md)

**Última actualización:** mayo 2026 (Fase 1 casi cerrada; auth Web + App probados)
