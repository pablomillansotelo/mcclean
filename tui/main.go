package main

import (
	"fmt"
	"os"

	"mcclean-core/pkg/scanner"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// Define styles
var (
	titleStyle = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#7D56F4")).Padding(1, 2)
	itemStyle  = lipgloss.NewStyle().PaddingLeft(2)
)

type model struct {
	items    []string
	progress float64
	scanning bool
	status   string
}

func initialModel() model {
	return model{
		items:    []string{},
		scanning: false,
		status:   "Press 's' to scan system, 'q' to quit.",
	}
}

type scanMsg struct {
	results []scanner.ScanResult
}

type progressMsg struct {
	text string
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "q", "ctrl+c":
			return m, tea.Quit
		case "s":
			if !m.scanning {
				m.scanning = true
				m.status = "Scanning started..."
				return m, startScan
			}
		}
	case progressMsg:
		m.status = msg.text
		return m, nil
	case scanMsg:
		m.scanning = false
		m.status = fmt.Sprintf("Done! Found %d items.", len(msg.results))
		for _, r := range msg.results {
			m.items = append(m.items, fmt.Sprintf("%s (%d bytes)", r.Name, r.Size))
		}
		return m, nil
	}
	return m, nil
}

func (m model) View() string {
	s := titleStyle.Render("McClean TUI") + "\n\n"
	s += m.status + "\n\n"

	for _, item := range m.items {
		s += itemStyle.Render(item) + "\n"
	}

	return s
}

// Commands
func startScan() tea.Msg {
	// Note: For a real asynchronous TUI, we'd use a channel or handle progress updates better.
	// Since we merged Core as library for TUI, we can call it directly.
	results, err := scanner.ScanSystem(nil)
	if err != nil {
		return progressMsg{text: "Error: " + err.Error()}
	}
	return scanMsg{results: results}
}

func main() {
	p := tea.NewProgram(initialModel())
	if _, err := p.Run(); err != nil {
		fmt.Printf("Alas, there's been an error: %v", err)
		os.Exit(1)
	}
}
