# Paridad Web ↔ App — producto lanzable

Matriz de **qué igualar**, **qué dejar solo en una plataforma** y **en qué fase** del [backlog de lanzamiento](./backlog-lanzamiento.md).

**Principio rector:** mismo usuario, misma API, mismo resultado en los flujos acordados. No hace falta paridad visual ni clonar cada pantalla.

**Última actualización:** mayo 2026

**Checklist manual:** [paridad-checklist.md](./paridad-checklist.md) — marcar ítems probados Web/App.

---

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| **P0** | Obligatorio para cerrar la fase |
| **P1** | Importante antes de beta amplia |
| **P2** | Post-lanzamiento / pulido |
| **Solo App** | No se implementa en Web en v1 (documentado) |
| **Solo Web** | No se implementa en App en v1 (documentado) |
| **✅** | Hecho y probado |
| **⏳** | Pendiente |
| **—** | Fuera de alcance v1 |

---

## Decisiones del producto (mayo 2026)

Estas líneas las fijamos como guía de paridad:

1. **Mismo usuario, misma API, mismo resultado** en cada fila marcada como paridad P0/P1.
2. **Hub social en Web** — llevar a Web lo que App ya tiene vía `GET /auth/social/hub` (y relacionados).
3. **Actualizaciones de training en Web** — posts/eventos de entrenamiento visibles y creables en Web (paridad con App `format: training` + `sessionId`).
4. **Creación de publicaciones y contenido en Web** — multipart desde archivos del ordenador (fotos; vídeos más adelante). App sigue con cámara/galería.
5. **Estadísticas Web → App** — llevar el apartado de estadísticas de Web a la App.
6. **Temas de color Web → App** — paleta / tema claro-oscuro alineados con Web.
7. **Ajustes Web → App** — mismo núcleo de ajustes con diferencias de plataforma (comentar caso a caso).

**REV-004** (bienvenida post-verify): aplazado a cuando toquemos UI de onboarding.

---

## Decisiones Fase 2 (mayo 2026 — acordadas)

| # | Pregunta | Decisión |
|---|----------|----------|
| 1 | Alcance feed Web | **B** — P0 feed + posts estándar **+ post training** (2.8) en esta fase |
| 2 | Uploads prod (PAR-C) | **A** — Multipart Web ya; prod puede fallar hasta disco/S3 |
| 3 | Tipos `Post` (PAR-B) | **A** — Copia manual Web/App + checklist (ver abajo) |
| 4 | Social hub Web | **A** — Fase 3, después de feed/posts |
| 5 | Stats / tema / ajustes App | **A** — Después de feed + social |
| 6 | Pruebas | Tú revisas paridad según avance el código |
| 7 | Datos demo | **C** — Seed **solo local** (`db:seed-feed-demos`); no en Neon prod compartida |

### Pregunta 3 explicada (tipos `Post`)

Web y App tienen cada uno su `types/post.ts`. **Opción A (elegida):** mantener dos archivos y una checklist (PAR-B) para que coincidan. **Opción B:** un paquete npm `@goi/types` compartido (más setup; aplazado).

---

## 1. Auth y cuenta

| Flujo | App | Web | Paridad | Fase | Estado |
|-------|-----|-----|---------|------|--------|
| Registro + verify email | ✅ | ✅ | P0 | 1 | ✅ |
| Login / logout | ✅ | ✅ | P0 | 1 | ✅ |
| Forgot / reset | ✅ | ✅ | P0 | 1 | ✅ |
| Legales | ✅ perfil | ✅ registro | P0 | 1 | ✅ |
| Sesión expirada `AUTH_SESSION_STALE` | ✅ | ✅ | P0 | 1 | ✅ |
| Bienvenida post-verify (REV-004) | — | parcial | P2 | UI | ⏳ |

---

## 2. Feed y publicaciones

| Flujo | App | Web | Paridad | Fase | Estado |
|-------|-----|-----|---------|------|--------|
| Feed `scope=following\|all` vía API | ✅ | ✅ | **P0** | 2 | ✅ |
| Paginación cursor (`nextCursor`) | ✅ | ✅ | **P0** | 2 | ✅ |
| Crear post estándar (texto + fotos) | ✅ multipart | ✅ multipart | **P0** | 2 | ✅ |
| Fotos desde dispositivo | cámara/galería | archivos PC | **P0** | 2 | ✅ |
| Vídeos en posts | — | — | **P2** | post-v1 | — |
| Post training + `sessionId` | ✅ | ✅ | **P0** (decisión 3) | 2 | ✅ |
| Estándar + sesión vinculada | ✅ | ✅ | **P0** | 2 | ✅ |
| Editar publicación | ✅ | revisar | P1 | 2 | ⏳ |
| Like / comentar / eliminar | ✅ | ✅ | P0 | 2 | ✅ |
| Cola offline al publicar | ✅ | — | **Solo App** | — | ✅ |
| Hidratar media feed ligero | ✅ | ✅ | P1 | 2 | ✅ |

**Verificación:** mismo usuario publica foto en Web → visible en App feed (y al revés).

---

## 3. Social

| Flujo | App | Web | Paridad | Fase | Estado |
|-------|-----|-----|---------|------|--------|
| **Social hub** (`/auth/social/hub`) | ✅ tab Social | ❌ | **P0** (decisión 2) | 3 | ⏳ Web |
| Discover (`/auth/discover`) | ✅ | ⚠️ `GET /auth/users` | P0 | 3 | ⏳ Web |
| Follow / unfollow | ✅ | ✅ | P0 | 3 | ⏳ |
| Solicitudes follow (perfil privado) | ✅ | ❌ | P0 | 3 | ⏳ Web |
| Bloquear / lista bloqueados | ✅ | ❌ | P0 | 3 | ⏳ Web |
| Perfil público ajeno | ✅ | parcial | P0 | 3 | ⏳ |
| Notificaciones in-app + prefs | ✅ | parcial | P1 | 3 | ⏳ |
| Silenciar usuarios en feed | ✅ | revisar | P1 | 2–3 | ⏳ |

---

## 4. Entrenamientos y training en feed

| Flujo | App | Web | Paridad | Fase | Estado |
|-------|-----|-----|---------|------|--------|
| CRUD rutinas | ✅ | ✅ | P0 | 4 | ⏳ |
| Catálogo + ficha ejercicio | ✅ | ✅ | P0 | 4 | ⏳ |
| Registrar sesión | ✅ | ✅ | P0 | 4 | ⏳ |
| **Eventos / posts training en feed** | ✅ | ✅ | **P0** (decisión 3) | 2 | ✅ |
| Entrenar en vivo (`/entrenar`) | ✅ | — | **Solo App** | — | ✅ |
| Recordatorio local (notificaciones) | ✅ | — | **Solo App** | — | ✅ |
| Detalle sesión con snapshot | ✅ | parcial | P1 | 4 | ⏳ |

---

## 5. Estadísticas (decisión 5)

| Flujo | App | Web | Paridad | Fase | Estado |
|-------|-----|-----|---------|------|--------|
| Estadísticas personales / cuerpo | — | ✅ `StatisticsPage` | **P1** App ← Web | 4–5 | ⏳ |
| Octágono / pentágono muscular | — | ✅ | **P1** | 4–5 | ⏳ |
| Sparklines / racha en perfil | parcial API | ✅ | P1 | 4 | ⏳ |

---

## 6. Tema y ajustes (decisiones 6–7)

| Flujo | App | Web | Paridad | Fase | Estado |
|-------|-----|-----|---------|------|--------|
| Tema claro / oscuro / sistema | parcial | ✅ | **P1** App ← Web | 5–6 | ⏳ |
| Paleta Goi (gold, fondos) | ✅ propia | ✅ | **P1** alinear tokens | 5–6 | ⏳ |
| **Ajustes de cuenta y privacidad** | ✅ extenso | ✅ | **P1** App ← Web (con difs.) | 5–6 | ⏳ |
| Biométrico / unlock | ✅ | — | **Solo App** | — | ✅ |
| Legal / aviso / privacidad | ✅ | ✅ rutas | P0 | 1 | ✅ |

**Diferencias de ajustes a documentar** (rellenar al implementar):

- [ ] Notificaciones push vs solo in-app  
- [ ] Ubicación / geo (permisos nativos en App)  
- [ ] Exportar datos / borrar cuenta  
- [ ] Haptics y feedback táctil (solo App)

---

## 7. Historias

| Flujo | App | Web | Paridad | Fase | Estado |
|-------|-----|-----|---------|------|--------|
| Crear / ver historias en feed | ✅ | parcial | P1 | 5 | ⏳ |
| Upload sin dataUrl gigante | revisar | revisar | P1 | 5 | ⏳ |

---

## 8. Infra y medios (transversal)

| Tema | Notas | Prioridad |
|------|-------|-----------|
| Uploads prod Render (`/tmp`) | Fotos pueden no persistir en prod hasta disco/S3 | P0 |
| Resend sandbox | Solo email cuenta Resend hasta dominio verificado | P1 |
| Tipos `Post` compartidos | Checklist manual vs `@goi/types` npm | P1 |
| Express legacy `Goi Web/server` | No usar en prod | P0 doc |

---

## Solo App (v1 — no igualar en Web)

- Entrenamiento en vivo con temporizador y guía bloque a bloque  
- Cola de publicación offline  
- Biométrico al login  
- Haptics y FAB/scroll nativos del feed  
- Recordatorios locales (expo-notifications)  
- Deep links `goi://` y share sheets nativos  

---

## Solo Web (v1 — no igualar en App)

- Layout escritorio ancho (sidebar, paneles)  
- Roadmap / vistas de documentación internas en web  
- Arrastrar y soltar en editor de rutinas (si existe)  
- Atajos de teclado  

*(Estadísticas y ajustes pasan a paridad App ← Web según decisiones 5–7.)*

---

## Orden sugerido de trabajo

| Orden | Bloque | Ítems backlog |
|-------|--------|----------------|
| 1 | Feed Web P0 | 2.4–2.7, verificación cruzada |
| 2 | Social hub Web | 3.2–3.7, decisión 2 |
| 3 | Training en Web | 2.8, 4.4, decisión 3 |
| 4 | Estadísticas en App | decisión 5 |
| 5 | Tema + ajustes App | decisiones 6–7 |
| 6 | Historias + vídeo | P1/P2 |

---

## Ítems de trabajo acordados (paridad + calidad)

Además de las tablas por flujo, estos puntos forman parte del plan (sin dominio Resend — ver infra aparte).

| ID | Ítem | Prioridad | Fase | Estado |
|----|------|-----------|------|--------|
| **PAR-A** | Checklist de **regresión App** tras cada cambio en Server/Web | P0 proceso | 2+ | ⏳ [checklist](./paridad-checklist.md#27-regresión-app-feed-par-a) |
| **PAR-B** | Unificar **`types/post.ts`** y normalización antes de multipart Web | P0 | 2 | ⏳ |
| **PAR-C** | **Uploads prod** Render (`0.2`): disco persistente o S3 antes de cerrar fotos en prod | P0 | 0–2 | ⏳ |
| **PAR-E** | **Perfil privado + solicitudes** en Web junto al hub social | P0 | 3 | ⏳ |
| **PAR-F** | **Deep links** verify/reset/forgot alineados (revisar al tocar ajustes) | P1 | 2–6 | ⏳ |
| **PAR-G** | **Menciones @usuario** en crear post Web (si App las expone) | P1 | 2 | ⏳ |
| **PAR-H** | **Visibilidad de post** (público/seguidores/privado) en Web | P1 | 2–3 | ⏳ |
| **PAR-I** | **Moderación / reportar** — misma API, UX mínima en ambos | P1 | 3 | ⏳ |
| **PAR-J** | Flag **primera sesión** para REV-004 (bienvenida) cuando toque UI | P2 | UI | ⏳ |

---

## Sugerencias adicionales (referencia)

| # | Sugerencia | En plan |
|---|------------|---------|
| A | Checklist regresión App | **PAR-A** |
| B | Unificar `types/post.ts` | **PAR-B** |
| C | Uploads prod (0.2) | **PAR-C** |
| D | Dominio Resend | *fuera de paridad UI* |
| E | Perfil privado + solicitudes | **PAR-E** |
| F | Deep links auth | **PAR-F** |
| G | Menciones @usuario | **PAR-G** |
| H | Visibilidad de post | **PAR-H** |
| I | Moderación / reportar | **PAR-I** |
| J | Flag primera sesión (REV-004) | **PAR-J** |

---

## Referencias

- [backlog-lanzamiento.md](./backlog-lanzamiento.md) — fases 0–6  
- [paridad-checklist.md](./paridad-checklist.md) — **checklist manual de pruebas**  
- [auth-paridad-web-app.md](./auth-paridad-web-app.md) — auth Fase 1  
- [revision-pendiente.md](./revision-pendiente.md) — pulidos UX  
- [Goi Server/docs/auth-emails-y-enlaces.md](../../Goi%20Server/docs/auth-emails-y-enlaces.md)  
- Imágenes posts: `docs/flujo-subida-imagenes.md` (si existe en App)

---

## Plantilla para nuevas filas

```markdown
| Flujo | App | Web | Paridad | Fase | Estado |
| Descripción | ✅/❌/parcial | ✅/❌/parcial | P0/P1/Solo App/Solo Web | 2–6 | ⏳ |
```
