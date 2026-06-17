use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Clone, Serialize, Deserialize)]
pub struct StartupItem {
    pub name: String,
    pub path: String,
    pub r#type: String,
    pub enabled: bool,
}

pub fn scan_startup_items() -> Result<Vec<StartupItem>, String> {
    let mut items = Vec::new();

    let search_dirs = vec![
        ("/Library/LaunchAgents", "LaunchAgent"),
        ("/Library/LaunchDaemons", "LaunchDaemon"),
    ];

    let home = dirs::home_dir().map(|h| h.join("Library/LaunchAgents"));
    let mut all_dirs = search_dirs.into_iter().map(|(p, t)| (std::path::PathBuf::from(p), t)).collect::<Vec<_>>();
    
    if let Some(h) = home {
        all_dirs.push((h, "LaunchAgent"));
    }

    // Get disabled lists
    let uid = std::process::Command::new("id")
        .arg("-u")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "501".to_string());
        
    let gui_disabled = std::process::Command::new("launchctl")
        .arg("print-disabled")
        .arg(format!("gui/{}", uid))
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).into_owned())
        .unwrap_or_default();
    
    let sys_disabled = std::process::Command::new("launchctl")
        .arg("print-disabled")
        .arg("system")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).into_owned())
        .unwrap_or_default();

    let all_disabled_output = format!("{}\n{}", gui_disabled, sys_disabled);

    for (dir, item_type) in all_dirs {
        if !dir.exists() {
            continue;
        }

        if let Ok(entries) = fs::read_dir(&dir) {
            for entry in entries.filter_map(|e| e.ok()) {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.ends_with(".plist") {
                    let label = name.replace(".plist", "");
                    
                    // Check if disabled. If "label" => disabled is in the output, it's disabled.
                    let disabled_marker = format!("\"{}\" => disabled", label);
                    let is_disabled = all_disabled_output.contains(&disabled_marker);

                    items.push(StartupItem {
                        name,
                        path: entry.path().to_string_lossy().to_string(),
                        r#type: item_type.to_string(),
                        enabled: !is_disabled,
                    });
                }
            }
        }
    }

    Ok(items)
}

pub fn toggle_startup_item(path: &str, enable: bool) -> Result<bool, String> {
    let flag = if enable { "load" } else { "unload" };
    
    let output = std::process::Command::new("launchctl")
        .arg(flag)
        .arg("-w") // writes to the overrides database
        .arg(path)
        .output()
        .map_err(|e| format!("Failed to run launchctl: {}", e))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("launchctl error: {}", err));
    }

    Ok(true)
}
