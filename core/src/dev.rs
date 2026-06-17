use crate::ScanResult;
use std::process::Command;
use walkdir::WalkDir;
use std::path::Path;

fn parse_size(size_str: &str) -> u64 {
    let size_str = size_str.trim().to_uppercase();
    if size_str.ends_with("GB") {
        let val: f64 = size_str.replace("GB", "").trim().parse().unwrap_or(0.0);
        (val * 1024.0 * 1024.0 * 1024.0) as u64
    } else if size_str.ends_with("MB") {
        let val: f64 = size_str.replace("MB", "").trim().parse().unwrap_or(0.0);
        (val * 1024.0 * 1024.0) as u64
    } else if size_str.ends_with("KB") {
        let val: f64 = size_str.replace("KB", "").trim().parse().unwrap_or(0.0);
        (val * 1024.0) as u64
    } else if size_str.ends_with("B") {
        let val: f64 = size_str.replace("B", "").trim().parse().unwrap_or(0.0);
        val as u64
    } else {
        0
    }
}

fn get_dir_size(path: &Path) -> u64 {
    WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter_map(|e| e.metadata().ok())
        .filter(|m| m.is_file())
        .map(|m| m.len())
        .sum()
}

pub fn scan_dev_tools(base_path: &str) -> Result<Vec<ScanResult>, String> {
    let mut results = Vec::new();
    
    // 1. Local Filesystem Scan
    let path = Path::new(base_path);
    if path.exists() {
        let mut it = WalkDir::new(path).into_iter();
        while let Some(Ok(entry)) = it.next() {
            if !entry.file_type().is_dir() {
                continue;
            }
            
            let name = entry.file_name().to_string_lossy().to_string();
            
            // Skip hidden folders unless it's .venv or .gradle or .dart_tool
            if name.starts_with('.') && !matches!(name.as_str(), ".venv" | ".gradle" | ".dart_tool") {
                if entry.depth() > 0 {
                    it.skip_current_dir();
                }
                continue;
            }

            let mut matched_type = None;
            
            match name.as_str() {
                "node_modules" => matched_type = Some("Node"),
                "target" => {
                    // Check if Cargo.toml is in parent to ensure it's a Rust target
                    if entry.path().parent().map(|p| p.join("Cargo.toml").exists()).unwrap_or(false) {
                        matched_type = Some("Rust");
                    }
                },
                "vendor" => {
                    if entry.path().parent().map(|p| p.join("composer.json").exists() || p.join("go.mod").exists()).unwrap_or(false) {
                        matched_type = Some("Vendor (PHP/Go)");
                    }
                },
                "Pods" => matched_type = Some("iOS (CocoaPods)"),
                ".gradle" | "build" => {
                    if entry.path().parent().map(|p| p.join("build.gradle").exists() || p.join("settings.gradle").exists() || p.join("build.gradle.kts").exists()).unwrap_or(false) {
                        matched_type = Some("Java/Android");
                    }
                },
                ".dart_tool" => matched_type = Some("Flutter"),
                "venv" | ".venv" => {
                    if entry.path().join("bin").join("python").exists() || entry.path().join("Scripts").join("python.exe").exists() {
                        matched_type = Some("Python Venv");
                    }
                },
                _ => {}
            }

            if let Some(t) = matched_type {
                let size = get_dir_size(entry.path());
                results.push(ScanResult {
                    name: entry.path().file_name().unwrap_or_default().to_string_lossy().into_owned(),
                    path: entry.path().to_string_lossy().into_owned(),
                    size,
                    r#type: Some(t.to_string()),
                    category: "Developer Tools".to_string(),
                    last_accessed: None,
                    is_safe_to_delete: true,
                });
                it.skip_current_dir(); // Don't scan inside node_modules etc
            }
        }
    }

    // 2. Docker & Podman scanning
    for engine in ["docker", "podman"] {
        // Images
        if let Ok(output) = Command::new(engine).arg("images").arg("--format").arg("{{.ID}}|{{.Repository}}:{{.Tag}}|{{.Size}}").output() {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                for line in stdout.lines() {
                    let parts: Vec<&str> = line.split('|').collect();
                    if parts.len() == 3 {
                        let id = parts[0].trim();
                        let repo = parts[1].trim();
                        let size_str = parts[2].trim();
                        results.push(ScanResult {
                            name: format!("{} Image: {}", engine, repo),
                            path: format!("{}:image:{}", engine, id),
                            size: parse_size(size_str),
                            r#type: Some(if engine == "docker" { "Docker Image".to_string() } else { "Podman Image".to_string() }),
                            category: "Developer Tools".to_string(),
                            last_accessed: None,
                            is_safe_to_delete: true,
                        });
                    }
                }
            }
        }
        
        // Containers
        if let Ok(output) = Command::new(engine).arg("ps").arg("-a").arg("--format").arg("{{.ID}}|{{.Names}}|{{.Size}}|{{.State}}").output() {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                for line in stdout.lines() {
                    let parts: Vec<&str> = line.split('|').collect();
                    if parts.len() == 4 {
                        let id = parts[0].trim();
                        let names = parts[1].trim();
                        let size_str = parts[2].trim();
                        let state = parts[3].trim().to_lowercase();
                        
                        let is_running = state.contains("running") || state.contains("up");
                        let actual_size_str = size_str.split(' ').next().unwrap_or("0B");
                        
                        results.push(ScanResult {
                            name: format!("{} Container: {} {}", engine, names, if is_running { "(Corriendo)" } else { "(Detenido)" }),
                            path: format!("{}:container:{}", engine, id),
                            size: parse_size(actual_size_str),
                            r#type: Some(if is_running { format!("{} Running", engine) } else { format!("{} Container", engine) }),
                            category: "Developer Tools".to_string(),
                            last_accessed: None,
                            is_safe_to_delete: !is_running,
                        });
                    }
                }
            }
        }
    }

    // 3. Nix environments
    if let Ok(output) = Command::new("nix-env").arg("-q").output() {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                if !line.trim().is_empty() {
                    results.push(ScanResult {
                        name: format!("Nix Package: {}", line.trim()),
                        path: format!("nix:pkg:{}", line.trim()),
                        size: 0,
                        r#type: Some("Nix Env".to_string()),
                        category: "Developer Tools".to_string(),
                        last_accessed: None,
                        is_safe_to_delete: true,
                    });
                }
            }
        }
    }
    
    // Add Nix GC dummy item
    if Command::new("nix-env").arg("--version").output().is_ok() {
        results.push(ScanResult {
            name: "Nix Garbage Collection (Limpiar Generaciones Viejas)".to_string(),
            path: "nix:gc:".to_string(),
            size: 0,
            r#type: Some("Nix GC".to_string()),
            category: "Developer Tools".to_string(),
            last_accessed: None,
            is_safe_to_delete: true,
        });
    }

    Ok(results)
}
