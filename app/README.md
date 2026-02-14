# McClean

McClean es una aplicación de escritorio para macOS diseñada para ayudar a los usuarios a limpiar, optimizar y mantener sus sistemas. Inspirada en herramientas líderes como CleanMyMac y CCleaner, McClean busca ofrecer una experiencia de usuario premium, simple y eficiente para desarrolladores y usuarios generales.

## Objetivo del Proyecto

El objetivo principal de McClean es proporcionar una herramienta unificada que permita:

1.  **Recuperar espacio en disco**: Identificando y eliminando archivos basura, cachés, y archivos grandes olvidados.
2.  **Gestión de Entorno de Desarrollo**: Funcionalidades específicas para desarrolladores (limpieza de `node_modules`, entornos virtuales de Python, paquetes de Homebrew no utilizados).
3.  **Optimización del Sistema**: Monitorización de recursos y gestión de aplicaciones instaladas.
4.  **Privacidad y Mantenimiento**: Herramientas para asegurar que el sistema corra de manera fluida y privada.

## Funcionalidades Principales

Actualmente, el proyecto cuenta con las siguientes capacidades:

- **Dashboard Unificado**: Vista general del estado del sistema y acceso rápido a escaneos.
- **Escaneo Inteligente**:
  - **Archivos del Sistema**: Detección de archivos en Descargas, Cachés y Escritorio.
  - **Aplicaciones**: Listado de aplicaciones instaladas con su tamaño.
  - **Homebrew**: Gestión de fórmulas y casks. Detección de "hojas" (paquetes sin dependencias) y utilidades de actualización (`brew update/upgrade`).
  - **Developer Clean**:
    - **Proyectos**: Detección de `node_modules` y `venv` profundos.
    - **Herramientas**: Escaneo de imágenes de Docker (Disk Image) y DerivedData de Xcode.
    - **Cachés**: Limpieza de cachés de npm, Yarn, pnpm y CocoaPods.
- **Limpieza Segura**: Opción de mover archivos a la Papelera antes de la eliminación permanente.

## Arquitectura Técnica

El proyecto está construido utilizando un stack moderno y eficiente para aplicaciones de escritorio:

- **Core**: [Electron](https://www.electronjs.org/) (v30) - Para la creación de la aplicación de escritorio multiplataforma (enfocada en macOS).
- **Frontend**: [React](https://react.dev/) (v18) + [TypeScript](https://www.typescriptlang.org/) - Para una interfaz de usuario reactiva y tipada.
- **Build Tool**: [Vite](https://vitejs.dev/) - Para un desarrollo rápido y bundling optimizado.
- **Estilado**: CSS Modules / Vanilla CSS con un enfoque en diseño moderno (Dark mode, transparencias, vibrancia nativa de macOS).

### Estructura del Proyecto

- **`/electron`**: Contiene el código del proceso principal (`main.ts`) que interactúa con el sistema operativo (File System, Child Process para comandos como `du`, `find`, `brew`).
- **`/src`**: Contiene el código del proceso de renderizado (UI).
  - **`components/`**: Componentes de React modulares (Dashboard, Applications, Homebrew, etc.).
  - **`App.tsx`**: Componente raíz que maneja el estado global de la aplicación y la navegación.
- **Bridging**: La comunicación entre el proceso principal y el renderizado se realiza a través de `IPC` (Inter-Process Communication) expuesto de manera segura mediante `contextBridge` (aunque actualmente simplificado).

## Documentación Adicional

Para más detalles sobre el proyecto, consulta la carpeta `/docs`:

- [Documentación de Negocio](./docs/business.md)
- [Documentación Técnica](./docs/technical.md)
- [Roadmap de Funcionalidades](./docs/roadmap.md)

## Ejecutar Localmente

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```
