package server

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"mcclean-core/pkg/scanner"
	"mcclean-core/pkg/types"
	"os"
)

type Server struct {
	input  io.Reader
	output io.Writer
}

func NewServer() *Server {
	return &Server{
		input:  os.Stdin,
		output: os.Stdout,
	}
}

func (s *Server) Start() {
	scanner := bufio.NewScanner(s.input)
	for scanner.Scan() {
		line := scanner.Bytes()
		s.handleMessage(line)
	}
}

func (s *Server) handleMessage(data []byte) {
	var req types.Request
	if err := json.Unmarshal(data, &req); err != nil {
		s.sendError("", "Invalid JSON parse error")
		return
	}

	// Route methods
	switch req.Method {
	case "scan-system":
		// Notify start
		s.sendEvent("scan-progress", types.ScanProgressData{
			ScanID:   "system",
			Progress: 0,
			Status:   "Starting System Scan...",
		})

		go func() {
			results, err := scanner.ScanSystem(func(current string, count int) {
				s.sendEvent("scan-progress", types.ScanProgressData{
					ScanID:   "system",
					Progress: 0, // Todo: calculate real percentage
					Status:   fmt.Sprintf("Scanning %s...", current),
				})
			})

			if err != nil {
				s.sendError(req.ID, err.Error())
				return
			}

			s.sendResponse(req.ID, results)

			// Notify done
			s.sendEvent("scan-progress", types.ScanProgressData{
				ScanID:   "system",
				Progress: 100,
				Status:   "Done",
			})
		}()

	case "ping":
		s.sendResponse(req.ID, "pong")

	default:
		s.sendError(req.ID, "Method not found: "+req.Method)
	}
}

func (s *Server) sendResponse(id string, result interface{}) {
	resp := types.Response{
		ID:     id,
		Result: result,
	}
	s.writeJSON(resp)
}

func (s *Server) sendError(id string, errMsg string) {
	resp := types.Response{
		ID:    id,
		Error: errMsg,
	}
	s.writeJSON(resp)
}

func (s *Server) sendEvent(eventType string, data interface{}) {
	evt := types.Event{
		Type: eventType,
		Data: data,
	}
	s.writeJSON(evt)
}

func (s *Server) writeJSON(v interface{}) {
	bytes, err := json.Marshal(v)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error marshalling JSON: %v\n", err)
		return
	}
	// Append newline to delimit messages
	fmt.Fprintf(s.output, "%s\n", bytes)
}
