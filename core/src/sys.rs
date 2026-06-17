use serde::{Deserialize, Serialize};
use sysinfo::{System, Disks};

#[derive(Clone, Serialize, Deserialize)]
pub struct SystemStats {
    pub memory: MemoryStats,
    pub cpu: CpuStats,
    pub disk: DiskStats,
    pub uptime: u64,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct DiskStats {
    pub free: u64,
    pub total: u64,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct MemoryStats {
    pub free: u64,
    pub total: u64,
    pub used: u64,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct CpuStats {
    pub load: f32,
    pub cores: usize,
    pub model: String,
}

pub fn get_system_stats() -> Result<SystemStats, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    let disks = Disks::new_with_refreshed_list();
    
    let total_memory = sys.total_memory();
    let used_memory = sys.used_memory();
    
    let cpus = sys.cpus();
    let cores = cpus.len();
    let mut total_load = 0.0;
    let mut model = String::new();
    
    if cores > 0 {
        for cpu in cpus {
            total_load += cpu.cpu_usage();
            if model.is_empty() {
                model = cpu.brand().to_string();
            }
        }
        total_load /= cores as f32;
    }

    let mut total_disk = 0;
    let mut free_disk = 0;
    
    for disk in &disks {
        total_disk += disk.total_space();
        free_disk += disk.available_space();
    }

    Ok(SystemStats {
        memory: MemoryStats {
            free: total_memory - used_memory,
            total: total_memory,
            used: used_memory,
        },
        cpu: CpuStats {
            load: total_load,
            cores,
            model,
        },
        disk: DiskStats {
            free: free_disk,
            total: total_disk,
        },
        uptime: System::uptime(),
    })
}

#[derive(Clone, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub memory: u64,
    pub cpu: f32,
}

pub fn get_processes() -> Result<Vec<ProcessInfo>, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    let mut processes = Vec::new();
    
    for (pid, process) in sys.processes() {
        processes.push(ProcessInfo {
            pid: pid.as_u32(),
            name: process.name().to_string(),
            memory: process.memory(),
            cpu: process.cpu_usage(),
        });
    }
    
    // Sort by memory descending
    processes.sort_by(|a, b| b.memory.cmp(&a.memory));
    
    Ok(processes)
}

pub fn kill_process(pid: u32) -> Result<bool, String> {
    let mut sys = System::new_all();
    sys.refresh_processes();
    
    let pid_sysinfo = sysinfo::Pid::from_u32(pid);
    if let Some(process) = sys.process(pid_sysinfo) {
        Ok(process.kill())
    } else {
        Err(format!("Process with PID {} not found", pid))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_system_stats_runs() {
        let stats = get_system_stats().unwrap();
        assert!(stats.memory.total > 0);
        assert!(stats.cpu.cores > 0);
        assert!(!stats.cpu.model.is_empty());
    }
    
    #[test]
    fn test_get_processes() {
        let processes = get_processes().unwrap();
        assert!(!processes.is_empty());
    }
}
