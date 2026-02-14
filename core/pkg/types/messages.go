package types

// Request represents a command sent from the Client (UI/TUI) to the Core
type Request struct {
	ID     string      `json:"id"`
	Method string      `json:"method"`
	Params interface{} `json:"params,omitempty"`
}

// Response represents a direct answer to a Request
type Response struct {
	ID     string      `json:"id"`
	Result interface{} `json:"result,omitempty"`
	Error  string      `json:"error,omitempty"`
}

// Event represents an asynchronous update (progress, status change)
type Event struct {
	Type string      `json:"type"` // e.g., "scan-progress"
	Data interface{} `json:"data"`
}

// ScanProgressReq payload
type ScanProgressData struct {
	ScanID   string  `json:"scanId"`
	Progress float64 `json:"progress"`
	Status   string  `json:"status"`
}
