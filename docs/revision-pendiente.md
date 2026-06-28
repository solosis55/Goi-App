# Revisión pendiente — notas para más tarde

Documento informal para anotar cosas a **revisar, arreglar o modificar** cuando toque.  
No sustituye al [backlog de lanzamiento](./backlog-lanzamiento.md); aquí van detalles de UX, bugs y pulidos detectados en pruebas.

**Cómo usar**

- Añade ítems con fecha y plataforma (Web / App / Server).
- Marca `[x]` cuando esté resuelto y probado.
- Si un ítem pasa a ser bloqueante de lanzamiento, muévelo al backlog como P0.

**Última actualización:** mayo 2026

---

## Probado en prod (Web)

| Flujo | Estado | Notas |
|-------|--------|-------|
| Login | ✅ OK | [go-i.vercel.app](https://go-i.vercel.app) — mayo 2026 |
| Registro | ✅ OK (funcional) | Flujo completo; pulido UX pendiente → REV-001 |
| Verificación email | ✅ OK | Enlace del correo → cuenta activa → login — mayo 2026 |

Los ítems REV-001 y REV-003 siguen abiertos como **mejoras**, no bloquean el flujo core.

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

- [ ] **Plataforma:** App  
- [ ] **Detectado:** mayo 2026

**Problema:** Tras crear cuenta, **no llega el email de verificación**. Solo se envía si el usuario pulsa **Reenviar**.

**Objetivo:** El registro debe disparar el mismo envío que el reenvío (API `POST /auth/register` → email vía Resend, o confirmar que el server lo envía y la App no lo bloquea/skip).

**Revisar:** flujo en `app/register.tsx`, respuesta de registro en `api/auth.ts`, y server (`register` + `sendVerificationEmail`).

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

## Plantilla para nuevos ítems

```markdown
### REV-XXX · Título breve (P0|P1|P2)

- [ ] **Plataforma:** Web | App | Server  
- [ ] **Detectado:** fecha

**Problema:** …

**Objetivo:** …

**Notas / archivos:** …
```
