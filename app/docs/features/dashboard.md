# Dashboard

## Descripción de Negocio

- **Objetivo**: Ofrecer una vista de "Single Pane of Glass" (Panel Único) del estado de limpieza del sistema.
- **Valor**: Permite al usuario iniciar todas las acciones desde un solo lugar y ver un resumen rápido de lo que se puede limpiar.
- **Comportamiento**: Muestra tarjetas (Cards) de resumen para Sistema, Apps, Developer Tools y Homebrew. Tiene un botón principal de "SCAN" que dispara el análisis en paralelo de todas las categorías.

## Documentación Técnica

- **Implementación**:
  - **Frontend (`src/components/Dashboard.tsx`)**: Es el componente principal de aterrizaje.
  - **Gestión de Estado**: Recibe props (`results`, `apps`, `brew`, `devItems`) desde el componente padre `App.tsx` para mostrar los contadores de archivos encontrados y tamaño total.
  - **Lógica de Escaneo**: Al hacer clic en Scan, invoca la función `handleScan` del padre, que ejecuta `Promise.all` contra los 4 endpoints del IPC.

- **Archivos Clave**:
  - `src/components/Dashboard.tsx`: UI del Dashboard.
  - `src/App.tsx`: Orquestación del estado global y función `handleScan`.

- **Dependencias**:
  - Librería de iconos `lucide-react` para visualización gráfica.
