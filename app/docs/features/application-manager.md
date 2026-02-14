# Application Manager (Gestor de Aplicaciones)

## Descripción de Negocio

- **Objetivo**: Listar todas las aplicaciones instaladas y mostrar cuánto espacio ocupan realmente.
- **Valor**: Ayuda a identificar aplicaciones pesadas que no se utilizan para liberar espacio significativo.
- **Comportamiento**: Escanea las carpetas de aplicaciones (`/Applications` y `~/Applications`) y las ordena por tamaño.

## Documentación Técnica

- **Implementación**:
  - **Backend (`electron/main.ts`)**: Función `scanApplications`. Busca directorios con extensión `.app`.
  - **Cálculo de Tamaño**: Al igual que el escaneo de sistema, utiliza `du -sk` para calcular el peso total del "bundle" de la aplicación (que es un directorio en macOS).
  - **Frontend (`src/components/Applications.tsx`)**: Muestra la lista de aplicaciones y permite (o permitirá) iniciar la desinstalación.

- **Archivos Clave**:
  - `electron/main.ts`: Lógica `scanApplications`.
  - `src/components/Applications.tsx`: Componente de UI.

- **Dependencias**:
  - Comando Unix `du`.
