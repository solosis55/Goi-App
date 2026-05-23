# Goi App (Expo)

Cliente móvil/web ligero contra la misma API que **Goi Web** (`/api/...`).

## Variable de entorno `EXPO_PUBLIC_API_URL`

Expo solo inyecta variables cuyo nombre empieza por `EXPO_PUBLIC_`. La URL debe incluir el prefijo **`/api`** (igual que `VITE_API_URL` en la web).

| Entorno | Ejemplo |
|--------|---------|
| Web / iOS simulador / Android emulador con backend en tu PC | `http://127.0.0.1:4000/api` (en Android emulador, si no defines nada, la app usa por defecto `http://10.0.2.2:4000/api`) |
| Dispositivo físico en la misma Wi‑Fi que el PC | `http://192.168.x.x:4000/api` (IP local del ordenador donde corre el servidor) |
| Producción | `https://tu-dominio.com/api` |

1. Copia `.env.example` a `.env` en esta carpeta.
2. Ajusta `EXPO_PUBLIC_API_URL` y reinicia Metro (`npx expo start`) para que cargue el cambio.

Si la URL es incorrecta verás errores de red o **404** en el feed; el mensaje indica revisar esta variable y que el backend esté en marcha.

## Scripts

- `npm run start` / `npm run start:qr` — Metro en modo **LAN** (QR con `exp://192.168.x.x:8081` para el móvil)
- `npm run start:localhost` — igual, pero pensado para **emulador Android** (redirige el puerto 8081 al PC; evita quedarse en la pantalla blanca de Expo Go)
- `npm run android:localhost` — arranca Metro en modo localhost y abre el emulador
- `npm run android` / `npm run ios` / `npm run web`

### Emulador Android: pantalla blanca con spinner azul

Eso es **Expo Go esperando el bundle**, no la pantalla de inicio de Goi (la nuestra es fondo negro y spinner dorado).

Metro suele publicar `exp://192.168.x.x:8081`; el emulador a veces **no llega** a esa IP. Solución:

1. Para el servidor (`Ctrl+C`).
2. En la carpeta Goi App: `npm run start:localhost` (o `npm run android:localhost`).
3. Pulsa **`a`** o recarga en Expo Go.

Si sigue igual: `npm run start:localhost:clear`. Comprueba en la terminal que aparezca algo como `Android Bundled …` al abrir la app.

**Firewall de Windows:** permite Node.js en redes privadas (puerto **8081**).

Alternativa: `npx expo start --tunnel` (más lento, pero evita problemas de red local).

### Expo Go solo con QR (Wi‑Fi, sin USB ni túnel)

El QR debe apuntar a **`exp://192.168.x.x:8081`** (IP de tu PC), **no** a `127.0.0.1` ni `localhost`.

1. **No uses** `npm run start:localhost` ni `start:usb` si quieres QR en el móvil.
2. **Firewall (una vez):** PowerShell **como Administrador** en la carpeta Goi App:
   ```powershell
   .\scripts\open-firewall-expo.ps1
   ```
3. **Red privada:** Windows → Wi‑Fi → tu red → perfil **Privado** (no Público).
4. **Misma Wi‑Fi** en PC y móvil; **datos móviles apagados** en el teléfono; **sin VPN**.
5. Arranca Metro:
   ```bash
   npm run start:qr
   ```
6. Comprueba en el **navegador del móvil**: `http://LA_IP_QUE_SALE_EN_TERMINAL:8081` (ej. `http://192.168.1.31:8081`). Si no carga, el QR tampoco funcionará → revisa firewall o router (aislamiento AP).
7. Escanea el QR con **Expo Go** (no con la cámara sola en Android).
8. Crea `.env` con la **misma IP** para la API:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.31:4000/api
   ```
   (cambia la IP; la ves con `ipconfig` → IPv4 o en la línea `Metro waiting on exp://...`)
9. Reinicia Metro tras editar `.env`. Backend Goi Web en puerto **4000**.

### Expo Go: `java.io.IOException: failed to download remote update`

El móvil **no puede descargar el JavaScript** desde Metro en tu PC (`exp://192.168.x.x:8081`). Casi siempre es **firewall** o Wi‑Fi que no deja hablar entre dispositivos (sigue los pasos del apartado «solo con QR» arriba).

**Túnel (`npm run start:tunnel`):** a veces falla en Windows con `failed to start tunnel` / `session closed` (ngrok bloqueado o caído). Si te pasa, usa **USB** o **Wi‑Fi + firewall** abajo. `@expo/ngrok` ya está en `devDependencies` por si el túnel vuelve a funcionar otro día.

**Opción A — USB (Android, muy fiable si el túnel falla):**

1. Activa **depuración USB** en el móvil y conéctalo al PC.
2. En Goi App (terminal 1):

```bash
npm run adb:reverse
npm run start:usb
```

3. En **Expo Go** → *Enter URL manually* → `exp://127.0.0.1:8081`
4. En `.env` (API por el mismo túnel USB):

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:4000/api
```

5. Backend Goi Web en marcha en el puerto **4000**.

**Opción B — Wi‑Fi local (`npm start`):**

**Otras opciones:**

1. **Firewall Windows:** permite **Node.js** en red privada; puerto **8081** entrante.
2. **Misma Wi‑Fi** real (no datos móviles); desactiva VPN en PC y móvil.
3. **Router:** desactiva «aislamiento de clientes» / AP isolation si existe.
4. **USB (Android):** depuración USB + `adb reverse tcp:8081 tcp:8081`, luego `npm run start:localhost` y en Expo Go abre `exp://127.0.0.1:8081`.

### Expo Go en el móvil: «Something went wrong»

Ese mensaje es genérico: la app **no pudo cargar el bundle** o hubo un **error de JavaScript** al arrancar.

1. **Misma red y `npm start`** (no `start:localhost`) — el QR debe ser `exp://192.168.x.x:8081`, no `127.0.0.1`.
2. **Expo Go actualizado** en la Play Store / App Store (el proyecto usa **Expo SDK 54**; una Expo Go antigua falla al abrir).
3. **Caché limpia:** para Metro (`Ctrl+C`), luego `npm run start:clear`, vuelve a escanear el QR.
4. **Ver el error real:** en el móvil, sacude el dispositivo → menú de desarrollo → *View error log* / *Reload*. En el PC mira la terminal de Metro al escanear (líneas rojas).
5. **API en físico:** en `.env`, `EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:4000/api` (no `10.0.2.2`; eso solo vale en emulador).
6. Si sigue igual: `npx expo start --tunnel` y escanea el QR nuevo.

En este repo, `newArchEnabled` está en **false** para mejor compatibilidad con Expo Go en dispositivo físico.

## Sesión

Tras un **401** o códigos de sesión inválida, la app limpia el token y navega a **`/login`**. El botón **Salir** en el feed cierra sesión y vuelve al inicio (`/`).
