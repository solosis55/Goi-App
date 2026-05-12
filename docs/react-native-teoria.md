# React Native — conceptos teóricos (Goi App)

Breve documentación solicitada en el apartado de setup del proyecto.

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
