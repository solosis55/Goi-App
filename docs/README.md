# Documentación Goi App

Índice de la documentación del cliente móvil (Expo / React Native). Sirve como **portada del entregable teórico** junto con el código del repositorio.

**Última actualización:** junio 2026

---

## Entregables principales (evaluación / setup)

| Documento | Para qué sirve |
|-----------|----------------|
| **[`react-native-teoria.md`](./react-native-teoria.md)** | **Documento teórico central** — RN, Metro, Expo, Gluestack, FlashList, Zustand, fluidez |
| **[`flujo-subida-imagenes.md`](./flujo-subida-imagenes.md)** | Diagrama: subir foto → URL en servidor → imagen en pantalla |
| **[`ai-setup.md`](./ai-setup.md)** | Configuración de IA (`.cursorrules`) |
| **[`comparativa-ui-gluestack-vs-paper.md`](./comparativa-ui-gluestack-vs-paper.md)** | Justificación del sistema de diseño |
| [`../README.md`](../README.md) | Arranque, `.env`, Expo Go, scripts |

---

## Planes de implementación (completados)

| Documento | Estado | Resumen |
|-----------|--------|---------|
| [`flashlist-migration.md`](./flashlist-migration.md) | ✅ | Feed, discover, rutinas, notificaciones, catálogo → FlashList |
| [`zustand-migration.md`](./zustand-migration.md) | ✅ | Prefs feed, social hub, notificaciones, UI hub → `stores/` |
| [`performance-fluidity.md`](./performance-fluidity.md) | ✅ Fases 1–7 | Rendimiento: memo, imágenes, animaciones, red |
| [`refactoring-suggestions.md`](./refactoring-suggestions.md) | ✅ Cerrado | Refactor estructural (feed, posts, crear publicación, tests) |

---

## Arquitectura de la app (mapa rápido)

```text
app/                    Expo Router (pantallas y tabs)
├── (tabs)/index.tsx    Feed (~ composición; lógica en hooks/)
components/             UI por dominio (feed, profile, social, post, workouts)
hooks/                  Lógica de pantalla y orquestadores (useFeed*, useCreatePostForm, …)
stores/                 Zustand — prefs compartidas, social hub, interacción feed
context/                Auth, toasts, beam Reanimated, handlers inyectados (FeedPostActions)
api/                    Cliente HTTP + normalización (`normalizePost`)
types/                  Contratos alineados con Goi Web / Goi Server
utils/                  Puro (feedTimeline, postMedia/, validación, …)
__tests__/              Jest — utils, stores, componentes clave
```

**Backend:** [Goi Web](../Goi Web) → `server/` en `:4000/api`. La app usa `EXPO_PUBLIC_API_URL`.

---

## Verificación

| Comando / doc | Qué hace |
|---------------|----------|
| `npm run verify` | **Jest (38 tests)** + `tsc --noEmit` — comprobación completa local |
| `npm run verify:fluidity` | Solo typecheck (alias histórico Fase 8; no ejecuta tests) |
| [`performance-fluidity-verification.md`](./performance-fluidity-verification.md) | Checklist manual A–H en dispositivo físico |
| `.github/workflows/test.yml` | CI: tests + cobertura + typecheck en push/PR |
| `eas.json` | Perfiles `preview` (APK) y `production` (AAB) |

**Antes de sign-off manual:** dispositivo físico, Perf Monitor ON, beam dorado activado, backend con feed poblado.

---

## Mapa: concepto → código

| Tema | Dónde verlo |
|------|-------------|
| Expo Router | `app/`, `app/(tabs)/`, `constants/appRoutes.ts` |
| Feed (pantalla) | `app/(tabs)/index.tsx` → `components/feed/FeedScreenContent.tsx` |
| Feed (datos) | `hooks/useFeed.ts`, `hooks/useFeedFocusEffects.ts`, `hooks/useFeedPostActions.ts` |
| Interacciones post | `hooks/usePostInteractions.ts` → feed + perfil |
| Beam dorado | `hooks/useFeedGoldBeam.ts`, `components/feed/PostCardGoldBeam.tsx`, `stores/useFeedPrefsStore` |
| FlashList feed | `components/feed/FeedAnimatedFlashList.tsx` |
| Crear publicación | `hooks/useCreatePostForm.ts` + `usePostDraftPersistence`, `usePostSubmit`, … |
| Perfil posts | `components/profile/ProfilePostsShell.tsx`, `hooks/useProfilePostDetailState.ts` |
| Media posts | `utils/postMedia/` (`resolveUrl`, `sanitizeForFeed`, …) |
| Training body | `components/post/PostTrainingBody.tsx` (feed + preview) |
| Refresh al foco | `hooks/useFocusStaleRefresh.ts` |
| Zustand | `stores/useFeedPrefsStore.ts`, `useSocialHubStore.ts`, … |
| Social hub | `stores/useSocialHubStore.ts` + `context/SocialHubProvider.tsx` (solo hidrata) |
| Tests | `__tests__/utils/`, `__tests__/stores/`, `__tests__/components/` |
| API | `api/`, `utils/normalizePost.ts`, `types/post.ts` |

---

## Orden de lectura recomendado

1. [`react-native-teoria.md`](./react-native-teoria.md) — visión global
2. [`comparativa-ui-gluestack-vs-paper.md`](./comparativa-ui-gluestack-vs-paper.md) — UI
3. [`flashlist-migration.md`](./flashlist-migration.md) + § FlashList en teoría
4. [`zustand-migration.md`](./zustand-migration.md) + § Zustand en teoría
5. [`refactoring-suggestions.md`](./refactoring-suggestions.md) — estado del refactor estructural
6. [`performance-fluidity-verification.md`](./performance-fluidity-verification.md) — probar en dispositivo
7. [`flujo-subida-imagenes.md`](./flujo-subida-imagenes.md) — subida de imágenes (práctica Fase 8)

---

## Historial

| Fecha | Notas |
|-------|--------|
| 2026-05 | Setup inicial, teoría RN + Metro + Expo |
| 2026-05 | Gluestack, FlashList, Zustand, plan de fluidez |
| 2026-05 | Migraciones FlashList y Zustand cerradas |
| 2026-06 | Refactor feed/perfil/crear post; `useFocusStaleRefresh`; tests + `npm run verify`; beam en posts recientes; doc actualizada |
