use crate::ScanResult;
use std::path::Path;
use std::fs;
use walkdir::WalkDir;

pub fn analyze_directory(dir_path: &str) -> Result<Vec<ScanResult>, String> {
    let mut results = Vec::new();
    let root = Path::new(dir_path);

    if !root.is_dir() {
        return Err("Not a directory".to_string());
    }

    let entries = fs::read_dir(root).map_err(|e| e.to_string())?;

    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            let is_dir = path.is_dir();

            let mut size = 0;
            if is_dir {
                for dir_entry in WalkDir::new(&path).into_iter().filter_map(|e| e.ok()) {
                    if let Ok(metadata) = dir_entry.metadata() {
                        if metadata.is_file() {
                            size += metadata.len();
                        }
                    }
                }
            } else if let Ok(metadata) = entry.metadata() {
                size = metadata.len();
            }

            // Only add items bigger than 1MB to avoid clutter, or maybe 0 to keep everything?
            // Keep everything and sort
            results.push(ScanResult {
                name,
                path: path.to_string_lossy().to_string(),
                size,
                is_directory: is_dir,
                modified: None,
                category: "Space Lens".to_string(),
                scan_type: "Disk Space".to_string(),
            });
        }
    }

    // Sort by size descending
    results.sort_by(|a, b| b.size.cmp(&a.size));

    Ok(results)
}

pub fn scan_space_lens() -> Result<Vec<ScanResult>, String> {
    Ok(Vec::new()) // Dummy return since we no longer use it
}
