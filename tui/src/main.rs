mod i18n;

use cliclack::{clear_screen, confirm, input, intro, log, multiselect, outro, select, spinner};
use console::{style, Term};
use mcclean_core::{
    brew::scan_brew,
    dev::scan_dev_tools,
    space::deep_analyze_directory,
    scan_system,
    trash::move_to_trash,
};
use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let lang = i18n::Language::current();

    clear_screen()?;
    intro(style(i18n::t("welcome", &lang)).cyan().bold())?;

    loop {
        let choice = select(i18n::t("menu_prompt", &lang))
            .item("dashboard", i18n::t("menu_dashboard", &lang), "")
            .item("system", i18n::t("menu_system", &lang), "")
            .item("dev", i18n::t("menu_dev", &lang), "")
            .item("brew", i18n::t("menu_brew", &lang), "")
            .item("space", i18n::t("menu_space", &lang), "")
            .item("exit", i18n::t("menu_exit", &lang), "")
            .interact()?;

        match choice {
            "dashboard" => {
                let mut s = spinner();
                s.start(i18n::t("scanning_dash", &lang));
                
                let sys_res = scan_system(|_, _| {}).unwrap_or_default();
                let home = std::env::var("HOME").unwrap_or_else(|_| "/".to_string());
                let dev_res = scan_dev_tools(&home).unwrap_or_default();
                let brew_res = scan_brew().unwrap_or_default();
                
                s.stop(i18n::t("scanning_done", &lang));

                let sys_mb = sys_res.iter().map(|i| i.size).sum::<u64>() / 1024 / 1024;
                let dev_mb = dev_res.iter().map(|i| i.size).sum::<u64>() / 1024 / 1024;
                let brew_mb = brew_res.iter().map(|i| i.size).sum::<u64>() / 1024 / 1024;

                log::info(style("Dashboard / Resumen").bold())?;
                log::remark(format!("🧹 {} {} MB", i18n::t("dash_sys", &lang), sys_mb))?;
                log::remark(format!("📦 {} {} MB", i18n::t("dash_dev", &lang), dev_mb))?;
                log::remark(format!("☕ {} {} MB ({} {})", i18n::t("dash_brew", &lang), brew_mb, brew_res.len(), i18n::t("packages", &lang)))?;
            }
            "system" | "dev" => {
                let mut s = spinner();
                s.start(i18n::t("scanning", &lang));

                let results = match choice {
                    "system" => scan_system(|_, _| {}).unwrap_or_default(),
                    "dev" => {
                        let home = std::env::var("HOME").unwrap_or_else(|_| "/".to_string());
                        scan_dev_tools(&home).unwrap_or_default()
                    }
                    _ => Vec::new(),
                };

                s.stop(i18n::t("scanning_done", &lang));

                if results.is_empty() {
                    log::success(i18n::t("no_items", &lang))?;
                    continue;
                }

                // Prepare items for multiselect
                let mut multi = multiselect(i18n::t("select_clean", &lang));
                for r in &results {
                    let label = format!("{} ({} MB)", r.name, r.size / 1024 / 1024);
                    multi = multi.item(r.path.clone(), label, "");
                }

                let selected: Vec<String> = multi.interact()?;

                if selected.is_empty() {
                    log::warning(i18n::t("canceled", &lang))?;
                    continue;
                }

                let should_clean = confirm(i18n::t("confirm_clean", &lang)).interact()?;
                if should_clean {
                    let mut s_clean = spinner();
                    s_clean.start(i18n::t("cleaning", &lang));

                    for path in selected {
                        let _ = move_to_trash(&path);
                    }

                    s_clean.stop(i18n::t("cleaned", &lang));
                    log::success(i18n::t("cleaned", &lang))?;
                } else {
                    log::warning(i18n::t("canceled", &lang))?;
                }
            }
            "brew" => {
                let mut s = spinner();
                s.start(i18n::t("scanning", &lang));
                let mut packages = scan_brew().unwrap_or_default();
                s.stop(i18n::t("scanning_done", &lang));

                // Only allow removing installed packages (leaves/installed)
                packages.retain(|p| p.name.contains("(Installed)"));

                if packages.is_empty() {
                    log::success(i18n::t("no_items", &lang))?;
                    continue;
                }

                let mut multi = multiselect(i18n::t("select_clean", &lang));
                for p in &packages {
                    let label = format!("{} ({} MB)", p.name, p.size / 1024 / 1024);
                    multi = multi.item(p.name.clone(), label, "");
                }

                let selected: Vec<String> = multi.interact()?;

                if selected.is_empty() {
                    log::warning(i18n::t("canceled", &lang))?;
                    continue;
                }

                let should_clean = confirm(i18n::t("confirm_clean", &lang)).interact()?;
                if should_clean {
                    let mut s_clean = spinner();
                    s_clean.start(i18n::t("cleaning", &lang));

                    for pkg in selected {
                        // Uninstall via command
                        let _ = std::process::Command::new("brew").arg("uninstall").arg(&pkg).output();
                    }

                    s_clean.stop(i18n::t("cleaned", &lang));
                    log::success(i18n::t("cleaned", &lang))?;
                }
            }
            "space" => {
                let home = std::env::var("HOME").unwrap_or_else(|_| "/".to_string());
                let folder: String = input(i18n::t("prompt_folder", &lang))
                    .default_input(&home)
                    .interact()?;

                let mut s = spinner();
                s.start(i18n::t("scanning", &lang));
                
                match deep_analyze_directory(&folder, |_, _| {}) {
                    Ok(res) => {
                        s.stop(i18n::t("scanning_done", &lang));
                        
                        let total_size: u64 = res.space_items.iter().map(|i| i.size).sum();
                        let total_mb = total_size / 1024 / 1024;
                        log::info(format!("{} {} ({} MB)", i18n::t("space_title", &lang), folder, total_mb))?;
                        
                        for item in res.space_items.iter().take(10) {
                            let percent = if total_size > 0 {
                                (item.size as f64 / total_size as f64) * 100.0
                            } else {
                                0.0
                            };
                            log::remark(format!("  {} - {} MB ({:.1}%)", item.name, item.size / 1024 / 1024, percent))?;
                        }

                        if !res.duplicates.is_empty() {
                            let dup_count = res.duplicates.len();
                            log::warning(format!("⚠️ {}", i18n::t("dups_found", &lang).replace("{}", &dup_count.to_string())))?;
                        }
                    }
                    Err(e) => {
                        s.stop(i18n::t("scanning_done", &lang));
                        log::error(i18n::t("error", &lang).replace("{}", &e.to_string()))?;
                    }
                }
            }
            "exit" => {
                outro(style(i18n::t("goodbye", &lang)).green())?;
                break;
            }
            _ => unreachable!(),
        }
    }

    Ok(())
}
