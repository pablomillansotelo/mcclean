use mcclean_core::{scan_system, ScanResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter};
use tauri::menu::{Menu, PredefinedMenuItem, Submenu};

#[derive(Clone, Serialize, Deserialize)]
struct ProgressPayload {
    scanId: String,
    progress: f64,
    status: String,
}

// Simple in-memory store for settings
struct Store(Mutex<HashMap<String, String>>);

#[tauri::command]
async fn scan_system_cmd(app: AppHandle) -> Result<Vec<ScanResult>, String> {
    let results = scan_system(|current_file, _items_processed| {
        let _ = app.emit(
            "scan-progress",
            ProgressPayload {
                scanId: "system".to_string(),
                progress: 0.0,
                status: format!("Scanning: {}", current_file),
            },
        );
    });

    results.map_err(|e| e.to_string())
}

#[tauri::command]
async fn start_scan(_path: String) -> Result<Vec<ScanResult>, String> {
    // Return large files from user's home directory
    let home = dirs::home_dir().map(|p| p.to_string_lossy().to_string()).unwrap_or_else(|| "/".to_string());
    
    // We can reuse analyze_directory to get large files by scanning the home directory,
    // but without full depth to save time, or we just do a quick scan of Downloads and Documents.
    let mut large_files = Vec::new();
    let dirs_to_scan = vec![
        format!("{}/Downloads", home),
        format!("{}/Documents", home),
        format!("{}/Desktop", home),
        format!("{}/Movies", home),
    ];

    for d in dirs_to_scan {
        if let Ok(entries) = mcclean_core::space::analyze_directory(&d, |_, _| {}) {
            for entry in entries {
                if !entry.is_directory && entry.size > 50 * 1024 * 1024 { // > 50MB
                    large_files.push(entry);
                }
            }
        }
    }

    Ok(large_files)
}

#[tauri::command]
async fn scan_apps() -> Result<Vec<ScanResult>, String> {
    mcclean_core::apps::scan_apps()
}

#[tauri::command]
async fn scan_brew() -> Result<Vec<ScanResult>, String> {
    mcclean_core::brew::scan_brew()
}

#[tauri::command]
async fn update_brew() -> Result<bool, String> {
    mcclean_core::brew::update_brew()
}

#[tauri::command]
async fn update_brew_package(name: String) -> Result<bool, String> {
    mcclean_core::brew::update_brew_package(&name)
}

#[tauri::command]
async fn scan_dev_tools() -> Result<Vec<ScanResult>, String> {
    Ok(vec![])
}

#[tauri::command]
async fn uninstall_brew(name: String) -> Result<bool, String> {
    mcclean_core::brew::uninstall_brew(&name)
}

#[tauri::command]
async fn find_associated_files(app_name: String) -> Result<Vec<String>, String> {
    mcclean_core::apps::find_associated_files(&app_name)
}

#[tauri::command]
async fn scan_startup_items() -> Result<Vec<mcclean_core::startup::StartupItem>, String> {
    mcclean_core::startup::scan_startup_items()
}

#[tauri::command]
async fn toggle_startup_item(path: String, enable: bool) -> Result<bool, String> {
    mcclean_core::startup::toggle_startup_item(&path, enable)
}

#[tauri::command]
async fn get_system_stats() -> Result<mcclean_core::sys::SystemStats, String> {
    mcclean_core::sys::get_system_stats()
}

#[tauri::command]
async fn scan_privacy() -> Result<Vec<ScanResult>, String> {
    mcclean_core::privacy::scan_privacy()
}

#[tauri::command]
async fn clean_privacy(path: String) -> Result<bool, String> {
    mcclean_core::privacy::clean_privacy(&path)
}

#[tauri::command]
async fn open_security_settings() -> Result<bool, String> {
    Ok(true)
}

#[tauri::command]
async fn scan_duplicates(
    path: Option<String>,
) -> Result<Vec<mcclean_core::duplicates::DuplicateGroup>, String> {
    mcclean_core::duplicates::scan_duplicates(path)
}

#[tauri::command]
async fn analyze_directory(app: AppHandle, path: String) -> Result<Vec<ScanResult>, String> {
    mcclean_core::space::analyze_directory(&path, |current_file, _items_processed| {
        let _ = app.emit(
            "scan-progress",
            ProgressPayload {
                scanId: "space_lens".to_string(),
                progress: 0.0,
                status: format!("Analizando: {}", current_file),
            },
        );
    })
}

#[tauri::command]
async fn scan_space_lens() -> Result<Vec<ScanResult>, String> {
    mcclean_core::space::scan_space_lens()
}

#[tauri::command]
async fn get_trash_size() -> Result<u64, String> {
    mcclean_core::trash::get_trash_size()
}

#[tauri::command]
async fn move_to_trash(path: String) -> Result<bool, String> {
    mcclean_core::trash::move_to_trash(&path)
}

#[tauri::command]
async fn get_store_value(
    key: String,
    store: tauri::State<'_, Store>,
) -> Result<Option<String>, String> {
    let map = store.0.lock().unwrap();
    Ok(map.get(&key).cloned())
}

#[tauri::command]
async fn set_store_value(
    key: String,
    value: String,
    store: tauri::State<'_, Store>,
) -> Result<(), String> {
    let mut map = store.0.lock().unwrap();
    map.insert(key, value);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::default().build())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                let handle = app.handle();
                let app_menu = Submenu::with_items(
                    handle,
                    "McClean",
                    true,
                    &[
                        &PredefinedMenuItem::about(handle, None, None)?,
                        &PredefinedMenuItem::separator(handle)?,
                        &PredefinedMenuItem::hide(handle, Some("Ocultar McClean"))?,
                        &PredefinedMenuItem::hide_others(handle, Some("Ocultar Otros"))?,
                        &PredefinedMenuItem::show_all(handle, Some("Mostrar Todo"))?,
                        &PredefinedMenuItem::separator(handle)?,
                        &PredefinedMenuItem::quit(handle, Some("Salir de McClean"))?,
                    ],
                )?;

                let edit_menu = Submenu::with_items(
                    handle,
                    "Edición",
                    true,
                    &[
                        &PredefinedMenuItem::undo(handle, Some("Deshacer"))?,
                        &PredefinedMenuItem::redo(handle, Some("Rehacer"))?,
                        &PredefinedMenuItem::separator(handle)?,
                        &PredefinedMenuItem::cut(handle, Some("Cortar"))?,
                        &PredefinedMenuItem::copy(handle, Some("Copiar"))?,
                        &PredefinedMenuItem::paste(handle, Some("Pegar"))?,
                        &PredefinedMenuItem::select_all(handle, Some("Seleccionar Todo"))?,
                    ],
                )?;

                let view_menu = Submenu::with_items(
                    handle,
                    "Vista",
                    true,
                    &[
                        &PredefinedMenuItem::fullscreen(handle, Some("Pantalla Completa"))?,
                    ],
                )?;

                let window_menu = Submenu::with_items(
                    handle,
                    "Ventana",
                    true,
                    &[
                        &PredefinedMenuItem::minimize(handle, Some("Minimizar"))?,
                        &PredefinedMenuItem::close_window(handle, Some("Cerrar Ventana"))?,
                    ],
                )?;

                let menu = Menu::with_items(
                    handle,
                    &[&app_menu, &edit_menu, &view_menu, &window_menu],
                )?;

                app.set_menu(menu)?;
            }
            Ok(())
        })
        .manage(Store(Mutex::new(HashMap::new())))
        .invoke_handler(tauri::generate_handler![
            scan_system_cmd,
            start_scan,
            scan_apps,
            scan_brew,
            update_brew,
            update_brew_package,
            scan_dev_tools,
            uninstall_brew,
            find_associated_files,
            scan_startup_items,
            toggle_startup_item,
            get_system_stats,
            scan_privacy,
            clean_privacy,
            open_security_settings,
            scan_duplicates,
            scan_space_lens,
            analyze_directory,
            get_trash_size,
            move_to_trash,
            get_store_value,
            set_store_value,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
