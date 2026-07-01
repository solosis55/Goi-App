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

Pulidos UX REV-001–003 cerrados. Pendiente opcional: REV-004.

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
