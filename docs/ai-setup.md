# Configuración de herramientas de IA — Goi App

Este documento cumple el apartado inicial de prácticas: dejar **documentada** la configuración de contexto para asistentes de IA y el **porqué** de cada decisión.

## Herramienta usada

**Cursor** (agente de código integrado en el IDE).

## Qué se ha configurado

### Archivo `.cursorrules` (raíz de `Goi App`)

- **Ubicación:** `Goi App/.cursorrules` (raíz del proyecto móvil, no de todo el monorepo).
- **Contenido:** contexto de producto (Goi, relación con Goi Web), **stack previsto** (Expo, React Native, TypeScript, Expo Router, Gluestack UI, FlashList, Zustand, AsyncStorage), **convenciones** de código y **límites** (no instalar dependencias hasta que el guion lo indique, cambios acotados, alineación con la API de Goi Web).
- **Motivo:** Cursor inyecta estas instrucciones como contexto persistente del repositorio, de modo que las sugerencias no contradigan el stack acordado ni el backend ya existente.

### Por qué no solo dependemos del chat

Sin reglas fijas, el modelo tiende a proponer librerías alternativas, otra estructura de carpetas o contratos API distintos. Las reglas **anclan** stack, idioma de UI, integración con Goi Web y la restricción de **no adelantar instalaciones** a los apartados de las prácticas.

## Relación con otras herramientas (Gemini, Claude, etc.)

Si en otro entorno se usa **prompt de sistema** o instrucciones persistentes, conviene **copiar o resumir** el mismo bloque de contexto (stack, carpetas, restricciones y enlace lógico con Goi Web) para mantener coherencia entre herramientas.

## Nota sobre formatos de reglas en Cursor

Las versiones recientes de Cursor recomiendan también reglas en `.cursor/rules/` (archivos `.mdc` con frontmatter). El guion de prácticas pide explícitamente **`.cursorrules`**; se ha seguido ese criterio para la evaluación. Si más adelante se desea migrar o duplicar políticas en `.cursor/rules/`, este documento puede actualizarse con un enlace a esos ficheros.

## Historial de cambios

| Fecha       | Cambio |
| ----------- | ------ |
| 2026-05-12  | Creación inicial de `.cursorrules` y este documento. |
| 2026-05-12  | Setup Expo (SDK 54): plantilla `blank-typescript`, Expo Router y dependencias del enunciado; estructura de carpetas recomendada. El nombre de carpeta del workspace es `Goi App` (con espacio); el paquete npm usa el identificador `goi` por compatibilidad con Expo. |
