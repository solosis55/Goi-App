# Revisión pendiente — notas para más tarde

Documento informal para anotar cosas a **revisar, arreglar o modificar** cuando toque.  
No sustituye al [backlog de lanzamiento](./backlog-lanzamiento.md); aquí van detalles de UX, bugs y pulidos detectados en pruebas.

**Cómo usar**

- Añade ítems con fecha y plataforma (Web / App / Server).
- Marca `[x]` cuando esté resuelto y probado.
- Si un ítem pasa a ser bloqueante de lanzamiento, muévelo al backlog como P0.

**Última actualización:** mayo 2026

---

## Probado en prod (Web + App)

| Flujo | Web | App |
|-------|-----|-----|
| Login | ✅ | ✅ |
| Registro + validaciones | ✅ | ✅ |
| Verificación email | ✅ | ✅ |
| Forgot + correo | ✅ | ✅ |
| Reset contraseña | ✅ | ✅ |
| Legales (1.12) | ✅ registro | ✅ apartado Legal en perfil |

Pulidos UX REV-001–003 cerrados. **Fase 2 feed/posts cerrada** (mayo 2026). Siguiente: **REV-006/007** (UI publicaciones, editor, formatos imagen) y Fase 3 social.

---

## Auth y registro

### REV-001 · Web — Pantalla “email enviado” tras registro (P1)

- [x] **Plataforma:** Web  
- [x] **Detectado:** mayo 2026 · **Cerrado:** mayo 2026

**Problema:** Al registrarse, la UI se quedaba en estado de **carga** en el formulario hasta terminar register + resend.

**Fix:** Tras crear la cuenta, cambio inmediato a `verify-pending` con «Enviando correo…» y reenvío en segundo plano (como App).

---

### REV-003 · Paridad login vs registro — orden de pantallas (P1)

- [x] **Plataforma:** Web  
- [x] **Detectado:** mayo 2026 · **Cerrado:** mayo 2026

**Problema:** Web empezaba en **crear cuenta**; App en **iniciar sesión**.

**Fix:** Vista por defecto `login`; enlace secundario «¿No tienes cuenta? Crear cuenta».

---

### REV-002 · App — El correo no se envía al registrarse (P0)

- [x] **Plataforma:** App + Web + Server  
- [x] **Detectado:** mayo 2026 · **Cerrado:** mayo 2026

**Problema:** Tras crear cuenta en App, no llegaba el email; solo al pulsar Reenviar.

**Causa:** Dos caminos distintos (register enviaba en server; reenvío otro). Unificado: `POST /auth/register` solo crea la cuenta; Web y App llaman `POST /auth/resend-verification` inmediatamente después (mismo flujo que el botón Reenviar).

---

### REV-004 · Bienvenida tras verificar cuenta (P2 — opcional)

- [ ] **Plataforma:** Web + App (y/o Server)  
- [ ] **Detectado:** mayo 2026

**Idea:** Al entrar por primera vez tras verificar el email, mostrar algo que confirme que la cuenta está activa — mensaje de “cuenta verificada”, toast, o pantalla breve de **bienvenida** antes del feed.

**Opciones a valorar:**

- Tras clic en enlace del correo → pantalla “¡Listo! Tu cuenta está activa” (Web ya tiene `verify-confirmed`; pulir copy y transición al login/feed).
- Tras primer login post-verificación → banner o modal de bienvenida (una sola vez, flag en localStorage / perfil).
- Push in-app mínimo: “Bienvenido a Goi” en el feed la primera vez.

**Prioridad baja** — no bloquea Fase 1, pero mejora onboarding.

---

## Publicaciones y feed (Fase 2)

> Paridad funcional de **post estándar** en marcha (Web: preview tipo feed, foto obligatoria, multipart).  
> **Training** y verificación cruzada Web ↔ App siguen en [paridad-checklist.md](./paridad-checklist.md) §2.3–2.4.  
> Aquí: pulido visual y herramientas de edición de media — no bloquean cerrar checklist, pero conviene antes de lanzamiento.

### REV-006 · Publicaciones — retoque UI y diseño (Web + App) (P2)

- [ ] **Plataforma:** Web + App  
- [ ] **Detectado:** mayo 2026

**Contexto:** La lógica de crear/ver posts estándar va alineada; el aspecto y la ergonomía del flujo aún no están al nivel de producto final.

**Web — áreas a pulir:**

- Composer: layout preview + panel lateral (desktop) / modal (móvil); jerarquía visual, espaciado y estados vacíos.
- Vista previa feed (`PostFeedPreviewStandard`): coherencia con tarjeta real del timeline (tipografía, badges, acciones atenuadas).
- Galería en feed: carrusel hero, lightbox (cierre con × / tap — mejora reciente), miniaturas en composer.
- **Formatos y ratios de imagen en publicaciones:** que las fotos se vean correctamente en feed, preview y lightbox (hero estándar vs inset training, recorte/subida, `object-fit`, alturas máximas, carrusel multi-foto sin deformar ni recortar de más).
- Panel de fotos del composer: controles (añadir, recortar, portada, reordenar) más compactos y claros en móvil.
- Mensajes de validación, progreso de subida y errores de media (404 tras deploy en Render — ver PAR-C en checklist).

**App — áreas a pulir:**

- `CreatePostScreen` + previews (`PostFeedPreviewStandard` / `Training`): alinear ritmo visual con Web donde tenga sentido.
- Chooser de formato, chips de requisitos y toolbar del editor: menos ruido, mejor en pantallas pequeñas.
- Tarjeta en feed (`PostCard`, training body): espaciado, jerarquía foto → acciones → caption.
- **Formatos de imagen en feed:** ratios coherentes entre preview del composer y tarjeta publicada (estándar hero, training inset); sin saltos de layout al cargar media.
- Lightbox y carrusel: paridad de gestos y controles con Web.

**Objetivo:** Misma sensación de “publicación” en ambos clientes sin rehacer la lógica ya acordada (estándar vs training).

**Notas / archivos:**

- Web: `CreatePostForm.tsx`, `PostFeedPreviewStandard.tsx`, `PostMediaGallery.tsx`, `PostMediaLightbox.tsx`, `FeedPage.tsx`
- App: `CreatePostScreen.tsx`, `components/post/preview/*`, `PostCard.tsx`, `PostMediaCarousel.tsx`

---

### REV-007 · Editor de imágenes (y vídeo) en publicaciones (P2)

- [ ] **Plataforma:** Web + App  
- [ ] **Detectado:** mayo 2026

**Contexto:** Hoy la edición de media es mínima. Conviene unificar criterios y subir calidad antes de abrir vídeo en posts.

**Estado actual:**

- **Web:** `SquareImageCropEditor` — recorte cuadrado, zoom, pan, volteo, filtros preset; usado al crear post e historias. Panel aparte del preview en desktop.
- **App:** toggle **1:1 / Orig.** por foto en `CreatePostEditPanel`; compresión y orden de galería; sin editor gráfico completo.
- **Vídeo en posts:** no soportado aún en tipos/API; solo imágenes en feed.

**Objetivo / ideas a valorar:**

- Recorte: presets **1:1**, **4:5**, **16:9** y “original”; preview en tiempo real en el mismo marco que el feed.
- **Render en publicaciones:** al publicar, conservar el ratio elegido; en feed aplicar el layout correcto por formato (estándar full-bleed, training inset) sin letterboxing raro ni recortes imprevistos.
- Rotación, brillo/contraste básicos o filtros alineados entre Web y App (evitar sets distintos).
- Reordenar, portada y eliminar con feedback táctil claro (App) y atajos en desktop (Web).
- Flujo móvil Web: editor a pantalla completa con **Volver** explícito (como lightbox).
- **Vídeo (fase posterior):** duración máxima, trim, poster frame, compresión antes de multipart; definir si entra en estándar, training o ambos.
- Historias: reutilizar el mismo núcleo de editor si es posible (`CreateStoryModal` Web).

**Notas / archivos:**

- Web: `SquareImageCropEditor.tsx`, `CreatePostForm.tsx`, `PostMediaGallery.tsx`, `PostMediaLightbox.tsx`, `utils/postImages.ts`, `utils/trainingFeedMediaLayout.ts`
- App: `CreatePostEditPanel.tsx`, `hooks/useCreatePostForm.ts`, utilidades de compresión/recorte de imagen

---

### REV-005 · Web local — forgot sin correo (API local sin Resend) (P1)

- [x] **Plataforma:** Web  
- [x] **Detectado:** mayo 2026

**Problema:** En `localhost:5173` con `VITE_API_URL=/api`, el proxy iba a Goi Server **local** sin `RESEND_API_KEY`. La API respondía OK pero **no enviaba email**. Expo Go usaba Render → sí llegaba.

**Fix:** `.env.development` apunta a Render por defecto; aviso en consola si API es local.

---

```markdown
### REV-XXX · Título breve (P0|P1|P2)

- [ ] **Plataforma:** Web | App | Server  
- [ ] **Detectado:** fecha

**Problema:** …

**Objetivo:** …

**Notas / archivos:** …
```
