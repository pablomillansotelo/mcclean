use crate::ScanResult;
use std::fs;
use crate::get_path_size;

pub fn scan_privacy() -> Result<Vec<ScanResult>, String> {
    let mut results = Vec::new();
    let home = match dirs::home_dir() {
        Some(h) => h,
        None => return Err("Home directory not found".to_string()),
    };

    let browsers = vec![
        ("Safari History", home.join("Library/Safari/History.db")),
        ("Chrome History", home.join("Library/Application Support/Google/Chrome/Default/History")),
        ("Firefox History", home.join("Library/Application Support/Firefox/Profiles")),
    ];

    for (name, path) in browsers {
        if path.exists() {
            let size = get_path_size(&path).unwrap_or(0);
            results.push(ScanResult {
                name: name.to_string(),
                path: path.to_string_lossy().to_string(),
                size,
                is_directory: path.is_dir(),
                modified: path.metadata().ok().and_then(|m| m.modified().ok()),
                category: "Privacy".to_string(),
                scan_type: "Browser Data".to_string(),
            });
        }
    }

    Ok(results)
}

pub fn clean_privacy(path: &str) -> Result<bool, String> {
    let p = std::path::Path::new(path);
    if p.exists() {
        if p.is_dir() {
            fs::remove_dir_all(p).map_err(|e| e.to_string())?;
        } else {
            fs::remove_file(p).map_err(|e| e.to_string())?;
        }
        Ok(true)
    } else {
        Ok(false)
    }
}
