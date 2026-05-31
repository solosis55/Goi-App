# Verificación de fluidez (Fase 8)

Checklist manual y plantilla de métricas. Marcar **OK** / **KO** / **N/A** tras probar en dispositivo físico.

**Entorno recomendado**

| Rol | Dispositivo | Notas |
|-----|-------------|--------|
| Android | Gama media (p. ej. 4–6 GB RAM) | Perf Monitor ON (`d` en dev menu) |
| iOS | iPhone físico | Instruments opcional |
| Backend | Servidor local o staging | Feed con ≥10 posts variados |

**Antes de empezar**

1. `npx tsc --noEmit` en Goi App — debe pasar sin errores.
2. Cerrar apps en segundo plano; reiniciar Metro si acabas de cambiar de rama.
3. Beam dorado **activado** (Perfil → Privacidad → «Brillo dorado en el feed»).

---

## A. Feed (crítico)

| # | Acción | Criterio de éxito | Android | iOS |
|---|--------|-------------------|---------|-----|
| A1 | Scroll continuo 10 s (20+ posts) | Sin tirones visibles; FPS ≥ 50 en gama media | ☐ | ☐ |
| A2 | Scroll rápido + parar | Sin “saltos” de layout; posts no parpadean en blanco | ☐ | ☐ |
| A3 | Like en barra de acciones | Respuesta instantánea; filas vecinas no parpadean | ☐ | ☐ |
| A4 | Doble tap en imagen (like) | Corazón + like; scroll vertical no se bloquea | ☐ | ☐ |
| A5 | Abrir comentarios + escribir | Teclado OK; scroll del feed estable | ☐ | ☐ |
| A6 | Publicar comentario | Solo esa fila se actualiza; lista no “salta” al inicio | ☐ | ☐ |
| A7 | Tarjeta «Amplía tu círculo» | No parpadea al scrollear (visible estable entre posts) | ☐ | ☐ |
| A8 | Beam dorado (activado) | Brillo suave al scroll; sin parpadeo entre posts | ☐ | ☐ |
| A9 | Beam desactivado (toggle perfil) | Sin brillo; scroll igual de fluido o mejor | ☐ | ☐ |
| A10 | Cambiar scope Siguiendo / Para ti | Sin freeze > 300 ms al cambiar | ☐ | ☐ |
| A11 | Pull-to-refresh | Spinner + datos; scroll position razonable | ☐ | ☐ |

---

## B. PostCard y media

| # | Acción | Criterio | Android | iOS |
|---|--------|----------|---------|-----|
| B1 | Carrusel multi-foto horizontal | Swipe fluido; sin conflicto con scroll vertical | ☐ | ☐ |
| B2 | Post training (4:5) | Imagen carga; sin placeholder negro persistente | ☐ | ☐ |
| B3 | Abrir sesión inline (icono mancuerna) | Cambio caption ↔ sesión instantáneo (sin LayoutAnimation) | ☐ | ☐ |
| B4 | Lightbox desde imagen | Abre/cierra sin lag | ☐ | ☐ |

---

## C. Crear publicación

| # | Acción | Criterio | Android | iOS |
|---|--------|----------|---------|-----|
| C1 | Publicar post estándar con foto | Toast + navegación al feed tras animaciones del editor | ☐ | ☐ |
| C2 | Feed tras publicar | Nuevo post arriba; scroll to top suave | ☐ | ☐ |
| C3 | Publicar training vinculado a sesión | Preview OK; feed muestra formato training | ☐ | ☐ |

---

## D. Social y Discover

| # | Acción | Criterio | Android | iOS |
|---|--------|----------|---------|-----|
| D1 | Hub Social scroll | Secciones cargan; pull-to-refresh OK | ☐ | ☐ |
| D2 | Discover lista larga | Scroll virtualizado; follow en una fila no re-renderiza todas | ☐ | ☐ |
| D3 | Volver a Discover con datos | Sin skeleton flash completo | ☐ | ☐ |
| D4 | Notificaciones: filtrar + marcar leída | Sin lag al cambiar chip; filas estables | ☐ | ☐ |
| D5 | Badge tab Social | Actualiza sin lag al marcar notif / solicitud | ☐ | ☐ |
| D6 | Follow en Discover | Optimista al toque; hub coherente | ☐ | ☐ |
| D7 | Chips ocultar like/comment/follow | Cambio al instante; persisten al salir/volver | ☐ | ☐ |
| D8 | Colapsar sección en Hub | Toggle instantáneo; recuerda al volver | ☐ | ☐ |

---

## E. Perfil

| # | Acción | Criterio | Android | iOS |
|---|--------|----------|---------|-----|
| E1 | Perfil propio: tabs + scroll | Sticky tab bar OK | ☐ | ☐ |
| E2 | Perfil ajeno: scroll | Sticky header mini no parpadea al cruzar umbral | ☐ | ☐ |
| E3 | Detalle post desde grid perfil | Scroll + taps OK (scroll guard) | ☐ | ☐ |
| E4 | Toggle beam en privacidad | Efecto visible al volver al feed | ☐ | ☐ |
| E5 | Guardar post en perfil | Icono cambia al instante | ☐ | ☐ |

---

## F. Entreno en curso

| # | Acción | Criterio | Android | iOS |
|---|--------|----------|---------|-----|
| F1 | Iniciar descanso entre series | Sin LayoutAnimation en pantalla principal perform | ☐ | ☐ |
| F2 | Expandir ejercicio (card sesión) | LayoutAnimation local OK (pantalla aislada) | ☐ | ☐ |
| F3 | Volver al feed con entreno activo | Sin regresión de scroll | ☐ | ☐ |

---

## G. Red / segundo plano

| # | Acción | Criterio | Android | iOS |
|---|--------|----------|---------|-----|
| G1 | App 2 min en feed sin tocar | Sin peticiones visibles en red cada pocos s (badge ~90–180 s) | ☐ | ☐ |
| G2 | Cambiar tab y volver a Social | Badge/hub refresca sin doble spinner | ☐ | ☐ |
| G3 | Cambiar Feed ↔ Social ↔ Rutinas ↔ Perfil | Sin freeze ni spinner innecesario | ☐ | ☐ |

---

## Plantilla baseline (comparar antes/después)

Rellenar **una vez** como referencia; repetir tras cambios grandes.

| Métrica | Cómo medir | Valor baseline | Valor actual | Δ |
|---------|------------|----------------|--------------|---|
| FPS scroll feed 5 s | Perf Monitor / Profiler | | | |
| Re-renders al like (1 post) | React DevTools Profiler | | | |
| Re-renders al comentar | Profiler, fila activa | | | |
| Tiempo publicar → feed visible | Cronómetro | | | |
| Memoria JS tras 2 min scroll | Dev menu | | | |

**Notas de sesión**

- Fecha:
- Build / commit:
- Dispositivo Android:
- Dispositivo iOS:
- Observaciones:

---

## Comprobaciones automatizadas (CI local)

```bash
cd "Goi App"
npm run verify:fluidity
```

Incluye typecheck (`tsc --noEmit`). No sustituye prueba en dispositivo.

---

## G. FlashList (listas migradas)

Probar scroll en cada pantalla tras la migración (`docs/flashlist-migration.md`). Criterio común: scroll 5 s sin tirones; pull-to-refresh y paginación OK.

| # | Pantalla | Criterio | Android | iOS |
|---|----------|----------|---------|-----|
| G1 | Feed | Igual que A1–A11; beam y deep link a post | ☐ | ☐ |
| G2 | Social → Descubrir | Búsqueda, follow, cargar más | ☐ | ☐ |
| G3 | Perfil → seguidores/siguiendo | Paginación, toggle follow | ☐ | ☐ |
| G4 | Rutinas (lista) | Búsqueda, refresh, FAB | ☐ | ☐ |
| G5 | Notificaciones | Filtros, marcar leída, solicitudes | ☐ | ☐ |
| G6 | Catálogo ejercicios | Filtros músculo/material, añadir movimiento | ☐ | ☐ |

---

## H. Zustand (stores migrados)

Verificar persistencia y coherencia tras la migración (`docs/zustand-migration.md`).

| # | Acción | Criterio | Android | iOS |
|---|--------|----------|---------|-----|
| H1 | Toggle beam (Perfil → Privacidad) | Persiste al reiniciar app; feed refleja pref | ☐ | ☐ |
| H2 | Cambiar scope Siguiendo / Para ti | Persiste al salir y volver al feed | ☐ | ☐ |
| H3 | Guardar + silenciar en feed | Guardados y mute coherentes en perfil/feed | ☐ | ☐ |
| H4 | Follow en Discover | `followingIds` OK en feed y sugerencias | ☐ | ☐ |
| H5 | Badge tab Social | Contador coherente tras follow request / notif | ☐ | ☐ |
| H6 | Chips prefs notificaciones | Ocultar tipo → lista filtra al instante | ☐ | ☐ |
| H7 | Colapsar sección hub | Estado recuerda tras cambiar tab | ☐ | ☐ |

---

## Regresiones conocidas / aceptadas

- `getItemLayout` no aplicable: alturas de post variables (FlashList v2 auto-mide).
- Headers de sección: **catálogo** usa chip flotante de grupo muscular; **notificaciones** y **feed** scroll normal.
- `ProfileScreen`: `removeClippedSubviews={false}` por sticky tabs + grid (celdas memoizadas).
- Posts legacy con data URL en imagen: se muestran; nuevos deben usar URL HTTP.
- `SessionPerformExerciseCard`: `LayoutAnimation` permitido (pantalla aislada, no lista).
- `SocialHubContext` → estado en `useSocialHubStore`; provider solo hidrata al login.

## Optimizaciones de fluidez (may 2026)

- Feed: prefs locales con stale 60 s; focus sin bloquear en `refreshFollowing`; `extraData` sin comentarios/delete; interacciones por fila vía `useFeedInteractionStore`; scroll FAB throttled.
- Social: tab sin `force` en hub/badge; Discover stale 45 s; follow optimista en listas.
- Perfil: guardar vía Zustand optimista; focus posts stale 30 s; grid memo por celda.
- Notificaciones: mark-read optimista; `extraData` sin `unreadCount`.
- Rutinas: focus stale 30 s; historial sesiones en FlashList; `WorkoutRow` / `ExerciseCatalogRow` memo.
- Crear post: procesado de imágenes tras `InteractionManager.runAfterInteractions`.
- Zustand Fase 3: `useSocialHubStore` (badges, hub, follow); tab bar con selector fino.
- Zustand Fase 4: `useNotificationPrefsStore`, `useSocialUiStore` (chips notif + secciones hub).

---

## Sign-off

| Revisor | Fecha | Android OK | iOS OK |
|---------|-------|------------|--------|
| | | ☐ | ☐ |
