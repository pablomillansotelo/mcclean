# Documentación de Funcionalidades (Feature Documentation)

## Developer Lens

El "Lente de Desarrollador" (Developer Lens) es un conjunto de herramientas diseñadas para recuperar espacio utilizado por herramientas de desarrollo comunes.

### Funcionalidades Implementadas

1.  **Scanner de Proyectos**:
    - Busca recursivamente carpetas `node_modules` y `venv` (entornos virtuales de Python) en directorios de desarrollo comunes (`~/Code`, `~/Projects`, `~/Development`).
    - Ayuda a identificar dependencias de proyectos olvidados.

2.  **Docker**:
    - Detecta el archivo de imagen de disco de Docker Desktop (`Docker.raw`).
    - Este archivo puede crecer indefinidamente; McClean muestra su tamaño para que el usuario decida si necesita realizar una limpieza manual via Docker Desktop (`docker system prune`).

3.  **Xcode DerivedData**:
    - Detecta la carpeta `DerivedData` de Xcode, que acumula índices y builds intermedios.
    - Eliminar esta carpeta es seguro y a menudo recupera varios GBs de espacio.

4.  **Cachés de Paquetes**:
    - Escanea y permite limpiar las cachés locales de gestores de paquetes populares:
      - `npm` (`~/.npm`)
      - `Yarn` (`~/Library/Caches/Yarn` o `~/.yarn/cache`)
      - `pnpm` (`~/Library/pnpm/store`)
      - `CocoaPods` (`~/Library/Caches/CocoaPods`)

## Homebrew Manager

Mejoras en la gestión de paquetes de Homebrew:

1.  **Detección de "Leaves"**:
    - Identifica paquetes que no son dependencias de otros paquetes ("hojas").
    - Estos son candidatos ideales para desinstalación si ya no los usas.

2.  **Actualización del Sistema**:
    - Ejecuta `brew update && brew upgrade` para mantener todos los paquetes al día.
    - Muestra el progreso en tiempo real.

3.  **Desinstalación con Confirmación**:
    - Diálogo nativo de confirmación antes de desinstalar cualquier paquete para evitar accidentes.

## Buscador de Archivos Asociados (Uninstaller)

Al eliminar aplicaciones o revisar el sistema, McClean ahora busca archivos "huérfanos" asociados a aplicaciones:

- Utiliza `mdfind` (Spotlight) para buscar archivos de configuración y soporte (`Library/Application Support`, etc.) que a menudo quedan tras borrar una `.app`.
- Esta búsqueda se activa bajo demanda o al seleccionar una aplicación para revisar sus detalles (próximamente en la UI detallada).

## Seguridad

- **Confirmaciones Nativas**: Todas las acciones destructivas (borrar archivos, desinstalar paquetes) requieren confirmación explícita del usuario a través de un diálogo nativo del sistema operativo.
