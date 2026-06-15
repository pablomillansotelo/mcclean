use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::fs::File;
use std::io::{self, Read};
use std::path::PathBuf;
use walkdir::WalkDir;

#[derive(Clone, Serialize, Deserialize)]
pub struct DuplicateGroup {
    pub hash: String,
    pub size: u64,
    pub files: Vec<DuplicateFile>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct DuplicateFile {
    pub path: String,
    pub name: String,
    pub modified: String,
}

fn hash_file(path: &str) -> io::Result<String> {
    let mut file = File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0; 8192];

    loop {
        let count = file.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        hasher.update(&buffer[..count]);
    }

    Ok(hex::encode(hasher.finalize()))
}

pub fn scan_duplicates(target_path: Option<String>) -> Result<Vec<DuplicateGroup>, String> {
    let mut size_map: HashMap<u64, Vec<PathBuf>> = HashMap::new();

    let paths_to_scan = match target_path {
        Some(p) => vec![PathBuf::from(p)],
        None => {
            if let Some(home) = dirs::home_dir() {
                vec![home.join("Downloads"), home.join("Documents")]
            } else {
                return Err("Home directory not found".to_string());
            }
        }
    };

    for base_path in paths_to_scan {
        if !base_path.exists() {
            continue;
        }

        // Limit depth to 3 to avoid extremely long scans
        for entry in WalkDir::new(&base_path).max_depth(3).into_iter().filter_map(|e| e.ok()) {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    let size = metadata.len();
                    // Ignore tiny files < 10KB
                    if size > 10 * 1024 {
                        size_map.entry(size).or_insert_with(Vec::new).push(entry.path().to_path_buf());
                    }
                }
            }
        }
    }

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

    let mut result = Vec::new();

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

            result.push(DuplicateGroup {
                hash,
                size: group_size,
                files: duplicate_files,
            });
        }
    }

    Ok(result)
}
