use mcclean_core::{scan_system, ScanResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter};

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
    Ok(vec![])
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
async fn analyze_directory(path: String) -> Result<Vec<ScanResult>, String> {
    mcclean_core::space::analyze_directory(&path)
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
        .manage(Store(Mutex::new(HashMap::new())))
        .invoke_handler(tauri::generate_handler![
            scan_system_cmd,
            start_scan,
            scan_apps,
            scan_brew,
            update_brew,
            scan_dev_tools,
            uninstall_brew,
            find_associated_files,
            scan_startup_items,
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
