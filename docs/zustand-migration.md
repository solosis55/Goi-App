# Migración a Zustand (Goi App) — **completada**

Plan por fases para introducir **Zustand** (`^5.0.14`). **Estado:** fases 0–5 cerradas (may 2026).

**Conviven:** Context (auth, toasts, overlays) + Zustand (estado cliente compartido) + hooks de pantalla (feed, editor).

Referencia FlashList (ya cerrada): `docs/flashlist-migration.md`.

---

## Reglas generales

- Stores en `stores/` — un dominio por archivo: `useSocialHubStore.ts`, `useFeedPrefsStore.ts`.
- **Selectores** en consumidores: `useStore(s => s.followingIds)`; evitar `useStore()` sin selector.
- **Acciones** async en el store o en thin hooks que llamen al store.
- **Persist:** `zustand/middleware` + `AsyncStorage` solo para prefs locales (no tokens — siguen en SecureStore vía `api/session.ts`).
- Tras cada fase: `npm run verify:fluidity` + smoke test manual del dominio.
- Mantener **facades** (`useSocialHub()`) durante la transición para no tocar 20 archivos a la vez.

### Qué NO migrar a Zustand

| Pieza | Motivo |
|-------|--------|
| `AuthContext` | Hidratación, biometría, multi-cuenta, `signIn`/`signOut` |
| `GoiToastContext` / `GoiAlertContext` | UI imperativa / modales |
| `FeedPostActionsContext` | Inyección de handlers por pantalla (refs, evita re-render del feed) |
| `FeedGoldBeamContext` | `SharedValue` Reanimated — no es estado JS |
| `ScrollInteractionGuard` | Context de scroll anidado |
| `useFeed` (timeline completo) | Estado de pantalla + lógica de paginación; hook local OK |
| `useWorkoutHubData` / perform | Ciclo de vida de una pantalla |

---

## Inventario actual (Context / estado compartido)

| Fuente | Contenido | Estado |
|--------|-----------|--------|
| `useFeedPrefsStore` | beam, scope, mute, guardados, dismiss | ✓ Store |
| `useFeedInteractionStore` | comentando/borrando feed | ✓ Store |
| `useSocialHubStore` | badges, hub, following, follow | ✓ Store; facade `useSocialHub()` |
| `useNotificationPrefsStore` | tipos silenciados | ✓ Store |
| `useSocialUiStore` | secciones colapsadas hub | ✓ Store |
| `AuthContext`, toasts, `FeedPostActionsContext`, beam Reanimated | — | Context (no migrar) |

---

## Fase 0 — Preparación

- [x] Instalar `zustand`
- [x] Crear carpeta `stores/` + `stores/index.ts` (re-exports)
- [x] Patrón base documentado en `docs/react-native-teoria.md` § Zustand
- [x] Regla en consumidores: selector + `useShallow` si el selector devuelve objeto/array

```tsx
// stores/useExampleStore.ts
import { create } from "zustand";

type ExampleState = {
  count: number;
  increment: () => void;
};

export const useExampleStore = create<ExampleState>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
```

---

## Fase 1 — Piloto: prefs del feed (beam)

**Por qué primero:** poco acoplamiento, AsyncStorage ya existe, 2–3 archivos, cero riesgo de auth.

| Archivo actual | Acción |
|----------------|--------|
| `utils/feedGoldBeamPref.ts` | Mantener lectura/escritura AsyncStorage |
| `hooks/useFeedGoldBeamPref.ts` | Sustituir por `stores/useFeedPrefsStore.ts` + selector `enabled` |
| `ProfileEditSection` (toggle privacidad) | `useFeedPrefsStore.getState().setGoldBeamEnabled` |

**Store (borrador):**

```tsx
type FeedPrefsState = {
  goldBeamEnabled: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setGoldBeamEnabled: (v: boolean) => Promise<void>;
};
```

- [x] Store creado
- [x] Hook facade `useFeedGoldBeamPref` delega al store (compat)
- [ ] Probado: toggle perfil → feed sin beam

---

## Fase 2 — Scope y prefs locales del feed

Unificar estado que hoy vive en `index.tsx` + utils:

| Estado | Origen actual | Store |
|--------|---------------|-------|
| `feedScope` | `useFeed` + `feedScopeStorage` | `useFeedPrefsStore` o `useFeedUiStore` |
| `mutedUserIdSet` | `loadMutedUserIds` en feed | mismo store, hidratar al login |
| `savedPostIdSet` | `loadSavedPostIds` | idem |
| `suggestionsDismiss` | `feedLocalPrefs` | idem |

**Orden interno:** 2a scope → 2b mute/saved → 2c dismiss sugerencias.

**No mover aún** el timeline (`posts`, `loading`, `fetchFeed`) — sigue en `useFeed`.

- [x] 2a Scope persistido (`feedScope`, `initFeedScope`, `setFeedScope`)
- [x] 2b Mute / guardados (`mutedUserIds`, `savedPostIds`)
- [x] 2c Dismiss sugerencias
- [x] Feed: menos `useState` en `index.tsx`

---

## Fase 3 — Social Hub (impacto alto)

**Archivo principal:** sustituir lógica de `SocialHubContext` por `stores/useSocialHubStore.ts`.

| Estado / acción | Notas |
|-----------------|-------|
| `followingIds` | Selector fino; usado en discover, feed, hub |
| `unreadNotifications`, `pendingFollowRequests` | Tab bar badge |
| `hub`, `hubLoading` | Hub lite |
| `refreshBadge`, `refreshHub`, `invalidateHub` | Debounce actual (12s / 25s) en store |
| `applyFollowingChange`, `toggleFollowFor` | Optimistic + API |
| `setSocialTabFocused` | Ref → flag en store |

**Estrategia:** store + `SocialHubProvider` delgado que en `useEffect` llama `hydrate(userId)` / `reset()` al login/logout (lee `useAuth` una sola vez en provider).

**Facade:** `useSocialHub()` reexporta selectores del store → **no cambiar** imports en 12 archivos en el primer PR; migrar imports en Fase 3b.

- [x] 3a Store + provider delgado + facade
- [x] 3b (parcial) `GoiTabBar` + feed `followingIds` vía store directo
- [x] Eliminar duplicado `followingIds` en `index.tsx` feed
- [ ] Probado: tab Social badge, follow discover, hub refresh

---

## Fase 4 — Prefs sociales y notificaciones

| Dominio | Archivos | Store |
|---------|----------|-------|
| Prefs notificaciones | `notificationPrefs.ts`, `NotificationsList` | `useNotificationPrefsStore` (persist) |
| Secciones colapsables hub | `socialCollapsiblePrefs.ts` | `useSocialUiStore` |
| Visitas recientes discover | `profileRecentVisits.ts` | opcional; bajo impacto |

- [x] Notificaciones prefs (`useNotificationPrefsStore`)
- [x] Hub collapsible (`useSocialUiStore`)

---

## Fase 5 — Limpieza y entregable

- [x] Sección Zustand en `docs/react-native-teoria.md`
- [x] Actualizar `.cursorrules` (Context vs Zustand)
- [x] `SocialHubContext.tsx` — facade documentada + re-export `useSocialHubStore`
- [x] `npm run verify:fluidity`
- [x] Checklist manual § H en `performance-fluidity-verification.md`

---

## Orden de ejecución

```text
Fase 0 → Fase 1 (beam pref) → Fase 2 (feed prefs) → Fase 3 (social hub) → Fase 4 → Fase 5
```

**Migración cerrada.** Mantenimiento: nuevas prefs compartidas → store en `stores/`; ver § Zustand en `docs/react-native-teoria.md`.

---

## Persist vs AsyncStorage manual

| Enfoque | Cuándo |
|---------|--------|
| `persist` middleware Zustand | Prefs simples (boolean, string enum, string[]) |
| Utils AsyncStorage + hydrate en store | Migración gradual desde utils existentes |
| SecureStore | **Solo** auth — nunca Zustand persist |

---

## Registro de stores (rellenar al migrar)

| Store | Archivo | Persist | Fase |
|-------|---------|---------|------|
| `useFeedPrefsStore` | `stores/useFeedPrefsStore.ts` | beam, scope, mute/saved/dismiss | 1–2 ✓ |
| `useSocialHubStore` | `stores/useSocialHubStore.ts` | cache hub (memoria) | 3 ✓ |
| `useNotificationPrefsStore` | `stores/useNotificationPrefsStore.ts` | AsyncStorage + API | 4 ✓ |
| `useSocialUiStore` | `stores/useSocialUiStore.ts` | secciones colapsadas hub | 4 ✓ |
