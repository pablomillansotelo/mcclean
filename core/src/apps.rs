use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use crate::{get_path_size, ScanResult};

pub fn scan_apps() -> Result<Vec<ScanResult>, String> {
    let mut results = Vec::new();
    let app_dirs = vec![
        PathBuf::from("/Applications"),
        dirs::home_dir().map(|h| h.join("Applications")).unwrap_or_default(),
    ];

    for dir in app_dirs {
        if !dir.exists() {
            continue;
        }

        if let Ok(entries) = fs::read_dir(&dir) {
            for entry in entries.filter_map(|e| e.ok()) {
                let path = entry.path();
                if path.extension().and_then(|e| e.to_str()) == Some("app") {
                    let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                    let metadata = entry.metadata().ok();
                    let modified = metadata.as_ref().and_then(|m| m.modified().ok());
                    let size = get_path_size(&path).unwrap_or(0);

                    results.push(ScanResult {
                        name,
                        path: path.to_string_lossy().to_string(),
                        size,
                        is_directory: true,
                        modified,
                        category: "Applications".to_string(),
                        scan_type: "App".to_string(),
                    });
                }
            }
        }
    }

    results.sort_by(|a, b| b.size.cmp(&a.size));
    Ok(results)
}

pub fn find_associated_files(app_name: &str) -> Result<Vec<String>, String> {
    let mut results = Vec::new();
    let home = match dirs::home_dir() {
        Some(h) => h,
        None => return Err("Home directory not found".to_string()),
    };

    let name_without_ext = app_name.trim_end_matches(".app");
    let name_lower = name_without_ext.to_lowercase();

    let search_dirs = vec![
        home.join("Library/Application Support"),
        home.join("Library/Caches"),
        home.join("Library/Preferences"),
        home.join("Library/Logs"),
        home.join("Library/Saved Application State"),
        home.join("Library/Containers"),
    ];

    for dir in search_dirs {
        if !dir.exists() {
            continue;
        }

        if let Ok(entries) = fs::read_dir(&dir) {
            for entry in entries.filter_map(|e| e.ok()) {
                let file_name = entry.file_name().to_string_lossy().to_lowercase();
                if file_name.contains(&name_lower) {
                    results.push(entry.path().to_string_lossy().to_string());
                }
            }
        }
    }

    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scan_apps() {
        let result = scan_apps();
        assert!(result.is_ok());
    }
}
