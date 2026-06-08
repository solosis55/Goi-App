# React Native — conceptos teóricos (Goi App)

Documentación teórica del apartado de **setup y prácticas** del proyecto. Resume decisiones técnicas y enlaza con los planes de implementación en `docs/`.

## Índice

1. [React Native vs app nativa](#1-diferencia-entre-react-native-y-una-app-nativa-a-mano)
2. [Metro](#2-qué-es-metro)
3. [Expo Go y producción](#3-por-qué-expo-go-no-basta-para-muchos-proyectos-reales)
4. [Sistemas de diseño (Gluestack)](#sistemas-de-diseño)
5. [FlashList](#4-flashlist--listas-de-alto-rendimiento)
6. [Zustand](#5-zustand--estado-compartido)
7. [Fluidez y rendimiento](#6-fluidez-y-rendimiento)
8. [Arquitectura de capas (jun 2026)](#7-arquitectura-de-capas-jun-2026)
9. [Documentación relacionada](#8-documentación-relacionada)

---

## 1. Diferencia entre React Native y una app nativa “a mano”

Una **app nativa clásica** (por ejemplo solo en Swift/Kotlin) usa directamente los kits de UI y APIs de cada plataforma: el equipo suele duplicar lógica y pantallas si quiere iOS y Android.

**React Native** permite escribir la interfaz y gran parte de la lógica en **JavaScript/TypeScript** con componentes que el motor traduce a controles nativos (vistas reales de iOS/Android), no a un simple “sitio web dentro de un contenedor”. Sigues teniendo acceso a módulos nativos cuando hace falta (cámara, sensores, etc.), pero el flujo de desarrollo es más unificado y cercano al ecosistema **React** (componentes, estado, hooks).

En resumen: no deja de ser una app nativa en el dispositivo; cambia **cómo** se implementa y se comparte código entre plataformas.

## 2. Qué es Metro

**Metro** es el **empaquetador (bundler)** que usa React Native por defecto. Su trabajo es:

- Leer el grafo de módulos a partir del punto de entrada (por ejemplo el entry de **Expo Router**).
- Resolver imports, aplicar transformaciones (TypeScript, JSX, etc.) y generar bundles que la app carga en tiempo de desarrollo o producción.
- Ofrecer **recarga rápida** (Fast Refresh) mientras desarrollas, para ver cambios sin recompilar todo el proyecto nativo cada vez.

Sin un bundler como Metro, el código TypeScript/React no podría ejecutarse tal cual en el runtime de JavaScript de la app.

## 3. Por qué Expo Go no basta para muchos proyectos reales

**Expo Go** es una app precompilada en la tienda que incluye un conjunto **fijo** de módulos nativos de Expo. Sirve de maravilla para **prototipar** y seguir el curso: escaneas el QR y ves tu proyecto al instante.

En **producción** o en equipos serios suelen aparecer límites:

- **Módulos nativos a medida** o librerías que no vienen en el cliente Expo Go requieren un **development build** (binario propio) o un flujo **EAS Build**.
- **Identidad y tiendas**: publicar en App Store / Play Store implica **firma**, IDs de aplicación, permisos y builds que no son el binario genérico de Expo Go.
- **Control de versiones del runtime**: en un cliente propio decides qué SDK y qué código nativo llevas; con Expo Go dependes de la versión que tenga cada desarrollador o tester en el móvil.

Por eso Expo Go es una herramienta de **desarrollo y pruebas**, mientras que un producto real suele evolucionar hacia **builds propios** (prebuild + Xcode/Gradle o nube con EAS).

## Sistemas de diseño

Para la interfaz de **Goi App** se ha elegido **Gluestack UI** (paquetes `@gluestack-ui/themed`, `@gluestack-ui/config` y `@gluestack-style/react`, con `react-native-svg` para iconografía/gráficos vectoriales según la guía de Expo).

**Justificación de la elección**

- **Coherencia con Goi Web:** la web ya usa **Tailwind CSS**; Gluestack apuesta por **tokens y composición** de componentes, una mentalidad parecida (utilidades y tema centralizado) que reduce la fricción entre equipos web y móvil.
- **Identidad de producto:** Goi es una red social de gimnasio con necesidad de **marca propia** (fotos, perfiles, feeds). Gluestack permite maquetar una UI **personalizada** sin quedar atados al lenguaje visual de Material Design, que sería el caso más marcado con **React Native Paper**.
- **Documentación y prácticas:** la instalación sigue la [guía oficial de Gluestack para Expo](https://gluestack.io/ui/docs/guides/install-expo); el tema por defecto (`@gluestack-ui/config`) acelera el arranque y el **provider** (`GluestackUIProvider`) está configurado en la raíz de rutas (`app/_layout.tsx`) para que tokens y componentes temáticos estén disponibles en toda la app.

Una comparativa más detallada con React Native Paper está en `docs/comparativa-ui-gluestack-vs-paper.md`.

## 4. FlashList — listas de alto rendimiento

**FlashList** (`@shopify/flash-list`) es el sustituto recomendado de `FlatList` cuando una pantalla muestra **muchas filas** o filas **pesadas** (imágenes, animaciones). En Goi App está instalado y migrado en las listas verticales principales; ver el inventario en `docs/flashlist-migration.md`.

### Por qué no basta FlatList

`FlatList` de React Native virtualiza (solo pinta lo visible), pero recicla celdas de forma conservadora y puede medir mal filas de **altura variable** (posts con foto, posts de entreno, separadores de día). Eso provoca saltos de layout y más trabajo en el hilo JS al hacer scroll rápido.

FlashList reutiliza vistas de forma más agresiva y, en la **v2** del paquete, **mide alturas en runtime** sin obligar a declarar `estimatedItemSize` como en la v1.

### Patrones usados en Goi

| Patrón | Dónde | Para qué |
|--------|-------|----------|
| `FlashList` directo | Discover, rutinas, perfil social, notificaciones, catálogo | Scroll vertical estándar |
| `FeedAnimatedFlashList` | Feed (`FeedScreenContent.tsx`) | `useAnimatedScrollHandler` + beam dorado + `viewabilityConfigCallbackPairs` |
| `getItemType` | Feed, notificaciones, catálogo | Filas heterogéneas (post vs día vs sugerencias; header vs notificación; músculo vs ejercicio) |
| Lista aplanada | Notificaciones, catálogo | Sustituir `SectionList`: headers de sección como ítems `{ kind: 'sectionHeader' }` |
| `extraData` | Todas las listas con estado en fila | Forzar re-render al cambiar like, follow, selección, etc. |

### Feed + Reanimated

El feed no usa el `AnimatedFlashList` del paquete (basado en `Animated` de RN), sino un wrapper propio:

```tsx
// components/feed/FeedAnimatedFlashList.tsx
Animated.createAnimatedComponent(FlashList<FeedListItem>)
```

Así `scrollY` del beam y el FAB de “volver arriba” siguen en el hilo de UI con **Reanimated**.

### Qué no migramos (a propósito)

- Carruseles horizontales (`ScrollView`, p. ej. sugerencias del feed).
- `CreatePostFormatChooser`: dos slides; `FlatList` horizontal es suficiente.
- Grids fijos con `.map()` (grid de posts en perfil).

### Headers de sección

Tras migrar notificaciones y catálogo, los títulos de día / grupo muscular **scrollan con la lista**. Si hace falta sticky de nuevo, decidirlo aparte — ver nota en `docs/flashlist-migration.md`.

## 5. Zustand — estado compartido

**Zustand** es una librería de estado global minimalista para React. En Goi App complementa (no sustituye) a **Context** para prefs y social compartidos entre pantallas. Plan e inventario: `docs/zustand-migration.md`.

### Context vs Zustand en Goi

| Usar **Context** | Usar **Zustand** (`stores/`) |
|----------------|------------------------------|
| Auth, sesión, biometría | Prefs del feed (beam, scope, mute, guardados) |
| Toasts y alertas modales | Social hub (badges, following, follow) |
| Handlers inyectados por pantalla (`FeedPostActionsContext`) | Prefs notificaciones, secciones colapsables del hub |
| Reanimated `SharedValue` (`FeedGoldBeamContext`) | Interacciones puntuales del feed (`useFeedInteractionStore`) |
| Timeline del feed, editor de post (`useFeed`, hooks locales) | — |

### Stores actuales

| Store | Contenido principal |
|-------|---------------------|
| `useFeedPrefsStore` | Beam, scope, mute, guardados, dismiss sugerencias |
| `useFeedInteractionStore` | Comentando / borrando / error por post (feed) |
| `useSocialHubStore` | Badges, hub lite, `followingIds`, follow optimista |
| `useNotificationPrefsStore` | Tipos de notificación ocultos en lista |
| `useSocialUiStore` | Secciones colapsadas del hub social |

### Patrones

**Selector fino** (preferido — menos re-renders):

```tsx
import { useSocialHubStore } from "../stores/useSocialHubStore";

const badge = useSocialHubStore((s) => s.pendingFollowRequests + s.unreadNotifications);
```

**Varios campos** — `useShallow` de `zustand/react/shallow` o selectores separados.

**Persistencia** — utils AsyncStorage + `hydrate()` en el store (no middleware `persist` para tokens; auth sigue en SecureStore).

**Optimistic UI** — `set()` inmediato; persistencia/API en `void (async () => { ... })()` con rollback en catch.

### Facades y hooks de hidratación

- **`SocialHubProvider`** (`context/SocialHubContext.tsx`) — solo hidrata `useSocialHubStore` al login; **no** hay `useSocialHub()`.
- **`useHydrateGoldBeamPref`** — hidrata `goldBeamEnabled` desde AsyncStorage al montar pantallas de prefs.
- Código nuevo: importar **`stores/`** directamente con selectores finos.

### Refresh al volver a una pantalla

Patrón unificado en **`hooks/useFocusStaleRefresh.ts`**: stale TTL, `hasData`, refresh forzado (p. ej. tras publicar), defer con `InteractionManager`.

Usado en: `useProfilePosts`, `useProfileStats`, `WorkoutsListScreen`, `SocialDiscoverScreen`, y el feed vía **`useFeedFocusEffects`** (aux 45 s + stories/discover).

Constantes feed: `FEED_STALE_MS` (30 s), `FEED_AUX_REFRESH_STALE_MS` (45 s) en `constants/feed.ts`.

### Interacciones de posts

**`hooks/usePostInteractions.ts`** centraliza like, comentar y borrar (optimista + guards). El feed lo expone vía `useFeedPostActions` → `FeedPostActionsContext`; perfil y detalle reutilizan el mismo hook.

### Media de publicaciones

**`utils/postMedia/`** — API única: `resolveUrl`, `sanitizeForFeed`, `hasDisplayableMedia`, `resolveImageSource`, `thumbnailUrl`. Los módulos antiguos (`postDisplayMedia.ts`, etc.) reexportan por compatibilidad.

Cuerpo training compartido: **`components/post/PostTrainingBody.tsx`** (feed + preview del editor).

## 6. Fluidez y rendimiento

Más allá de virtualizar listas y repartir estado, la app prioriza **respuesta instantánea** en interacciones frecuentes (like, guardar, follow, comentarios) y **scroll estable** en el feed.

### Principios aplicados

| Área | Enfoque |
|------|---------|
| **Listas** | FlashList + filas memoizadas; `extraData` mínimo; estado por fila vía Zustand cuando conviene |
| **Interacciones** | Updates optimistas; AsyncStorage/API en segundo plano |
| **Focus de tabs** | `useFocusStaleRefresh` — cache + refresh en background con TTL |
| **Animaciones** | Reanimated en hilo UI (beam, FAB); sin `LayoutAnimation` en listas |
| **Imágenes** | `expo-image` con cache y decode acotado en feed |

### Verificación

- Plan y fases: [`performance-fluidity.md`](./performance-fluidity.md)
- Checklist manual (Android/iOS): [`performance-fluidity-verification.md`](./performance-fluidity-verification.md)
- Automático local: `npm run verify` (Jest + typecheck) o `npm run verify:fluidity` (solo typecheck)

## 7. Arquitectura de capas (jun 2026)

Tras el refactor estructural, la app sigue esta separación:

| Capa | Responsabilidad | Ejemplos |
|------|-----------------|----------|
| `app/` | Rutas Expo Router, composición mínima | `(tabs)/index.tsx` |
| `components/` | UI por dominio, memo donde importa | `feed/FeedScreenContent`, `post/PostTrainingBody` |
| `hooks/` | Estado de pantalla, orquestación, efectos | `useFeed`, `usePostInteractions`, `useFocusStaleRefresh` |
| `stores/` | Prefs e identidad social compartidas | `useFeedPrefsStore`, `useSocialHubStore` |
| `context/` | Auth, UI imperativa, Reanimated, handlers inyectados | `AuthContext`, `FeedPostActionsContext` |
| `api/` + `utils/` | Red, normalización, lógica pura | `normalizePost`, `postMedia/`, `feedTimeline` |
| `__tests__/` | Regresión en lógica pura y stores | `feedTimeline.test.ts`, `useFeedPrefsStore.test.ts` |

Detalle del refactor: [`refactoring-suggestions.md`](./refactoring-suggestions.md).

## 8. Documentación relacionada

| Documento | Contenido |
|-----------|-----------|
| [`docs/README.md`](./README.md) | **Índice general** de toda la documentación del tutorial |
| [`ai-setup.md`](./ai-setup.md) | Configuración de IA (`.cursorrules`) |
| [`comparativa-ui-gluestack-vs-paper.md`](./comparativa-ui-gluestack-vs-paper.md) | Elección de Gluestack UI |
| [`flashlist-migration.md`](./flashlist-migration.md) | Plan FlashList (completado) |
| [`zustand-migration.md`](./zustand-migration.md) | Plan Zustand (completado) |
| [`refactoring-suggestions.md`](./refactoring-suggestions.md) | Refactor estructural (estado jun 2026) |
| [`performance-fluidity.md`](./performance-fluidity.md) | Plan de fluidez por fases |
| [`performance-fluidity-verification.md`](./performance-fluidity-verification.md) | Checklist manual de pruebas |
| [`flujo-subida-imagenes.md`](./flujo-subida-imagenes.md) | Subida avatar/banner/posts |

**Entregable teórico principal:** este archivo (`react-native-teoria.md`). Los demás son planes de trabajo y verificación que respaldan las decisiones descritas aquí.

