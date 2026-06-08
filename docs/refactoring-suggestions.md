# Sugerencias de refactor — Goi App

Documento de referencia para deuda técnica y trabajo futuro. No implica compromiso de implementación inmediata.

**Última actualización:** junio 2026

---

## Estado del refactor (resumen)

| Área | Estado |
|------|--------|
| `usePostInteractions` | ✅ Hecho |
| Feed (`index.tsx` + hooks) | ✅ Hecho |
| `useCreatePostForm` partido | ✅ Hecho |
| Perfil posts unificado | ✅ Hecho |
| Store único saved/mute | ✅ Hecho |
| Social Hub → store | ✅ Hecho (`SocialHubProvider` solo hidrata) |
| `PostTrainingBody` compartido | ✅ Hecho |
| `utils/postMedia/` | ✅ Hecho (re-exports legacy finos) |
| `useFocusStaleRefresh` | ✅ Hecho (feed vía `useFeedFocusEffects`) |
| Tests mínimos + `npm run verify` | ✅ Hecho (38 tests + `tsc`) |
| `FeedSuggestionsRow` partido | ✅ Hecho (card, header, styles) |
| `PostCardHeader` | ✅ Parcial |
| Estilos catálogo ejercicios | ✅ Movido a `components/workouts/styles/` |
| Beam dorado en posts recientes | ✅ Corregido (elegibilidad + viewability top) |
| Rutas legacy | ⏳ Redirects finos; pendiente eliminar |
| `PostCard` resto (media, menús, body) | ⏳ Pendiente |
| Tests `normalizePost`, `blocksFromLegacy` | ⏳ Pendiente |
| Migración media data URL → servidor | ⏳ Producto / datos |

---

## Lo que ya está bien (no tocar a la ligera)

- **API delgada** (`api/` + `normalizePost`) alineada con Goi Server/Web.
- **Zustand** con reglas claras (prefs del feed, interacción, social hub) y docs en `.cursorrules` / `docs/zustand-migration.md`.
- **Rendimiento del feed**: FlashList, `PostCard` memoizado, `FeedPostActionsContext` con refs, beam en Reanimated.
- **Preview de posts**: subsistema coherente (`PostPreviewDraft`, `PostFeedPreviewStandard` / `PostFeedPreviewTraining`).
- **Dominios separados** en `components/` (workouts, profile, feed, social, post).

---

## Completado (detalle)

### 1. `usePostInteractions` ✅

Hook central: `hooks/usePostInteractions.ts`.

Consumidores: `hooks/useFeedPostActions.ts`, `hooks/useProfilePostDetailState.ts`, `components/profile/ProfilePostDetailScreen.tsx`.

### 2. Feed descompuesto ✅

| Antes | Después |
|-------|---------|
| `app/(tabs)/index.tsx` ~930 líneas | ~274 líneas (composición) |
| Monolito | `FeedScreenContent`, `useFeedPostActions`, `useFeedStories`, `useFeedDiscoverSuggestions`, `useFeedScrollFab`, `useFeedFocusEffects`, `useFeedWorkoutTitles`, `useFeedGoldBeam` |

### 3. Crear publicación ✅

| Módulo | Archivo |
|--------|---------|
| Orquestador | `hooks/useCreatePostForm.ts` (~176 líneas) |
| Borrador | `hooks/usePostDraftPersistence.ts` |
| Sesión | `hooks/usePostSessionLink.ts` |
| Imágenes | `hooks/usePostImageAssets.ts` |
| Submit | `hooks/usePostSubmit.ts` |
| Tipos / utils | `hooks/createPost/` |

### 4. Perfil posts ✅

- Shell: `components/profile/ProfilePostsShell.tsx`
- Detalle: `hooks/useProfilePostDetailState.ts`
- `ProfilePostsSection` / `PublicProfilePostsSection` → wrappers finos

### 5. Guardados y silenciados ✅

- Source of truth: `stores/useFeedPrefsStore.ts`
- AsyncStorage solo persistencia (`hydrateFeedLocalPrefs`)
- `useProfilePosts`, `useMutedUsers` suscritos al store

### 6. Social Hub ✅

- `useSocialHub()` eliminado
- `context/SocialHubContext.tsx` → solo `SocialHubProvider` (hidrata store al login)
- Consumidores: `useSocialHubStore` directo

### 7–8. Post training + media ✅

- `components/post/PostTrainingBody.tsx` (feed + preview)
- `utils/postMedia/` (`url`, `display`, `imageSource`, `thumbnail`, `index`)
- Legacy: `postDisplayMedia.ts`, `feedPostMediaUrl.ts`, etc. → re-exports

### 9. Refresh al foco ✅

- Hook: `hooks/useFocusStaleRefresh.ts` (opciones: `deferUntilInteractions`, `forceRefresh`, `onFocusEnter`, …)
- Migrados: `useProfilePosts`, `useProfileStats`, `WorkoutsListScreen`, `SocialDiscoverScreen`, **`useFeedFocusEffects`**
- Constantes feed: `FEED_STALE_MS`, `FEED_AUX_REFRESH_STALE_MS` en `constants/feed.ts`

### 10. Tests ✅

- `npm run verify` → Jest + `tsc --noEmit`
- Utils: `createPostValidation`, `feedTimeline`, `feedListItems`, `postMedia`, `postInteractionLogic`, `socialDiscoverSort`
- Stores: `useFeedPrefsStore`, `useFeedInteractionStore`, `useNotificationPrefsStore`
- Helpers: `__tests__/helpers/mockPost.ts` (ignorado por Jest en `testPathIgnorePatterns`)

### Limpieza / opcionales hechos ✅

- `FeedSuggestionsRow` → `FeedSuggestionCard`, `FeedSuggestionsSectionHeader`, `feedSuggestionsStyles`, `feedSuggestionsCopy`
- `PostCardHeader` extraído de `PostCard`
- `constants/exerciseCatalogUi.ts` → `components/workouts/styles/exerciseCatalogUi.ts` (re-export deprecated en `constants/`)
- Rutas centralizadas: `constants/appRoutes.ts`; redirects en `feed.tsx`, `perfil.tsx`, `descubrir.tsx`, `notificaciones.tsx`
- Gold beam: `postEligibleForGoldBeam` incluye training / `hasMedia`; `useFeedGoldBeam` prioriza post superior con scroll en top
- Eliminados: `useFeedGoldBeamPref` (→ `useHydrateGoldBeamPref` + store), `filterExerciseEquipmentOptions.ts`

---

## Pendiente (prioridad sugerida)

### Media — calidad

| Tarea | Notas |
|-------|--------|
| Acabar `PostCard` | Extraer media block, body/comentarios, menús overflow (~487 líneas) |
| Tests faltantes | `normalizePost`, `blocksFromLegacy` |
| Actualizar `docs/zustand-migration.md` | Quitar referencias a `useSocialHub()` como facade activo |

### Baja — limpieza

| Tarea | Notas |
|-------|--------|
| Eliminar rutas legacy | `app/feed.tsx`, `perfil.tsx`, `descubrir.tsx`, `notificaciones.tsx` cuando deep links estén migrados |
| Re-exports deprecated | `constants/exerciseCatalogUi.ts`, utils `postMedia` legacy, `constants/theme.ts` |
| Migración media en datos | Posts con data URLs no muestran foto ni beam; ver `docs/flujo-subida-imagenes.md` |

### Fuera de este doc (producto / infra)

- GPS + discover cercano, notificaciones locales, CI/EAS, flujo definitivo de subida de imágenes.

---

## Qué **no** refactorizar (a propósito)

- **`FeedPostActionsContext` con refs** — indirection necesaria para perfil sin re-renders de lista.
- **Beam dorado** (utils + worklet + `PostCardGoldBeam`) — complejo pero justificado; no simplificar sin medir.
- **Android pantalla vs iOS modal** en detalle de post desde perfil.
- **Goi Server como API única** — capa `api/` acotada.
- **Legacy workout blocks** — `blocksFromLegacy` hasta migración de datos.

---

## Archivos más complejos (referencia actualizada)

| Líneas (aprox.) | Archivo | Responsabilidad |
|----------------:|---------|-----------------|
| 792 | `components/workouts/WorkoutPerformScreen.tsx` | Sesión en vivo |
| 637 | `components/workouts/WorkoutsListScreen.tsx` | Hub entrenamientos |
| 616 | `components/social/SocialDiscoverScreen.tsx` | Descubrir usuarios |
| 487 | `components/feed/PostCard.tsx` | Tarjeta de post |
| 274 | `app/(tabs)/index.tsx` | Feed (composición) |
| 258 | `components/feed/FeedSuggestionsRow.tsx` | Sugerencias discover |
| 248 | `components/profile/ProfilePostsSection.tsx` | Posts perfil propio |
| 214 | `components/profile/PublicProfilePostsSection.tsx` | Posts perfil ajeno |
| 176 | `hooks/useCreatePostForm.ts` | Orquestador crear publicación |

---

## Deuda documentada (sin TODOs inline)

- Rutas legacy con redirect: `app/feed.tsx`, `app/perfil.tsx`, `app/descubrir.tsx`, `app/notificaciones.tsx`
- Modelo workout legacy: `blocksFromLegacy` en `utils/workoutBlocks.ts`
- Auth legacy: migración AsyncStorage → SecureStore en `api/session.ts`
- Media legacy: data URLs en store; `getPostMedia`, `sanitizeForFeed`
- `@deprecated`: re-exports en `constants/exerciseCatalogUi.ts`, `constants/theme.ts`, utils `postMedia` antiguos

---

## Comandos útiles

```bash
npm run verify    # Jest (38 tests) + tsc
npm start         # Expo con QR
```

---

## Resumen

El bloque de refactor **alta/media prioridad del plan original está cerrado**: interacciones de posts centralizadas, feed y crear publicación descompuestos, perfil unificado, prefs en store, Social Hub en Zustand, media unificada, refresh al foco compartido y red de tests mínima.

Lo que queda es **deuda de limpieza** (PostCard, rutas legacy, re-exports) y **deuda de producto/datos** (imágenes en servidor, posts legacy con data URLs). Conviene priorizar según roadmap de features, no más refactors estructurales amplios salvo necesidad concreta.
