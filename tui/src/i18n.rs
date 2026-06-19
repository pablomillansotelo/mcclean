pub enum Language {
    English,
    Spanish,
}

impl Language {
    pub fn current() -> Self {
        let locale = sys_locale::get_locale().unwrap_or_else(|| "en".to_string());
        if locale.starts_with("es") {
            Language::Spanish
        } else {
            Language::English
        }
    }
}

pub fn t<'a>(key: &'a str, lang: &Language) -> &'a str {
    match lang {
        Language::Spanish => match key {
            "welcome" => "Bienvenido a McClean TUI",
            "menu_prompt" => "¿Qué te gustaría hacer hoy?",
            "menu_dashboard" => "📊 Ver Resumen (Dashboard)",
            "menu_system" => "🧹 Sistema (Cachés, Logs, etc.)",
            "menu_dev" => "📦 Developer (node_modules, cachés, etc.)",
            "menu_brew" => "☕ Homebrew (Limpiar Paquetes)",
            "menu_space" => "🔍 Lente de Espacio (Análisis de Carpeta)",
            "menu_exit" => "❌ Salir",
            "scanning" => "Escaneando...",
            "scanning_dash" => "Calculando el resumen del sistema...",
            "scanning_done" => "Escaneo finalizado",
            "dash_sys" => "Basura del Sistema:",
            "dash_dev" => "Proyectos Dev:",
            "dash_brew" => "Hojas de Homebrew:",
            "packages" => "paquetes",
            "found_items" => "¡Listo! Encontramos {} elementos ({} MB).",
            "no_items" => "No se encontró nada. ¡Tu Mac está limpia!",
            "select_clean" => "Selecciona los elementos a limpiar (Espacio para seleccionar, Enter para confirmar)",
            "prompt_folder" => "Ingresa la ruta de la carpeta a analizar:",
            "space_title" => "Desglose de",
            "dups_found" => "Encontramos {} grupos de archivos duplicados aquí.",
            "confirm_clean" => "¿Estás seguro que deseas eliminar lo seleccionado?",
            "cleaning" => "Limpiando...",
            "cleaned" => "¡Limpieza completada con éxito!",
            "goodbye" => "¡Hasta la próxima!",
            "canceled" => "Operación cancelada.",
            "error" => "Error inesperado: {}",
            "bytes" => "bytes",
            _ => key,
        },
        Language::English => match key {
            "welcome" => "Welcome to McClean TUI",
            "menu_prompt" => "What would you like to do today?",
            "menu_dashboard" => "📊 View Dashboard Summary",
            "menu_system" => "🧹 System (Caches, Logs, etc.)",
            "menu_dev" => "📦 Developer (node_modules, caches, etc.)",
            "menu_brew" => "☕ Homebrew (Clean Packages)",
            "menu_space" => "🔍 Space Lens (Folder Analysis)",
            "menu_exit" => "❌ Exit",
            "scanning" => "Scanning...",
            "scanning_dash" => "Calculating system overview...",
            "scanning_done" => "Scan complete",
            "dash_sys" => "System Junk:",
            "dash_dev" => "Developer Projects:",
            "dash_brew" => "Homebrew Leaves:",
            "packages" => "packages",
            "found_items" => "Done! Found {} items ({} MB).",
            "no_items" => "No items found. Your Mac is clean!",
            "select_clean" => "Select items to clean (Space to select, Enter to confirm)",
            "prompt_folder" => "Enter folder path to analyze:",
            "space_title" => "Breakdown of",
            "dups_found" => "Found {} duplicate file groups here.",
            "confirm_clean" => "Are you sure you want to delete the selected items?",
            "cleaning" => "Cleaning...",
            "cleaned" => "Cleanup completed successfully!",
            "goodbye" => "See you next time!",
            "canceled" => "Operation canceled.",
            "error" => "Unexpected error: {}",
            "bytes" => "bytes",
            _ => key,
        },
    }
}
