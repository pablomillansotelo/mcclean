# System Scan (Escaneo del Sistema)

## Descripción de Negocio

- **Objetivo**: Detectar y eliminar archivos basura que se acumulan en carpetas comunes del sistema.
- **Valor**: Permite al usuario recuperar espacio rápidamente limpiando descargas olvidadas, cachés temporales y desorden en el escritorio.
- **Comportamiento**: El usuario inicia un escaneo que analiza carpetas predefinidas (`Downloads`, `Library/Caches`, `Desktop`). Se muestran los archivos más grandes y antiguos para su revisión.

## Documentación Técnica

- **Implementación**:
  - **Backend (`electron/main.ts`)**: Función `scanDirectory`. Utiliza `os.homedir()` para localizar las rutas. Itera sobre las carpetas y usa `fs.readdir` para listar contenidos.
  - **Cálculo de Tamaño**: Para directorios, se ejecuta el comando `du -sk` (disk usage) mediante `exec` para obtener el tamaño real de forma recursiva, ya que `fs.stat` no da el tamaño total de carpetas.
  - **Frontend (`src/components/Dashboard.tsx`)**: Invoca `window.electron.startScan('HOME')` y recibe un array de `ScanResult`.

- **Archivos Clave**:
  - `electron/main.ts`: Lógica de `scanDirectory` y `getPathSize`.
  - `src/components/Dashboard.tsx`: Visualización de resultados.
  - `src/components/LargeFiles.tsx`: (Si aplica) Vista detallada de archivos grandes.

- **Dependencias**:
  - Comando Unix `du` (Disk Usage).
  - Node.js `fs/promises`, `os`.
