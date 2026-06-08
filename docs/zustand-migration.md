# Migración a Zustand (Goi App) — **completada**

Plan por fases para **Zustand** (`^5.0.14`). **Estado:** fases 0–5 cerradas; refactor posterior eliminó el facade `useSocialHub()` (jun 2026).

**Conviven:** Context (auth, toasts, overlays, beam Reanimated) + Zustand (estado cliente compartido) + hooks de pantalla (`useFeed`, editor de post).

Referencia FlashList: [`flashlist-migration.md`](./flashlist-migration.md).

---

## Reglas generales (mantenimiento)

- Stores en `stores/` — un dominio por archivo.
- **Selectores finos:** `useStore(s => s.followingIds)`; evitar suscribirse al store entero.
- **Persist:** AsyncStorage vía utils + `hydrate()` en el store (no tokens — SecureStore en `api/session.ts`).
- Tras cambios en stores compartidos: `npm run verify` + smoke test del dominio.
- **Código nuevo:** importar desde `stores/` directamente. No reintroducir facades sobre stores.

### Qué NO migrar a Zustand

| Pieza | Motivo |
|-------|--------|
| `AuthContext` | Hidratación, biometría, multi-cuenta |
| `GoiToastContext` / `GoiAlertContext` | UI imperativa |
| `FeedPostActionsContext` | Handlers inyectados por pantalla (refs, evita re-render del feed) |
| `FeedGoldBeamContext` | `SharedValue` Reanimated |
| `ScrollInteractionGuard` | Context de scroll anidado |
| `useFeed` (timeline) | Estado de pantalla + paginación |
| `useWorkoutHubData` / perform | Ciclo de vida de una pantalla |

---

## Inventario actual

| Fuente | Contenido | Estado |
|--------|-----------|--------|
| `useFeedPrefsStore` | beam, scope, mute, guardados, dismiss sugerencias | ✓ Store |
| `useFeedInteractionStore` | comentando / borrando en feed | ✓ Store |
| `useSocialHubStore` | badges, hub, following, follow optimista | ✓ Store (consumo directo) |
| `useNotificationPrefsStore` | tipos silenciados en lista | ✓ Store |
| `useSocialUiStore` | secciones colapsables hub | ✓ Store |
| `SocialHubProvider` | Hidrata / resetea store al login/logout | ✓ Context mínimo |
| Auth, toasts, `FeedPostActionsContext`, beam | — | Context |

---

## Fases (histórico — todas cerradas)

### Fase 0 — Preparación ✅

- Carpeta `stores/`, patrón documentado en `docs/react-native-teoria.md` § Zustand.

### Fase 1 — Prefs beam ✅

- `stores/useFeedPrefsStore.ts` (`goldBeamEnabled`, `hydrateGoldBeam`, `setGoldBeamEnabled`)
- `utils/feedGoldBeamPref.ts` — persistencia AsyncStorage
- `hooks/useHydrateGoldBeamPref.ts` — hidrata al montar pantallas que muestran el toggle
- ~~`hooks/useFeedGoldBeamPref.ts`~~ — **eliminado** (jun 2026)

### Fase 2 — Scope y prefs locales del feed ✅

- `feedScope`, `mutedUserIds`, `savedPostIds`, dismiss sugerencias → `useFeedPrefsStore`
- Timeline del feed sigue en `useFeed` (no en store)

### Fase 3 — Social Hub ✅

- `stores/useSocialHubStore.ts` con debounce badge/hub
- ~~`useSocialHub()` facade~~ — **eliminado**; consumidores migrados al store
- `context/SocialHubContext.tsx` → solo `SocialHubProvider` (~20 líneas)

### Fase 4 — Prefs sociales y notificaciones ✅

- `useNotificationPrefsStore`, `useSocialUiStore`

### Fase 5 — Entregable ✅

- Docs, `.cursorrules`, checklist § H en `performance-fluidity-verification.md`

---

## Registro de stores

| Store | Archivo | Persistencia |
|-------|---------|--------------|
| `useFeedPrefsStore` | `stores/useFeedPrefsStore.ts` | beam, scope, mute, saved, dismiss |
| `useSocialHubStore` | `stores/useSocialHubStore.ts` | caché en memoria |
| `useFeedInteractionStore` | `stores/useFeedInteractionStore.ts` | memoria |
| `useNotificationPrefsStore` | `stores/useNotificationPrefsStore.ts` | AsyncStorage + API |
| `useSocialUiStore` | `stores/useSocialUiStore.ts` | secciones colapsadas |

---

## Persist vs AsyncStorage manual

| Enfoque | Cuándo |
|---------|--------|
| Utils AsyncStorage + `hydrate()` en store | Prefs actuales del feed y notificaciones |
| SecureStore | **Solo** auth — nunca Zustand persist |

---

## Relacionado

- Refactor estructural (feed, guardados): [`refactoring-suggestions.md`](./refactoring-suggestions.md)
- Teoría Context vs Zustand: [`react-native-teoria.md`](./react-native-teoria.md) § 5
