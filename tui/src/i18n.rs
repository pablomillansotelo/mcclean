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
            "status_idle" => "Presiona 's' para escanear, 'q' para salir.",
            "status_scanning" => "Escaneando el sistema...",
            "status_done" => "¡Listo! Se encontraron {} elementos.",
            "status_error" => "Error: {}",
            "results_title" => "Resultados",
            "bytes" => "bytes",
            _ => key,
        },
        Language::English => match key {
            "status_idle" => "Press 's' to scan system, 'q' to quit.",
            "status_scanning" => "Scanning started...",
            "status_done" => "Done! Found {} items.",
            "status_error" => "Error: {}",
            "results_title" => "Results",
            "bytes" => "bytes",
            _ => key,
        },
    }
}
