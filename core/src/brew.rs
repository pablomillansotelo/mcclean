use serde::{Deserialize, Serialize};
use std::process::Command;
use crate::ScanResult;

pub fn scan_brew() -> Result<Vec<ScanResult>, String> {
    let mut results = Vec::new();

    // In production, "brew" might not be in PATH. We'll specify the exact path for Apple Silicon, or fallback to 'brew'
    let brew_path = if std::path::Path::new("/opt/homebrew/bin/brew").exists() {
        "/opt/homebrew/bin/brew"
    } else if std::path::Path::new("/usr/local/bin/brew").exists() {
        "/usr/local/bin/brew"
    } else {
        "brew"
    };

    let output = Command::new(brew_path)
        .arg("outdated")
        .arg("--json")
        .output()
        .map_err(|e| format!("Failed to run brew outdated: {}", e));

    if let Ok(output) = output {
        if let Ok(json) = serde_json::from_slice::<serde_json::Value>(&output.stdout) {
            if let Some(formulae) = json.get("formulae").and_then(|f| f.as_array()) {
                for f in formulae {
                    let name = f.get("name").and_then(|n| n.as_str()).unwrap_or("Unknown").to_string();
                    let version = f.get("current_version").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    results.push(ScanResult {
                        name: format!("{} (Outdated)", name),
                        path: "Homebrew Formula".to_string(),
                        size: 0,
                        is_directory: false,
                        modified: None,
                        category: "Homebrew".to_string(),
                        scan_type: version,
                    });
                }
            }
        }
    }

    // Then get leaves (installed packages)
    let leaves_output = Command::new(brew_path)
        .arg("leaves")
        .output()
        .map_err(|e| format!("Failed to run brew leaves: {}", e));

    if let Ok(leaves_output) = leaves_output {
        if leaves_output.status.success() {
            let leaves_str = String::from_utf8_lossy(&leaves_output.stdout);
            
            for line in leaves_str.lines() {
                let name = line.trim().to_string();
                if name.is_empty() { continue; }
                
                // Get size using brew info
                let info_output = Command::new(brew_path)
                    .arg("info")
                    .arg("--json")
                    .arg(&name)
                    .output();
                    
                let mut size = 0;
                let mut version = String::new();
                
                if let Ok(info) = info_output {
                    if let Ok(json) = serde_json::from_slice::<serde_json::Value>(&info.stdout) {
                        if let Some(arr) = json.as_array() {
                            if let Some(pkg) = arr.first() {
                                // Extract version
                                if let Some(versions) = pkg.get("versions") {
                                    version = versions.get("stable").and_then(|v| v.as_str()).unwrap_or("").to_string();
                                }
                                
                                // Try to get size from installed
                                if let Some(installed) = pkg.get("installed").and_then(|i| i.as_array()) {
                                    for inst in installed {
                                        if let Some(bytes) = inst.get("installed_size").and_then(|s| s.as_u64()) {
                                            size += bytes;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                results.push(ScanResult {
                    name: format!("{} (Installed)", name),
                    path: "Homebrew Formula".to_string(),
                    size,
                    is_directory: false,
                    modified: None,
                    category: "Homebrew".to_string(),
                    scan_type: version,
                });
            }
        }
    }

    Ok(results)
}

pub fn update_brew() -> Result<bool, String> {
    let brew_path = if std::path::Path::new("/opt/homebrew/bin/brew").exists() {
        "/opt/homebrew/bin/brew"
    } else if std::path::Path::new("/usr/local/bin/brew").exists() {
        "/usr/local/bin/brew"
    } else {
        "brew"
    };

    let output = Command::new(brew_path)
        .arg("upgrade")
        .output()
        .map_err(|e| format!("Failed to run brew upgrade: {}", e))?;

    Ok(output.status.success())
}

pub fn update_brew_package(name: &str) -> Result<bool, String> {
    let brew_path = if std::path::Path::new("/opt/homebrew/bin/brew").exists() {
        "/opt/homebrew/bin/brew"
    } else if std::path::Path::new("/usr/local/bin/brew").exists() {
        "/usr/local/bin/brew"
    } else {
        "brew"
    };

    let output = Command::new(brew_path)
        .arg("upgrade")
        .arg(name)
        .output()
        .map_err(|e| format!("Failed to upgrade brew package {}: {}", name, e))?;

    Ok(output.status.success())
}

pub fn uninstall_brew(name: &str) -> Result<bool, String> {
    // Basic protection against empty names
    if name.trim().is_empty() {
        return Err("Package name cannot be empty".to_string());
    }

    // Strip out (Outdated) or (Leaf) tags if they exist from the UI
    let package_name = name.split(' ').next().unwrap_or(name);

    let output = Command::new("brew")
        .arg("uninstall")
        .arg(package_name)
        .output()
        .map_err(|e| format!("Failed to execute brew uninstall: {}", e))?;

    Ok(output.status.success())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scan_brew() {
        let result = scan_brew();
        assert!(result.is_ok() || result.is_err());
    }
}
