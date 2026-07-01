# Paridad auth Web ↔ App (ítem backlog 1.14)

Revisión de tipos TypeScript y mensajes de error **solo para flujos de autenticación Fase 1** (registro, login, verify, forgot, reset, legales).

**Fecha revisión:** mayo 2026 · **Estado:** revisado; diferencias marcadas como *intencionadas* o *pendiente*.

Documentación de emails y enlaces: [Goi Server/docs/auth-emails-y-enlaces.md](../../Goi%20Server/docs/auth-emails-y-enlaces.md)

---

## 1. Tipos de entrada/salida (auth) — alineados

| Tipo | Web | App | Estado |
|------|-----|-----|--------|
| `RegisterInput` | `username`, `email`, `password` | Igual | ✅ Igual |
| `LoginInput` | `email`, `password` | Igual | ✅ Igual |
| `ResetPasswordInput` | `token`, `password` | Igual | ✅ Igual |
| `AuthResponse` | `message`, `user`, `token?` | Igual | ✅ Igual |
| `RegisterResponse` | + `requiresEmailVerification?`, `devVerificationToken?` | Igual | ✅ Igual |
| `ResendVerificationResponse` | `message`, `devVerificationToken?` | Igual | ✅ Igual |
| `VerifyEmailResponse` | `message` | Igual | ✅ Igual |
| `ForgotPasswordResponse` | `message`, `devResetToken?` (+ JSDoc dev) | `message`, `devResetToken?` | ✅ Igual (App sin comentario JSDoc; opcional) |

**Conclusión:** contratos Fase 1 de request/response están **alineados**.

---

## 2. `SafeUser` y perfil — diferencias intencionadas

La **App** modela el perfil completo del server; la **Web** usa un subconjunto hasta Fase 3 (perfil privado, secciones, etc.).

| Campo / tipo | Web | App | Decisión |
|--------------|-----|-----|----------|
| `profileVisibility` | `"public" \| "followers"` | `ProfileVisibilityMode` (+ `private`, `request`) | ⏳ Web ampliar en Fase 3 |
| `profileSections` | — | `ProfileSectionSettings` | ⏳ Solo App (ajustes perfil) |
| `discoverable`, `requireAuthToView`, `defaultPostVisibility` | — | Sí | ⏳ Solo App |
| `hasGeoLocation` | — | `?` | ⏳ Solo App |
| `ProfileUser.profileUnavailable` | — | `?` | ⏳ Solo App |
| Resto (bio, avatar, urls, etc.) | Sí | Sí | ✅ Compatible en runtime |

**Conclusión:** no igualar ahora; el server puede devolver más campos y la Web los ignora sin romper auth.

---

## 3. `UpdateProfileInput` — fuera de Fase 1 auth

App incluye `latitude`, `longitude`, `profileSections`, etc. Web solo campos básicos. **No bloquea** registro/login/verify/reset.

---

## 4. Códigos de error `AUTH_*` — mensajes en español

Archivos: `Goi Web/src/utils/errorMessages.ts` · `Goi App/utils/errorMessages.ts`

### Igualados (Fase 1) — mismo texto

| Código | Uso |
|--------|-----|
| `AUTH_INVALID_CREDENTIALS` | Login incorrecto |
| `AUTH_EMAIL_IN_USE` | Registro |
| `AUTH_USERNAME_IN_USE` | Registro |
| `AUTH_EMAIL_NOT_VERIFIED` | Login sin verify |
| `AUTH_VERIFY_TOKEN_INVALID` | Enlace verify caducado |
| `AUTH_VERIFY_INVALID_INPUT` | Verify mal formado |
| `AUTH_REGISTER_INVALID_INPUT` | Registro validación |
| `AUTH_LOGIN_INVALID_INPUT` | Login validación |
| `AUTH_UNAUTHORIZED` | 401 genérico |
| `AUTH_TOKEN_INVALID` | JWT inválido |
| `AUTH_SESSION_STALE` | Sesión desincronizada |
| `AUTH_FORBIDDEN` | Sin permiso |
| `AUTH_PROFILE_INVALID_INPUT` | Editar perfil |
| `AUTH_RATE_LIMITED` | Rate limit |
| `AUTH_FORGOT_PASSWORD_INVALID_INPUT` | Forgot |
| `AUTH_RESET_INVALID_INPUT` | Reset validación |
| `AUTH_RESET_TOKEN_INVALID` | Enlace reset caducado |
| `AUTH_USER_NOT_FOUND` | Usuario no existe |

### Mismo código, texto distinto (aceptable)

| Código | Web | App |
|--------|-----|-----|
| `AUTH_JWT_NOT_CONFIGURED` | Menciona Vercel | Menciona backend genérico |
| `API_NETWORK_ERROR` | Vite + Render | Expo + puerto 4000 |
| `API_INVALID_RESPONSE` | Más detalle deploy | Mensaje corto |

### En server pero sin entrada en clientes (no Fase 1)

Añadir si la UI los muestra al usuario:

| Código | Cuándo |
|--------|--------|
| `AUTH_HEADER_INVALID` | Request sin `Authorization` válido |
| `AUTH_CANNOT_FOLLOW_SELF` | Social |
| `AUTH_CANNOT_FOLLOW_PRIVATE` | Social |
| `AUTH_INVALID_INPUT` | Notification prefs, etc. |

---

## 5. Legales (ítem 1.12)

| | Web | App |
|--|-----|-----|
| Registro | Checkbox + enlaces `/privacidad`, `/aviso-legal` | `LegalConsentRow` → navegador (`legalUrls.ts`) |
| Ajustes / perfil | Enlaces en auth y ajustes | `ProfileAccountSection` → apartado Legal ✅ probado |

---

## 6. Acciones futuras (opcional, no bloquean Fase 1)

1. Copiar JSDoc de `devResetToken` de Web a App `ForgotPasswordResponse`.
2. Ampliar `SafeUser` en Web cuando entren perfiles privados (Fase 3).
3. Paquete compartido `@goi/types` (backlog P2).
4. Añadir `AUTH_HEADER_INVALID` a ambos `errorMessages` si hace falta en UI.

---

## 7. Checklist 1.14

- [x] Comparar `RegisterInput`, `LoginInput`, `AuthResponse`, `RegisterResponse`, verify, forgot, reset
- [x] Comparar mapa `AUTH_*` Fase 1
- [x] Documentar diferencias `SafeUser` / perfil como intencionadas
- [x] Enlazar doc de emails/enlaces (1.3 / 1.4)
