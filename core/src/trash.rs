use std::fs;
use std::process::Command;

pub fn get_trash_size() -> Result<u64, String> {
    let home = match dirs::home_dir() {
        Some(h) => h,
        None => return Err("Home directory not found".to_string()),
    };

    let trash_path = home.join(".Trash");
    if trash_path.exists() {
        crate::get_path_size(&trash_path).map_err(|e| e.to_string())
    } else {
        Ok(0)
    }
}

pub fn move_to_trash(path: &str) -> Result<bool, String> {
    // Intercept special virtual paths
    if path.starts_with("docker:image:") {
        let id = path.replace("docker:image:", "");
        return Command::new("docker").arg("rmi").arg("-f").arg(&id).status().map(|s| s.success()).map_err(|e| e.to_string());
    } else if path.starts_with("docker:container:") {
        let id = path.replace("docker:container:", "");
        return Command::new("docker").arg("rm").arg("-f").arg(&id).status().map(|s| s.success()).map_err(|e| e.to_string());
    } else if path.starts_with("podman:image:") {
        let id = path.replace("podman:image:", "");
        return Command::new("podman").arg("rmi").arg("-f").arg(&id).status().map(|s| s.success()).map_err(|e| e.to_string());
    } else if path.starts_with("podman:container:") {
        let id = path.replace("podman:container:", "");
        return Command::new("podman").arg("rm").arg("-f").arg(&id).status().map(|s| s.success()).map_err(|e| e.to_string());
    } else if path.starts_with("nix:pkg:") {
        let pkg = path.replace("nix:pkg:", "");
        return Command::new("nix-env").arg("-e").arg(&pkg).status().map(|s| s.success()).map_err(|e| e.to_string());
    } else if path == "nix:gc:" {
        return Command::new("nix-collect-garbage").arg("-d").status().map(|s| s.success()).map_err(|e| e.to_string());
    }

    let home = match dirs::home_dir() {
        Some(h) => h,
        None => return Err("Home directory not found".to_string()),
    };

    let target_path = std::path::Path::new(path);
    if !target_path.exists() {
        return Ok(false);
    }

    let trash_path = home.join(".Trash");
    let file_name = target_path.file_name().unwrap_or_default();
    
    // Simple move to ~/.Trash (real impl might need to handle collisions)
    let dest_path = trash_path.join(file_name);
    
    fs::rename(target_path, dest_path).map_err(|e| format!("Failed to move to trash: {}", e))?;
    
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_trash_size() {
        let size = get_trash_size();
        assert!(size.is_ok());
    }
}
