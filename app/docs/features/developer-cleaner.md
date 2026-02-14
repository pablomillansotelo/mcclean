# Developer Cleaner

## Descripción de Negocio

- **Objetivo**: Identificar carpetas pesadas específicas de /Code o Proyectos de desarrollo, como `node_modules` o entornos virtuales de Python.
- **Valor**: Estás carpetas suelen contener miles de archivos pequeños que consumen mucho espacio y son redundantes si el proyecto no se está trabajando activamente (ya que pueden regenerarse con `npm install`).
- **Comportamiento**: Escanea carpetas típicas de código (`~/Code`, `~/Projects`, etc.) buscando recursivamente patrones como `node_modules` y `pyvenv.cfg`.

## Documentación Técnica

- **Implementación**:
  - **Backend (`electron/main.ts`)**: Función `scanDevTools`.
  - **Estrategia de Búsqueda**: Utiliza comandos `find` nativos para mayor velocidad y menor consumo de memoria que una recursión JS pura.
    - `find "${path}" -name "node_modules" -type d -prune`: El flag `-prune` evita buscar dentro de un `node_modules` ya encontrado (no queremos `node_modules` anidados en la lista principal).
  - **Frontend (`src/components/DevCleaner.tsx`)**: Muestra los items encontrados agrupados por tipo (Node, Python).

- **Archivos Clave**:
  - `electron/main.ts`: Lógica compleja de `scanDevTools` usando `find`.
  - `src/components/DevCleaner.tsx`: UI.

- **Dependencias**:
  - Comando Unix `find`.
