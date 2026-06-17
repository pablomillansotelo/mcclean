use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use walkdir::WalkDir;

pub mod brew;
pub mod duplicates;
pub mod apps;
pub mod startup;
pub mod privacy;
pub mod trash;
pub mod space;
pub mod sys;
pub mod dev;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ScanResult {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub is_directory: bool,
    pub modified: Option<SystemTime>,
    pub category: String,
    #[serde(rename = "type")]
    pub scan_type: String, // 'type' is a reserved keyword in Rust
}

pub fn get_path_size<P: AsRef<Path>>(path: P) -> std::io::Result<u64> {
    let mut total_size = 0;
    for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
        if let Ok(metadata) = entry.metadata() {
            if metadata.is_file() {
                total_size += metadata.len();
            }
        }
    }
    Ok(total_size)
}

pub fn scan_system<F>(mut on_progress: F) -> Result<Vec<ScanResult>, std::io::Error>
where
    F: FnMut(&str, usize),
{
    let home_dir = dirs::home_dir().ok_or_else(|| {
        std::io::Error::new(std::io::ErrorKind::NotFound, "Home directory not found")
    })?;

    let targets = vec![
        (
            "System Caches",
            PathBuf::from("/Library/Caches"),
            "System Cache",
        ),
        (
            "System Logs",
            PathBuf::from("/Library/Logs"),
            "System Logs",
        ),
        (
            "User Logs",
            home_dir.join("Library/Logs"),
            "User Logs",
        ),
        (
            "User Caches",
            home_dir.join("Library/Caches"),
            "User Cache",
        ),
    ];

    let mut results = Vec::new();
    let mut total_items = 0;

    for (name, path, scan_type) in targets {
        if !path.exists() {
            continue;
        }

        if let Ok(entries) = fs::read_dir(&path) {
            for entry in entries.filter_map(|e| e.ok()) {
                let file_name = entry.file_name().to_string_lossy().to_string();
                
                let metadata = entry.metadata().ok();
                let is_directory = metadata.as_ref().map(|m| m.is_dir()).unwrap_or(false);
                let modified = metadata.as_ref().and_then(|m| m.modified().ok());
                
                let size = get_path_size(entry.path()).unwrap_or(0);

                total_items += 1;
                if total_items % 5 == 0 {
                    on_progress(name, total_items);
                }

                results.push(ScanResult {
                    name: file_name,
                    path: entry.path().to_string_lossy().to_string(),
                    size,
                    is_directory,
                    modified,
                    category: "System Junk".to_string(),
                    scan_type: scan_type.to_string(),
                });
            }
        }
    }

    results.sort_by(|a, b| b.size.cmp(&a.size));

    Ok(results)
}
