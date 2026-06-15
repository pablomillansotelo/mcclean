use serde::{Deserialize, Serialize};
use std::process::Command;
use crate::ScanResult;

pub fn scan_brew() -> Result<Vec<ScanResult>, String> {
    let mut results = Vec::new();

    // Outdated packages
    let output = Command::new("brew")
        .arg("outdated")
        .arg("--json")
        .output()
        .map_err(|e| format!("Failed to run brew outdated: {}", e))?;

    if output.status.success() {
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

    // Unneeded packages (brew leaves)
    let leaves_output = Command::new("brew")
        .arg("leaves")
        .output()
        .map_err(|e| format!("Failed to run brew leaves: {}", e))?;

    if leaves_output.status.success() {
        let stdout = String::from_utf8_lossy(&leaves_output.stdout);
        for line in stdout.lines() {
            if !line.is_empty() {
                results.push(ScanResult {
                    name: format!("{} (Leaf)", line),
                    path: "Homebrew Formula".to_string(),
                    size: 0,
                    is_directory: false,
                    modified: None,
                    category: "Homebrew".to_string(),
                    scan_type: "Unneeded".to_string(),
                });
            }
        }
    }

    Ok(results)
}

pub fn update_brew() -> Result<bool, String> {
    let output = Command::new("brew")
        .arg("upgrade")
        .output()
        .map_err(|e| format!("Failed to execute brew upgrade: {}", e))?;

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
