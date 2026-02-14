# Documentación de Negocio

## Visión del Producto

McClean aspira a ser la herramienta de mantenimiento definitiva para usuarios de macOS, combinando la simplicidad necesaria para usuarios casuales con la potencia requerida por desarrolladores y profesionales técnicos. A diferencia de otras soluciones, McClean pone un énfasis especial en el "Developer Hygiene" (Higiene del Desarrollador), abordando los gigabytes de espacio perdidos en dependencias y entornos de desarrollo olvidados.

## Público Objetivo

1.  **Desarrolladores de Software**:
    - Usuarios que acumulan múltiples proyectos con carpetas `node_modules`, `venv`, `target` (Rust), etc.
    - Usuarios intensivos de Homebrew.
    - Necesitan limpiar caché de herramientas de build (Docker, Gradle, Maven).

2.  **Usuarios Generales de macOS**:
    - Personas que notan su Mac lenta o sin espacio.
    - Usuarios que descargan muchas aplicaciones y archivos pero rara vez limpian.

## Propuesta de Valor

- **"Dev-First" Cleaning**: Detección inteligente de artefactos de desarrollo que otras herramientas ignoran.
- **Transparencia**: El usuario siempre sabe qué se va a borrar. No hay "cajas negras".
- **Nativo y Ligero**: UI diseñada para sentirse como parte del ecosistema macOS.
- **Seguridad**: Enfoque conservador en el borrado (Papelera por defecto) para evitar pérdida de datos accidental.

## Funcionalidades Clave (Estado Actual vs Visión)

| Funcionalidad         | Estado Actual             | Visión                                                                      |
| :-------------------- | :------------------------ | :-------------------------------------------------------------------------- |
| **Limpieza General**  | Cachés básicos, Descargas | Logs de sistema, Idiomas no usados, Papeleras múltiples, Mail attachments.  |
| **Gestión de Apps**   | Listado simple            | Desinstalador completo (App + Library + Application Support + Preferences). |
| **Developer Tools**   | node_modules, venv        | Docker images/containers, Xcode derived data, Gradle/Maven caches.          |
| **Privacidad**        | No implementado           | Borrado de historial de navegadores, cookies, permisos de apps.             |
| **Optimización**      | No implementado           | Gestión de Login Items, Launch Agents, liberador de RAM.                    |
| **Análisis de Disco** | Listado tabular           | Mapa visual (Treemap o Sunburst chart) interactivo del disco.               |
