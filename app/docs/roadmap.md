# Roadmap de Funcionalidades

Este roadmap traza la evolución de McClean desde su estado actual MVP hasta convertirse en una suite completa de mantenimiento.

## Análisis del Estado Actual (Post-Fase 5)

McClean ha logrado consolidar una base sólida como herramienta de limpieza y privacidad. Con la Fase 5 completada, la aplicación ofrece una excelente visibilidad del almacenamiento y sugerencias inteligentes. Sin embargo, para dar el salto a una "Suite de Mantenimiento Integral", es necesario incorporar herramientas de automatización y gestión avanzada de archivos que justifiquen una utilidad diaria.

Las áreas clave a reforzar son:

1.  **Redundancia de Datos**: Falta de herramientas para declarar y eliminar duplicados.
2.  **Mantenimiento del Sistema Profundo**: Automatización de scripts de mantenimiento de macOS.
3.  **Seguridad de Datos**: Borrado seguro de archivos sensibles.
4.  **Accesibilidad**: Acceso rápido sin abrir la ventana principal (Menu Bar).
5.  **Gestión de Extensiones**: Control centralizado de complementos de navegador y sistema.

## Fase 1: Consolidación MVP (Estado: ✅ Completado)

- [x] **Persistencia**: Implementar sistema para guardar el historial de escaneos y preferencias básicas (usando `electron-store`).
- [x] **Mejoras UX**: Feedback visual durante los escaneos (barras de progreso reales).
- [x] **Seguridad**: Diálogos de confirmación nativos para acciones destructivas.

## Fase 2: Profundización Técnica (Estado: ✅ Completado)

- [x] **Developer Lens**: Implementar escáneres específicos para:
  - Docker (imágenes/contenedores fantasmas).
  - Xcode DerivedData.
  - Cachés de paquetes (npm, yarn, etc.).
- [x] **Homebrew**: Detección de "leaves" (paquetes sin dependencias) y utilidades de actualización.
- [x] **Uninstaller**: Búsqueda básica de archivos asociados al eliminar apps (usando `mdfind`).

## Fase 3: Optimización del Sistema (Estado: ✅ Completado)

- [x] **Gestor de Inicio**:
  - [x] Listar y gestionar `LaunchAgents`. (Login Items requires App Sandbox/API complex access, skipped for now to focus on Agents)
- [x] **Monitor de Recursos**:
  - [x] Widget en la barra lateral (CPU, RAM).
- [ ] **Mantenimiento** (Pospuesto para futuras actualizaciones):
  - [ ] Scripts de mantenimiento de macOS.
  - [ ] Flush DNS Cache.
  - [ ] Reindexar Spotlight.

## Fase 4: Privacidad y Seguridad (Estado: ✅ Completado)

- [x] **Limpieza de Navegadores**:
  - [x] Chrome, Safari, Firefox.
  - [x] Borrar caché.
- [x] **Permisos de Apps**:
  - [x] Acceso directo a Configuración del Sistema > Privacidad.
- [ ] **Destrucción de Archivos (Shredder)** (Pospuesto):
  - [ ] Borrado seguro.

## Fase 5: Visualización y Experiencia Premium (Estado: ✅ Completado)

- [x] **Space Lens (Mapa de Disco)**:
  - [x] Visualización tipo "Treemap" para navegar carpetas por tamaño.
  - [x] Escaneo de carpetas principales del inicio.
  - [x] Sugerencias proactivas (Alerta de Papelera llena, Tiempo desde último escaneo).

## Fase 6: Automatización y Mantenimiento Avanzado (Estado: 🚧 Pendiente)

Esta fase se centra en herramientas 'Pro' y automatización, elevando la utilidad de la app para usuarios avanzados.

- [ ] **Buscador de Duplicados (Duplicate Finder)**:
  - [ ] Escaneo rápido comparando hashes de archivos.
  - [ ] Selección inteligente (mantener el más antiguo/nuevo).
  - [ ] Vista previa de duplicados (imágenes, documentos).
- [ ] **Scripts de Mantenimiento (System Maintenance)**:
  - [ ] Ejecutar scripts de mantenimiento diario/semanal/mensual de macOS.
  - [ ] Flush DNS Cache.
  - [ ] Reconstruir índices de Spotlight.
  - [ ] Purga de memoria RAM inactiva.
- [ ] **Trituradora de Archivos (File Shredder)**:
  - [ ] Borrado seguro (sobreescritura de datos) para archivos sensibles.
  - [ ] Integración con el menú contextual del sistema.
- [ ] **Menu Bar App (Agente Residente)**:
  - [ ] Icono en la barra de menú para acceso rápido.
  - [ ] Liberación rápida de RAM "en un click".
  - [ ] Monitorización en tiempo real "ligera" (CPU/RAM/Temp).
- [ ] **Gestor de Extensiones (Extension Manager)**:
  - [ ] Listar y activar/desactivar extensiones de Safari, Chrome, Firefox.
  - [ ] Gestionar paneles de preferencias y plugins de Internet no deseados.
