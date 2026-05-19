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

- `npm run start` — Metro / Expo
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

## Sesión

Tras un **401** o códigos de sesión inválida, la app limpia el token y navega a **`/login`**. El botón **Salir** en el feed cierra sesión y vuelve al inicio (`/`).
