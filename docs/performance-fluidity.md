# Fluidez de la app (Goi App)

Checklist priorizado para mejorar rendimiento percibido y FPS. Ir marcando ítems al completar cada fase.

**Medición recomendada** (antes/después de cada fase): React DevTools Profiler en scroll 5 s, like, escribir comentario; Perf Monitor en dispositivo Android gama media.

---

## Fase 1 — Feed: scroll y re-renders del listado

Impacto alto en la pantalla más usada.

- [x] `scrollEventThrottle` del feed a 16 (antes 8)
- [x] Notificación del beam dorado con throttle (~32 ms), no en cada frame
- [x] Borrador de comentario local por fila (`FeedPostCardRow`), sin `commentByPostId` en `extraData`
- [x] `extraData` del `FlatList` reducido a primitivos / revisión (`feedListExtraKey`)
- [x] `React.memo` con comparador explícito en `PostCard` (si hace falta tras medir Fase 1)
- [x] Baseline: plantilla en [`performance-fluidity-verification.md`](./performance-fluidity-verification.md#plantilla-baseline-comparar-antesdespués)

---

## Política de animaciones

| Contexto | Regla |
|----------|--------|
| **Listas** (feed, discover, notificaciones) | Sin `LayoutAnimation`. Cambios de layout instantáneos o Reanimated en UI thread. |
| **Beam feed** | `strokeDashoffset` en Reanimated; sin `setState` por frame. |
| **Modales / pantallas aisladas** | Reanimated / `LayoutAnimation` permitido (p. ej. expandir ejercicio en sesión). |
| **Editor publicación** | Reanimated en banner de borrador y selector de formato — OK (no compite con FlatList). |

---

## Fase 2 — PostCard y listas (feed + afinado)

- [x] Extraer bloque de comentarios a `PostCardComments` memoizado
- [x] Handlers estables vía `useRef` / contexto (`FeedPostActionsContext`)
- [x] Pasar tokens mínimos de tema en lugar de `palette` + `typography` completos
- [x] `removeClippedSubviews={true}` en Android en el feed
- [ ] `getItemLayout` — omitido: alturas variables por formato de post
- [x] Afinar `windowSize` / `maxToRenderPerBatch` (5 / 4)
- [x] `React.memo` con comparador explícito en `PostCard` y `FeedPostCardRow`

---

## Fase 3 — Imágenes

- [x] `expo-image` en carrusel del feed (`PostMediaCarousel`)
- [x] `cachePolicy` + `recyclingKey` por URL (`PostFeedImage`)
- [x] Tamaño de decode acotado al layout × pixel ratio en feed
- [x] Evitar data URLs grandes en posts ya publicados — **legacy:** se muestran; nuevos posts deberían usar URL HTTP del servidor
- [x] Lightbox del feed migrado a `expo-image`

---

## Fase 4 — Animaciones

- [x] Sin `LayoutAnimation` en feed (caption ↔ sesión instantáneo; sugerencias al ocultar fila)
- [x] Beam dorado: path estático + `strokeDashoffset` en UI thread (Reanimated), sin `setState` por frame
- [x] Viewability del beam estabilizada (`minimumViewTime` 280 ms) para evitar saltos entre posts
- [x] `WorkoutPerformScreen`: sin `LayoutAnimation` al iniciar descanso entre series
- [x] Política documentada (ver sección «Política de animaciones»)
- [x] Editor de publicación: Reanimated aislado; sin LayoutAnimation en listas

---

## Fase 5 — Gestos e interacción

Política: feed = `Pressable` + RNGH en media; detalle perfil (`GuardedScrollView`) = `ScrollAwarePressable` + `usePressGuard`.

- [x] Auditoría `usePressGuard` / `ScrollInteractionGuard`: solo en `ProfilePostDetailScreen` / modal
- [x] `TapSlopPressable` solo vía `ScrollAwarePressable` (`scrollGuarded`) en detalle embebido — no en feed ni grid de perfil
- [x] Superficie de media: RNGH (`PostMediaCarousel`); botones feed: `Pressable` directo
- [x] Doble tap like sin guard (`onDoubleTapLike` → RNGH, sin `usePressGuard`)
- [x] `ScrollAwarePressable` + `useOptionalPressGuard` como API unificada

---

## Fase 6 — Otras pantallas con listas

- [x] Social hub: callbacks estables en listas de solicitudes / bloqueados
- [x] Discover: `FlatList` virtualizado + `SocialDiscoverUserRow` memo + refresh silencioso al volver
- [x] Perfil externo: sticky header sin `setState` en cada frame + `removeClippedSubviews` Android
- [x] Notificaciones: `NotificationRow` memo + `extraData` primitivo + header memoizado
- [ ] Perfil propio (`ProfileScreen`): `removeClippedSubviews` omitido (sticky tabs + grid)

---

## Fase 7 — Red, estado y efectos visuales opcionales

- [x] Polling badge: intervalos 90 s / 180 s, sin duplicar en Social tab, debounce 12 s en `refreshBadge`
- [x] Hub: debounce 25 s en `refreshHub` + coalescing si hay petición en vuelo
- [x] Timeline: `patchPost` + `reuseFeedListItems` (solo filas afectadas cambian ref)
- [x] `InteractionManager.runAfterInteractions` tras publicar antes de navegar al feed
- [x] Beam dorado: toggle en Perfil → Privacidad («Brillo dorado en el feed»); viewability off si desactivado
- [x] Beam por viewability sin trabajo extra cuando está desactivado (pairs vacíos)

---

## Fase 8 — Verificación y regresión

Documento detallado: [`performance-fluidity-verification.md`](./performance-fluidity-verification.md)

**Automatizado (local / CI):**

```bash
npm run verify:fluidity
```

- [x] Checklist manual documentado (feed, like, comentar, sesión inline, crear post, entreno, social)
- [x] Plantilla baseline FPS / re-renders / tiempos
- [ ] **Sign-off en dispositivo físico** — Android ☐ · iOS ☐ *(rellenar en verification doc)*

---

## Orden de ejecución

```text
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6 → Fase 7 → Fase 8
```

Las fases 5–7 pueden solaparse en PRs pequeños si el área es independiente (p. ej. imágenes y gestos).

**Estado del plan:** fases 1–7 implementadas. Fase 8 = checklist + baseline listos; falta **sign-off manual** en Android/iOS (`performance-fluidity-verification.md`).

**Documentación tutorial:** índice en [`docs/README.md`](./README.md); teoría consolidada en [`react-native-teoria.md`](./react-native-teoria.md).
