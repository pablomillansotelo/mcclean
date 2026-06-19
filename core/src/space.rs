use crate::ScanResult;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::fs;
use walkdir::WalkDir;
use serde::{Deserialize, Serialize};
use crate::duplicates::{DuplicateGroup, DuplicateFile, hash_file};

#[derive(Debug, Serialize, Deserialize)]
pub struct FolderAnalysisResult {
    pub space_items: Vec<ScanResult>,
    pub duplicates: Vec<DuplicateGroup>,
}

pub fn deep_analyze_directory<F>(dir_path: &str, mut on_progress: F) -> Result<FolderAnalysisResult, String>
where
    F: FnMut(&str, usize),
{
    let mut space_items = Vec::new();
    let root = Path::new(dir_path);

    if !root.is_dir() {
        return Err("Not a directory".to_string());
    }

    let mut size_map: HashMap<u64, Vec<PathBuf>> = HashMap::new();
    let mut total_items = 0;

    let entries = fs::read_dir(root).map_err(|e| e.to_string())?;
    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            let is_dir = path.is_dir();

            let mut size = 0;
            if is_dir {
                for dir_entry in WalkDir::new(&path).into_iter().filter_map(|e| e.ok()) {
                    total_items += 1;
                    if total_items % 50 == 0 {
                        on_progress(&dir_entry.path().to_string_lossy(), total_items);
                    }
                    if let Ok(metadata) = dir_entry.metadata() {
                        if metadata.is_file() {
                            let fsize = metadata.len();
                            size += fsize;
                            if fsize > 10 * 1024 {
                                size_map.entry(fsize).or_insert_with(Vec::new).push(dir_entry.path().to_path_buf());
                            }
                        }
                    }
                }
            } else if let Ok(metadata) = entry.metadata() {
                size = metadata.len();
                if size > 10 * 1024 {
                    size_map.entry(size).or_insert_with(Vec::new).push(path.to_path_buf());
                }
            }

            space_items.push(ScanResult {
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

    space_items.sort_by(|a, b| b.size.cmp(&a.size));

    let mut hash_map: HashMap<String, Vec<PathBuf>> = HashMap::new();
    for (_size, files) in size_map {
        if files.len() > 1 {
            for path in files {
                if let Ok(hash) = hash_file(path.to_str().unwrap_or("")) {
                    hash_map.entry(hash).or_insert_with(Vec::new).push(path);
                }
            }
        }
    }

    let mut duplicates = Vec::new();
    for (hash, files) in hash_map {
        if files.len() > 1 {
            let mut duplicate_files = Vec::new();
            let mut group_size = 0;

            for path in files {
                if let Ok(metadata) = std::fs::metadata(&path) {
                    group_size = metadata.len();
                    
                    let modified = metadata
                        .modified()
                        .ok()
                        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                        .map(|d| d.as_secs().to_string())
                        .unwrap_or_default();

                    duplicate_files.push(DuplicateFile {
                        path: path.to_string_lossy().to_string(),
                        name: path.file_name().unwrap_or_default().to_string_lossy().to_string(),
                        modified,
                    });
                }
            }

            duplicates.push(DuplicateGroup {
                hash,
                size: group_size,
                files: duplicate_files,
            });
        }
    }

    duplicates.sort_by(|a, b| b.size.cmp(&a.size));

    Ok(FolderAnalysisResult {
        space_items,
        duplicates,
    })
}

pub fn analyze_directory<F>(dir_path: &str, mut on_progress: F) -> Result<Vec<ScanResult>, String>
where
    F: FnMut(&str, usize),
{
    let mut results = Vec::new();
    let root = Path::new(dir_path);

    if !root.is_dir() {
        return Err("Not a directory".to_string());
    }

    let entries = fs::read_dir(root).map_err(|e| e.to_string())?;
    let mut total_items = 0;

    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            let is_dir = path.is_dir();

            let mut size = 0;
            if is_dir {
                for dir_entry in WalkDir::new(&path).into_iter().filter_map(|e| e.ok()) {
                    total_items += 1;
                    if total_items % 50 == 0 {
                        on_progress(&dir_entry.path().to_string_lossy(), total_items);
                    }
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
