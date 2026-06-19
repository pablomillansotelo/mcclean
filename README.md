# McClean

McClean es una herramienta rápida y moderna para mantener tu Mac limpia, construida con **Tauri**, **React** y **Rust**. Su objetivo es ser la alternativa open source y ultrarrápida para gestionar tu almacenamiento, limpiar dependencias de desarrollo y recuperar espacio perdido por culpa de archivos duplicados.


## Características
- **Análisis de Carpeta ("Lente de Espacio")**: Visualiza interactivamente en qué se gasta tu almacenamiento, agrupado por color según el tipo de archivo.
- **Buscador de Duplicados Criptográfico**: Realiza hashing (SHA-256) ultra rápido en Rust para asegurar clones 100% idénticos sin falsos positivos.
- **Gestor de Dependencias de Desarrollo**: Encuentra y limpia fácilmente proyectos pesados como `node_modules` y cachés de código.
- **Limpiador de Homebrew y Sistema**: Identifica y desinstala hojas (leaves) de Homebrew y limpia cachés innecesarios de tu macOS de forma segura.

## Descarga e Instalación

Para descargar la última versión compilada:
1. Ve a la pestaña de [**Releases**](../../releases) aquí en GitHub.
2. Descarga el archivo `.dmg` de la versión más reciente (ej. `McClean_0.1.0_aarch64.dmg`).
3. Abre el `.dmg` y arrastra la aplicación `McClean` a tu carpeta de **Aplicaciones**.

### ⚠️ Aviso de "Desarrollador no Identificado" (Gatekeeper)
Dado que McClean es un proyecto Open Source actualmente no firmado comercialmente con Apple, tu Mac mostrará una advertencia al intentar abrirlo por primera vez. Para abrirlo sin problemas:
1. Ve a tu carpeta de Aplicaciones o Launchpad.
2. Haz **Clic derecho** (o Control + Clic) sobre la aplicación de McClean.
3. Selecciona **"Abrir"** en el menú contextual.
4. macOS te mostrará la misma advertencia, pero ahora te dará un botón adicional que dice **"Abrir"**.
5. ¡Solo necesitas hacer esto la primera vez! Las siguientes veces abrirá como cualquier otra aplicación.

## Desarrollo Local

Si deseas correr McClean en tu propia computadora y ver o modificar el código:

### Pre-requisitos
- Node.js (v20+)
- Rust (`rustup` / `cargo`)

### Configuración
```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/mcclean.git
cd mcclean/app

# 2. Instala las dependencias del frontend
npm install

# 3. Inicia el servidor de desarrollo
npm run tauri dev
```

## Licencia
Licenciado bajo MIT. ¡Eres libre de bifurcar (fork) el proyecto, contribuir y mejorarlo!
