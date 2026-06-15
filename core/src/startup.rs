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

    for (dir, item_type) in all_dirs {
        if !dir.exists() {
            continue;
        }

        if let Ok(entries) = fs::read_dir(&dir) {
            for entry in entries.filter_map(|e| e.ok()) {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.ends_with(".plist") {
                    items.push(StartupItem {
                        name,
                        path: entry.path().to_string_lossy().to_string(),
                        r#type: item_type.to_string(),
                        enabled: true, // We would need to parse the plist to find disabled keys
                    });
                }
            }
        }
    }

    Ok(items)
}
