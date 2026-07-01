# Checklist de paridad Web ↔ App

Lista manual para **comprobar** que cada flujo acordado se comporta igual (misma API, mismo resultado).  
Matriz completa: [paridad-web-app.md](./paridad-web-app.md).

**Cómo usar:** marca `[x]` solo tras probar tú en **Web** y **App** (cuando aplique). Anota fecha y notas al pie de cada bloque.

**API de referencia:** `https://goi-server.onrender.com/api` (o local `:4000/api`).

**Cuentas demo (feed/publicación):** `demo_alpha@goi.test` / `demo_beta@goi.test` — password `DemoGoi2026!`  
(`cd Goi Server` → `$env:CONFIRM_DEMO_SEED=1; npm run db:seed-feed-demos`)

**Tu cuenta real:** `cristian.c.s.2000@hotmail.com` (auth / verify).

---

## Pre-vuelo (5 min)

- [ ] Goi Server responde: `GET /api/health` → OK
- [ ] Web apunta a la API correcta (`VITE_API_URL` / consola `[Goi Web] API_BASE_URL`)
- [ ] App apunta a la misma API (`EXPO_PUBLIC_API_URL`)
- [ ] Sesión iniciada en Web y en App (mismo usuario o dos usuarios distintos para cruzar feed)

| Bloque | Web | App | Fecha | Notas |
|--------|-----|-----|-------|-------|
| Pre-vuelo | | | | |

---

## 1. Auth y cuenta (Fase 1 — P0) ✅ cerrada

### Registro y verify

- [x ] **Web:** crear cuenta → verify-pending → correo → enlace → login OK
- [x ] **App:** mismo flujo registro + verify
- [x ] Tras verify, `requiresEmailVerification` / no token hasta confirmar email

### Login / logout

- [x ] **Web:** login email + password; logout sin regresión
- [x ] **App:** login + logout
- [x ] Credenciales incorrectas → mensaje `AUTH_INVALID_CREDENTIALS` (español)

### Forgot / reset

- [x ] **Web:** forgot → correo → `?reset=token` → nueva contraseña → login
- [x ] **App:** mismo flujo forgot + reset

### Legales y sesión

- [x ] **Web:** enlaces legales visibles en registro
- [ x] **App:** legales en registro + apartado Legal en perfil
- [x ] **Web / App:** tras borrar usuario en Neon, acción protegida → `AUTH_SESSION_STALE` y vuelta a login con mensaje claro

| Bloque | Web | App | Fecha | Notas |
|--------|-----|-----|-------|-------|
| Auth Fase 1 | | | | |

---

## 2. Feed y publicaciones (Fase 2 — ✅ cerrada mayo 2026)

> **Código:** scope/cursor, multipart, estándar + training + sesión vinculada en estándar, botón «Cargar más».  
> **App:** regresión PAR-A resuelta. Verificación cruzada completada.

### 2.1 Feed — scope y API

- [ x] **Web:** pestaña **Todos** → petición `GET /posts/feed?scope=all` (Network; sin filtrar solo en cliente)
- [x ] **Web:** pestaña **Seguidos** → `scope=following`
- [ x] **App:** Seguidos / Todos → mismos posts que Web para el mismo usuario y scope
- [ x] Con `demo_alpha` siguiendo a `demo_beta`: en **Seguidos** se ve el post de beta; en **Todos** se ven ambos

### 2.2 Paginación

- [ x] **Web:** si hay más de una página, «Cargar más publicaciones» pide `cursor` y añade posts (no sustituye la lista entera)
- [x ] **App:** scroll / cargar más sin perder posts ni bucle de refresco

### 2.3 Crear post estándar

- [x] **Web:** sin foto → botón Publicar deshabilitado / hint «Añade al menos una foto»
- [x] **Web:** foto + pie opcional → `format: standard`, `sessionId: null`, `multipart` en Network
- [x] **Web:** vista previa tipo feed (header → foto → acciones → caption)
- [x] **Web:** visibilidad inicial = `defaultPostVisibility` del usuario (hoy suele ser `public`)
- [x] **App:** post con foto (galería/cámara) → multipart
- [x] **Cruzado:** publicas en **Web** → visible en **App** (scope Todos)
- [x] **Cruzado:** publicas en **App** → visible en **Web**
- [x] **Web:** post estándar con **entreno vinculado** opcional + icono mancuerna (preview y feed)

### 2.4 Post training

- [x] **Web:** ver posts training en feed (tarjeta sesión + foto inset) — Fase A
- [x] **Web:** chooser Estándar / Training + composer training + `format: training` + `sessionId` en API
- [x] **App:** post `format: training` + `sessionId` visible en feed
- [x] **Cruzado:** post training de un cliente se ve igual en el otro (tarjeta / datos de sesión)

### 2.5 Interacciones

- [x ] **Web / App:** like en post ajeno → contador coherente en ambos tras refrescar
- [x ] **Web / App:** comentar → aparece en ambos
- [ x] **Web / App:** eliminar propio post → desaparece en ambos

### 2.6 Solo App (no es fallo de paridad)

- [x ] **App:** cola offline al publicar sin red → reintento al recuperar red
- [ x] **Web:** no hay cola offline (documentado)

### 2.7 Regresión App feed (PAR-A)

- [x ] Feed no entra en bucle de «actualizando» constante
- [x ] Posts no desaparecen tras refresco en segundo plano (con datos en feed)
- [ x] Pull-to-refresh manual funciona

| Bloque | Web | App | Fecha | Notas |
|--------|-----|-----|-------|-------|
| Feed Fase 2 | ✅ | ✅ | mayo 2026 | 2.1–2.7 + cruzado OK |

---

## 3. Tipos y contrato API (PAR-B) ✅ revisado mayo 2026

Comparar `Goi Web/src/types/post.ts` ↔ `Goi App/types/post.ts` y respuesta real de `GET /posts/feed`.

- [x] Campos core iguales: `id`, `userId`, `content`, `format`, `sessionId`, `visibility`, `likesCount`, `likedByMe`, `comments`, `hasMedia`
- [x] `normalizePost` / `hasMedia` coherente si el feed viene sin URLs de media (prod emite `hasMedia`; clientes hidratan vía `GET /posts/:id/media` o `getPostById`)
- [x] Crear post: mismos nombres de campo (`content`, `format`, `sessionId`, `visibility`, `files` multipart)

**Diferencias aceptadas (no bloquean):**

| Tema | Web | App |
|------|-----|-----|
| `CreatePostInput.workoutId` | deprecated, aún en tipos | no expuesto |
| Tipos extra en App | — | `FeedTimelineItemDto`, `PostLikesResponse`, `commentId` en notif. |
| `PostFormat` | en `types/post.ts` | en `constants/postFormat.ts` + re-export |
| Meta sesión en `normalizePost` | `readSessionMeta` explícito | viene del API; `sanitizeForFeed` en App |
| Servidor prod (Goi Server) | `mapPostForClient` + `hasMedia` + feed ligero | mismo contrato |

| Bloque | OK | Fecha | Notas |
|--------|-----|-------|-------|
| PAR-B tipos Post | ✅ | mayo 2026 | Alineado; ver tabla difs. aceptadas |

---

## 4. Infra medios (PAR-C) — conocido pendiente

- [ ] **Local:** foto de post se ve tras publicar (Web y App)
- [ ] **Prod Render:** fotos pueden **no** persistir (`/tmp`) — anotar si falla en prod (esperado hasta 0.2)
- [ ] URLs de media absolutas (`/uploads/...` o dominio API)

| Bloque | Local | Prod | Notas |
|--------|-------|------|-------|
| PAR-C uploads | | | |

---

## 5. Social (Fase 3 — pendiente implementación Web)

No marcar hasta que exista UI Web; sirve como recordatorio.

- [ ] **App:** tab Social / hub carga `GET /auth/social/hub`
- [ ] **Web:** hub social (pendiente)
- [ ] **App:** discover con facetas
- [ ] **Web:** discover vía `/auth/discover` (pendiente)
- [ ] Follow / solicitudes / bloqueos: paridad Web (pendiente)

| Bloque | App | Web | Notas |
|--------|-----|-----|-------|
| Social Fase 3 | | | |

---

## 6. Exclusivos documentados (no exigir paridad)

Confirmar que **existen** en su plataforma y **no** se exigen en la otra:

| Exclusivo App | ¿Probado en App? | Exclusivo Web | ¿Probado en Web? |
|---------------|------------------|---------------|------------------|
| Entrenar en vivo `/entrenar` | [ ] | Layout sidebar ancho | [ ] |
| Cola offline publicar | [ ] | StatisticsPage | [ ] |
| Biométrico login | [ ] | Atajos teclado (si hay) | [ ] |
| Recordatorios locales | [ ] | — | — |

---

## 7. Futuro (no bloquea Fase 2)

- [ ] Estadísticas Web → App (decisión 5)
- [ ] Tema claro/oscuro App ← Web (decisión 6)
- [ ] Ajustes App ← Web con difs. documentadas (decisión 7)
- [ ] REV-004 bienvenida post-verify
- [ ] PAR-G menciones @usuario en Web
- [ ] PAR-H visibilidad de post en Web
- [ ] PAR-I reportar / moderación
- [ ] Vídeo en posts (P2)

---

## Verificación cruzada mínima (15 min) — cierre Fase 2 P0

Hacer en un solo pase cuando 2.1–2.5 estén en verde:

1. [x] Login `demo_alpha` en **Web** y **App**
2. [x] **Web:** publicar post con 1 foto (PC)
3. [x] **App:** refrescar feed **Todos** → se ve el post
4. [x] **App:** like + comentario
5. [x] **Web:** refrescar → like y comentario visibles
6. [x] **Web:** cambiar a **Seguidos** / **Todos** y comprobar coherencia con API
7. [x] **App:** regresión rápida (sin bucle, posts estables)

| Cierre Fase 2 P0 | OK | Fecha | Responsable |
|------------------|-----|-------|-------------|
| Verificación cruzada | ✅ | mayo 2026 | Cristian |

---

## Historial de pasadas

| Fecha | Quién | Alcance | Resultado |
|-------|-------|---------|-----------|
| mayo 2026 | Cristian | Fase 2 feed + posts (2.3, 2.4, cruzado, PAR-B) | ✅ Cerrada P0 |
