package scanner

import (
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

type ScanResult struct {
	Name        string    `json:"name"`
	Path        string    `json:"path"`
	Size        int64     `json:"size"`
	IsDirectory bool      `json:"isDirectory"`
	Modified    time.Time `json:"modified"`
	Category    string    `json:"category"`
	Type        string    `json:"type,omitempty"`
}

type ScanProgressCallback func(currentFile string, itemsProcessed int)

// GetPathSize calculates the size of a file or directory
func GetPathSize(path string) (int64, error) {
	var size int64
	err := filepath.Walk(path, func(_ string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // Skip errors
		}
		if !info.IsDir() {
			size += info.Size()
		}
		return nil
	})
	return size, err
}

// ScanSystem simulates the system scan (Cache, Logs)
func ScanSystem(onProgress ScanProgressCallback) ([]ScanResult, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}

	targets := []struct {
		Name string
		Path string
		Type string
	}{
		{"System Caches", "/Library/Caches", "System Cache"},
		{"System Logs", "/Library/Logs", "System Logs"},
		{"User Logs", filepath.Join(homeDir, "Library/Logs"), "User Logs"},
		{"User Caches", filepath.Join(homeDir, "Library/Caches"), "User Cache"},
	}

	var results []ScanResult
	var mutex sync.Mutex
	var wg sync.WaitGroup

	totalItems := 0

	for _, t := range targets {
		wg.Add(1)
		go func(target struct{ Name, Path, Type string }) {
			defer wg.Done()

			// Check if exists
			if _, err := os.Stat(target.Path); os.IsNotExist(err) {
				return
			}

			entries, err := os.ReadDir(target.Path)
			if err != nil {
				return
			}

			for _, entry := range entries {
				if entry.Name() == "." || entry.Name() == ".." {
					continue
				}

				fullPath := filepath.Join(target.Path, entry.Name())
				info, err := entry.Info()
				if err != nil {
					continue
				}

				size, _ := GetPathSize(fullPath)

				// Report progress (thread-safe ish)
				mutex.Lock()
				totalItems++
				if onProgress != nil && totalItems%5 == 0 {
					onProgress(target.Name, totalItems)
				}

				results = append(results, ScanResult{
					Name:        entry.Name(),
					Path:        fullPath,
					Size:        size,
					IsDirectory: entry.IsDir(),
					Modified:    info.ModTime(),
					Category:    "System Junk",
					Type:        target.Type,
				})
				mutex.Unlock()
			}
		}(t)
	}

	wg.Wait()

	// Sort by size desc
	sort.Slice(results, func(i, j int) bool {
		return results[i].Size > results[j].Size
	})

	return results, nil
}
