# Comparativa: Gluestack UI vs React Native Paper (Expo)

Documento de investigación previa a escribir componentes de pantalla en **Goi App**, tal como pide el guion de prácticas.

## Contexto

En el ecosistema **Expo / React Native** no existe un único “sistema de diseño oficial”. Las dos opciones más citadas para construir UI de producto con componentes ya pensados suelen ser **Gluestack UI** y **React Native Paper**. Ambas son compatibles con proyectos Expo modernos (p. ej. SDK 54); la elección depende más de **identidad visual**, **velocidad de maquetación** y **cómo queréis que se sienta la app** en iOS y Android.

## Gluestack UI

**Qué es:** librería de componentes orientada a **React Native y web** (UI “universal”), con filosofía cercana a **utilidades y tokens** (en la línea de pensar en diseño por piezas y variantes, comparable en espíritu a flujos tipo **Tailwind** / utility-first que ya usáis en **Goi Web** con Tailwind).

**Fortalezas**

- **Marca propia:** mucho margen para colores, radios, tipografías y layouts propios de **Goi** sin pelear contra un sistema gráfico impuesto.
- **Consistencia web-móvil:** útil si queréis que la app recuerde a la web sin copiar código de componentes.
- **Personalización:** componentes pensados para componer y retocar; buena base si el diseño del gimnasio/red social no es “genérico”.

**Debilidades / costes**

- **Curva:** hay que interiorizar tokens, proveedores y patrones de la librería; no es tan “copiar un ejemplo y listo” como un kit 100 % cerrado.
- **Mantenimiento del diseño:** la libertad implica que **vosotros** definís más reglas (espaciados, jerarquía, estados) para no dispersar la UI.

## React Native Paper

**Qué es:** implementación de **Material Design** (hoy **Material Design 3**) para React Native: botones, cards, diálogos, navegación visual alineada con las guías de Google.

**Fortalezas**

- **Productividad inicial:** muchos patrones ya resueltos (snackbars, FAB, listas, inputs) con comportamiento y accesibilidad razonables por defecto.
- **Android “de casa”:** en Android la app se siente **nativa Material**; integración conceptual fuerte con el ecosistema Google.
- **Documentación y comunidad:** muy extendida en tutoriales y proyectos académicos.

**Debilidades / costes**

- **Identidad visual:** la app tiende a **parecerse a otras apps Material**; salir de esa estética exige más trabajo de tema y overrides.
- **iOS:** se ve correcta y usable, pero la **lenguaje visual** no es el de “apps iOS típicas” (Human Interface); hay que decidir si os importa el contraste entre plataformas.

## Tabla resumen

| Criterio | Gluestack UI | React Native Paper |
| -------- | ------------- | ------------------- |
| Sistema de diseño | Flexible / tokens; vosotros marcas la identidad | Material Design 3 (Google) |
| Afinidad con Goi Web (Tailwind) | Alta (misma filosofia de diseño por utilidades/tokens) | Media (otro modelo mental) |
| Velocidad primeras pantallas “estándar” | Media (más decisiones de diseño) | Alta (componentes MD listos) |
| Android “Material nativo” | Depende de cómo lo maquetéis | Muy fuerte |
| iOS “look & feel” Apple | Más neutro / adaptable | Menos “Apple stock”; más Google |
| Curva de aprendizaje | Media | Baja–media |

## Conclusión para el proyecto **Goi**

Para una **red social de gimnasio** con web ya hecha en **React + Tailwind**, encaja especialmente **Gluestack UI**: mantenéis una narrativa de **diseño propio** y coherencia conceptual con la web, con espacio para una identidad fuerte (marca, fotos de entreno, perfiles).

**React Native Paper** sería una elección muy sólida si el objetivo del módulo fuera priorizar **velocidad** y una UI **Material** reconocible en Android, aceptando que la app se parezca más a “una app Google” que a una marca totalmente custom.

**Decisión recomendada para Goi:** seguir con **Gluestack UI** como librería principal de UI móvil, dejando documentada esta comparativa para justificar por qué no se eligió Paper en este producto concreto.

## Referencias (consulta oficial)

- Gluestack UI — guías e instalación Expo: [gluestack.io/ui](https://gluestack.io/ui/docs/guides/install-expo)
- React Native Paper — getting started: [callstack.github.io/react-native-paper](https://callstack.github.io/react-native-paper/docs/guides/getting-started)
