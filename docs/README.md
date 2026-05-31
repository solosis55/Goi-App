# Documentación Goi App (tutorial / prácticas)

Índice de la documentación del cliente móvil. Sirve como **portada del entregable teórico** junto con el código del repositorio.

---

## Entregables principales (evaluación / setup)

| Documento | Para qué sirve |
|-----------|----------------|
| **[`react-native-teoria.md`](./react-native-teoria.md)** | **Documento teórico central** — RN, Metro, Expo, Gluestack, FlashList, Zustand, fluidez |
| **[`ai-setup.md`](./ai-setup.md)** | Configuración de herramientas de IA (`.cursorrules`) |
| **[`comparativa-ui-gluestack-vs-paper.md`](./comparativa-ui-gluestack-vs-paper.md)** | Justificación del sistema de diseño |
| [`../README.md`](../README.md) | Arranque del proyecto, `.env`, Expo Go, scripts |

---

## Planes de implementación (completados)

| Documento | Estado | Resumen |
|-----------|--------|---------|
| [`flashlist-migration.md`](./flashlist-migration.md) | ✅ Completo | Feed, discover, rutinas, notificaciones, catálogo → FlashList |
| [`zustand-migration.md`](./zustand-migration.md) | ✅ Completo | Prefs feed, social hub, notificaciones, UI hub → `stores/` |
| [`performance-fluidity.md`](./performance-fluidity.md) | ✅ Fases 1–7 | Plan de rendimiento (memo, imágenes, animaciones, red) |

---

## Verificación en dispositivo

| Documento | Uso |
|-----------|-----|
| [`performance-fluidity-verification.md`](./performance-fluidity-verification.md) | Checklist manual A–H (feed, social, perfil, Zustand, FlashList) |
| `npm run verify:fluidity` | Typecheck automático (no sustituye prueba en móvil) |

**Antes de marcar sign-off:** dispositivo físico, Perf Monitor ON, beam dorado activado, backend con feed poblado.

---

## Mapa rápido: concepto → código

| Tema teórico | Dónde verlo en código |
|--------------|------------------------|
| Expo Router | `app/`, `app/(tabs)/` |
| Gluestack UI | `app/_layout.tsx`, componentes con `@gluestack-ui/themed` |
| FlashList feed | `components/feed/FeedAnimatedFlashList.tsx`, `app/(tabs)/index.tsx` |
| FlashList otras pantallas | `SocialDiscoverScreen`, `NotificationsList`, `WorkoutsListScreen`, … |
| Zustand stores | `stores/useFeedPrefsStore.ts`, `useSocialHubStore.ts`, … |
| Context (auth, toasts) | `context/AuthContext.tsx`, `GoiToastContext.tsx` |
| API alineada con web | `api/`, tipos en `types/` |

---

## Orden de lectura recomendado (tutorial)

1. `react-native-teoria.md` — visión global y decisiones
2. `comparativa-ui-gluestack-vs-paper.md` — UI
3. `flashlist-migration.md` + § FlashList en teoría — listas
4. `zustand-migration.md` + § Zustand en teoría — estado compartido
5. `performance-fluidity-verification.md` — probar en dispositivo

---

## Historial

| Fecha | Notas |
|-------|--------|
| 2026-05 | Setup inicial, teoría RN + Metro + Expo |
| 2026-05 | Gluestack, FlashList, Zustand, plan de fluidez |
| 2026-05 | Migraciones FlashList y Zustand cerradas; checklist § H Zustand |
