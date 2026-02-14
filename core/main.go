package main

import (
	"flag"
	"fmt"
	"mcclean-core/pkg/server"
	"os"
)

func main() {
	// Flags definition
	scanSystem := flag.Bool("scan-system", false, "Run a system scan immediately")
	serverMode := flag.Bool("server", false, "Run in persistent JSON server mode (for UI/TUI)")

	flag.Parse()

	if *serverMode {
		srv := server.NewServer()
		srv.Start()
		return
	}

	if *scanSystem {
		fmt.Println("Scanning system (CLI mode not fully implemented yet)...")
		// TODO: Call scanner directly
		return
	}

	// Default help
	fmt.Println("McClean Core v0.1.0")
	flag.PrintDefaults()
	os.Exit(0)
}
