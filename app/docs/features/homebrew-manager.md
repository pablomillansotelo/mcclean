# Homebrew Manager

## Descripción de Negocio

- **Objetivo**: Gestionar paquetes instalados a través del gestor de paquetes Homebrew.
- **Valor**: Homebrew es esencial para desarrolladores pero a menudo acumula versiones antiguas ("leaves") y casks olvidados. Esta herramienta centraliza su visualización fuera de la terminal.
- **Comportamiento**: Verifica si Homebrew está instalado. Si es así, obtinene la lista de Fórmulas (herramientas CLI) y Casks (Apps GUI) instaladas, mostrando sus versiones.

## Documentación Técnica

- **Implementación**:
  - **Backend (`electron/main.ts`)**: Función `scanBrew`. Ejecuta comandos de shell directos:
    - `brew list --formulae --versions`: Para herramientas de línea de comandos.
    - `brew list --casks --versions`: Para aplicaciones gráficas.
  - **Frontend (`src/components/Homebrew.tsx`)**: Renderiza dos listas separadas (Fórmulas y Casks).
  - **Acciones**: Expone `ipcMain.handle('run-brew-uninstall')` para permitir la desinstalación de paquetes desde la UI.

- **Archivos Clave**:
  - `electron/main.ts`: Lógica `scanBrew` y `run-brew-uninstall`.
  - `src/components/Homebrew.tsx`: UI de gestión.

- **Dependencias**:
  - CLI de `brew` instalado en el sistema del usuario.
