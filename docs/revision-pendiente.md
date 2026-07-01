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

Pulidos UX: REV-001, REV-003, REV-002 (email al registrar en App). Ver [revision-pendiente.md](./revision-pendiente.md).

---

## Auth y registro

### REV-001 · Web — Pantalla “email enviado” tras registro (P1)

- [ ] **Plataforma:** Web  
- [ ] **Detectado:** mayo 2026 (prueba registro vía web)

**Problema:** Al registrarse, la UI se queda en estado de **carga** hasta que aparece el mensaje de verificar correo. No hay feedback intermedio claro.

**Objetivo:** Igual que en App — mostrar de inmediato una pantalla dedicada de “hemos enviado un enlace a tu correo”, con el email indicado y botón/opción de **reenviar verificación**.

**Referencia App:** `app/register.tsx` (estado `verifyPendingEmail`, bloque de reenvío).

---

### REV-002 · App — El correo no se envía al registrarse (P0)

- [x] **Plataforma:** App + Web + Server  
- [x] **Detectado:** mayo 2026 · **Cerrado:** mayo 2026

**Problema:** Tras crear cuenta en App, no llegaba el email; solo al pulsar Reenviar.

**Causa:** Dos caminos distintos (register enviaba en server; reenvío otro). Unificado: `POST /auth/register` solo crea la cuenta; Web y App llaman `POST /auth/resend-verification` inmediatamente después (mismo flujo que el botón Reenviar).

---

### REV-003 · Paridad login vs registro — orden de pantallas (P1)

- [ ] **Plataforma:** Web + App  
- [ ] **Detectado:** mayo 2026

**Problema:** En **Web** la pantalla de auth empieza en **crear cuenta** y el enlace “ya tengo cuenta” es secundario. En **App** empieza en **iniciar sesión** y el registro es secundario.

**Objetivo:** Unificar — **login primero**, registro como acción secundaria (como en App).

**Archivos probables:** Web `src/pages/AuthPage.tsx` (vista por defecto `register` → `login`); App ya OK en `app/login.tsx`.

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
