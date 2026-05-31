# Migración a FlashList (Goi App)

Plan por fases para sustituir `FlatList` / `SectionList` por `@shopify/flash-list` sin romper scroll, Reanimated ni viewability del feed.

**Paquete:** `@shopify/flash-list` 2.0.2 (instalado).

**Estado:** migración **completa** en listas verticales principales (Fases 1–5 y 7). Fase 6 opcional sin migrar.

**Reglas generales**

- Sustituir import: `FlatList` → `FlashList` from `@shopify/flash-list`.
- FlashList **v2** mide alturas automáticamente; usar `getItemType` si hay filas heterogéneas (feed).
- Mantener `keyExtractor`, `renderItem`, `extraData`; `drawDistance` opcional en listas largas.
- Tras cada fase: scroll manual, pull-to-refresh, paginación/load-more si aplica, `npm run verify:fluidity`.
- Referencia de tuning feed: `docs/performance-fluidity.md`.
- Teoría: `docs/react-native-teoria.md` § FlashList.

**Patrón Reanimated (feed y similares)**

```tsx
import { FlashList } from "@shopify/flash-list";
import Animated from "react-native-reanimated";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<ItemType>);
// Feed: ver `components/feed/FeedAnimatedFlashList.tsx`
```

Comprobar: `ref`, `onScroll` / `useAnimatedScrollHandler`, `viewabilityConfigCallbackPairs`.

---

## Inventario actual

| Archivo | Lista | Estado |
|---------|-------|--------|
| `app/(tabs)/index.tsx` | `FeedAnimatedFlashList` | ✅ |
| `components/social/SocialDiscoverScreen.tsx` | `FlashList` | ✅ |
| `components/profile/ProfileSocialList.tsx` | `FlashList` | ✅ |
| `components/workouts/WorkoutsListScreen.tsx` | `FlashList` | ✅ |
| `components/notifications/NotificationsList.tsx` | `FlashList` aplanada | ✅ |
| `components/workouts/ExerciseCatalogPanel.tsx` | `FlashList` aplanada | ✅ |
| `components/post/CreatePostFormatChooser.tsx` | `FlatList` horizontal (2 slides) | ⏸ Opcional |
| Carruseles / grids | `ScrollView` / `.map()` | ⏸ No migrar |

---

## Fase 0 — Preparación

- [x] Instalar `@shopify/flash-list`
- [x] FlashList v2 mide ítems automáticamente (sin `estimatedItemSize`)
- [x] Documentar en `docs/react-native-teoria.md` sección FlashList

---

## Fase 1 — Discover (piloto)

**Archivo:** `components/social/SocialDiscoverScreen.tsx`

- [x] Migrado
- [ ] Probado Android / iOS

---

## Fase 2 — Perfil social y rutinas

### 2a — `ProfileSocialList.tsx`

- [x] Migrado
- [ ] Probado

### 2b — `WorkoutsListScreen.tsx`

- [x] Migrado
- [ ] Probado

---

## Fase 3 — Feed principal (crítico)

**Archivo:** `app/(tabs)/index.tsx` + `components/feed/FeedAnimatedFlashList.tsx`

- [x] Migrado
- [ ] Probado Android / iOS
- [ ] Beam y FAB sin regresión

---

## Fase 4 — Notificaciones

**Archivo:** `components/notifications/NotificationsList.tsx` — **Opción B** (lista aplanada).

- [x] Decisión B
- [x] Migrado
- [ ] Probado filtros + marcar leída

---

## Fase 5 — Catálogo de ejercicios

**Archivo:** `components/workouts/ExerciseCatalogPanel.tsx` — lista aplanada.

- [x] Migrado
- [ ] Probado filtros músculo/equipo

---

## Fase 6 — Listas pequeñas / horizontales

| Archivo | Decisión |
|---------|----------|
| `CreatePostFormatChooser.tsx` | Mantener `FlatList` (2 slides; ganancia mínima) |
| `FeedSuggestionsRow` | `ScrollView` horizontal |
| `ProfilePostsGrid` | Grid con `.map()` |

- [x] Revisado — no migrar salvo requisito literal del enunciado

---

## Fase 7 — Limpieza y entregable

- [x] Comentarios actualizados (`ScrollInteractionGuard`, `usePressGuard`, `FeedSuggestionsRow`)
- [x] Sección FlashList en `docs/react-native-teoria.md`
- [x] Checklist § G en `docs/performance-fluidity-verification.md`
- [x] `npm run verify:fluidity`

---

## Pendiente: headers sticky — decisión

| Pantalla | Decisión |
|----------|----------|
| **Catálogo ejercicios** | Chip flotante del grupo muscular (`floatingSectionChip`) cuando el header inline sale de vista; solo orden «Por músculo» con varias secciones |
| **Notificaciones** | Headers de día scroll normal (nunca fueron sticky) |
| **Feed** | Separadores de día scroll normal |
| **Resto** | Sin headers de sección |

Implementación: `ExerciseCatalogPanel.tsx` + `onViewableItemsChanged`.

---

## Orden de ejecución (histórico)

```text
Fase 0 → 1 → 2 → 3 → 4 → 5 → 6 (revisión) → 7 ✓
```

**Siguiente paso:** prueba manual § G en `performance-fluidity-verification.md`; luego decidir headers sticky.
