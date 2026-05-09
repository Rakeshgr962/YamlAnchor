package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/fusiontech/yaml-anchor/pkg/analyzer"
	"github.com/fusiontech/yaml-anchor/pkg/generator"
	"github.com/fusiontech/yaml-anchor/pkg/improver"
	"github.com/fusiontech/yaml-anchor/pkg/scanner"
	"github.com/fusiontech/yaml-anchor/pkg/simulator"
	"github.com/fusiontech/yaml-anchor/pkg/validator"
)

type AnalyzeRequest struct {
	RepoUrl     string `json:"repoUrl"`
	ProjectPath string `json:"projectPath"`
	MainFile    string `json:"mainFile"`
}

type AnalyzeResponse struct {
	Success       bool                   `json:"success"`
	Message       string                 `json:"message"`
	Data          *analyzer.CodeAnalysis `json:"data,omitempty"`
	GeneratedYaml string                 `json:"generatedYaml,omitempty"`
	Error         string                 `json:"error,omitempty"`
}

func main() {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Routes
	r.Post("/api/analyze", handleAnalyze)
	r.Post("/api/list-dir", handleListDir)
	r.Post("/api/browse-folder", handleBrowseFolder)
	r.Post("/api/save-as", handleSaveAs)
	r.Post("/api/deploy", handleDeploy)
	r.Post("/api/clone", handleClone)
	r.Post("/api/test-local", handleTestLocal)
	r.Post("/api/simulate", handleSimulate)
	r.Post("/api/scan", handleScan)
	r.Post("/api/validate", handleValidate)
	r.Post("/api/improve", handleImprove)

	r.Get("/api/logs", handleGetLogs)
	r.Get("/api/logs/{id}", handleGetLogDetails)
	r.Post("/api/logs", handleAddLog)

	r.Get("/api/repositories", handleGetRepositories)

	port := ":8080"
	fmt.Printf("YamlAnchor Backend Engine running on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, r))
}

type ListDirRequest struct {
	ProjectPath string `json:"projectPath"`
}

type ListDirResponse struct {
	Success bool     `json:"success"`
	Files   []string `json:"files"`
	Error   string   `json:"error,omitempty"`
}

func handleListDir(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req ListDirRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ListDirResponse{Success: false, Error: err.Error()})
		return
	}

	targetPath := req.ProjectPath
	if targetPath == "" {
		targetPath = "."
	}

	var files []string
	err := filepath.WalkDir(targetPath, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		
		// Ignore common massive/system directories
		if d.IsDir() {
			name := d.Name()
			if name == ".git" || name == "node_modules" || name == "vendor" || name == ".next" || name == "dist" || name == "build" {
				return filepath.SkipDir
			}
			return nil
		}
		
		// It's a file
		relPath, relErr := filepath.Rel(targetPath, path)
		if relErr == nil {
			// To keep the dropdown somewhat clean, we can optionally filter by extensions,
			// but for now let's just return the relative path.
			// Convert Windows path separators to forward slashes for clean UI display
			cleanPath := strings.ReplaceAll(relPath, "\\", "/")
			files = append(files, cleanPath)
		}
		return nil
	})

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ListDirResponse{Success: false, Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(ListDirResponse{Success: true, Files: files})
}

type BrowseResponse struct {
	Success bool   `json:"success"`
	Path    string `json:"path"`
	Error   string `json:"error,omitempty"`
}

func handleBrowseFolder(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// PowerShell script to open FolderBrowserDialog
	psScript := `
Add-Type -AssemblyName System.windows.forms
$f = New-Object System.Windows.Forms.FolderBrowserDialog
$f.Description = "Select Project Folder for YamlAnchor"
$f.ShowNewFolderButton = $true
if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
	Write-Output $f.SelectedPath
}
`
	cmd := exec.Command("powershell", "-NoProfile", "-Command", psScript)
	out, err := cmd.Output()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(BrowseResponse{Success: false, Error: err.Error()})
		return
	}

	selectedPath := strings.TrimSpace(string(out))
	if selectedPath == "" {
		// User canceled
		json.NewEncoder(w).Encode(BrowseResponse{Success: false, Error: "User canceled selection"})
		return
	}

	json.NewEncoder(w).Encode(BrowseResponse{Success: true, Path: selectedPath})
}

type SaveAsRequest struct {
	YamlContent string `json:"yamlContent"`
}

type SaveAsResponse struct {
	Success bool   `json:"success"`
	Path    string `json:"path,omitempty"`
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

func handleSaveAs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req SaveAsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(SaveAsResponse{Success: false, Error: err.Error()})
		return
	}

	// PowerShell script to open SaveFileDialog
	psScript := `
Add-Type -AssemblyName System.windows.forms
$f = New-Object System.Windows.Forms.SaveFileDialog
$f.Filter = "YAML Files (*.yml)|*.yml|All Files (*.*)|*.*"
$f.DefaultExt = "yml"
$f.FileName = "anchor.yml"
$f.Title = "Save Pipeline YAML"
if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
	Write-Output $f.FileName
}
`
	cmd := exec.Command("powershell", "-NoProfile", "-Command", psScript)
	out, err := cmd.Output()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(SaveAsResponse{Success: false, Error: err.Error()})
		return
	}

	selectedPath := strings.TrimSpace(string(out))
	if selectedPath == "" {
		json.NewEncoder(w).Encode(SaveAsResponse{Success: false, Error: "User canceled saving"})
		return
	}

	if err := os.WriteFile(selectedPath, []byte(req.YamlContent), 0644); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(SaveAsResponse{Success: false, Error: "Failed to write file: " + err.Error()})
		return
	}

	json.NewEncoder(w).Encode(SaveAsResponse{Success: true, Path: selectedPath, Message: "Successfully saved to " + selectedPath})
}

type DeployRequest struct {
	ProjectPath string `json:"projectPath"`
	YamlContent string `json:"yamlContent"`
}

type DeployResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

func handleDeploy(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req DeployRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(DeployResponse{Success: false, Error: err.Error()})
		return
	}

	targetPath := req.ProjectPath
	if targetPath == "" {
		targetPath = "."
	}

	workflowsDir := filepath.Join(targetPath, ".github", "workflows")
	if err := os.MkdirAll(workflowsDir, 0755); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(DeployResponse{Success: false, Error: "Failed to create directory: " + err.Error()})
		return
	}

	yamlFile := filepath.Join(workflowsDir, "anchor.yml")
	if err := os.WriteFile(yamlFile, []byte(req.YamlContent), 0644); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(DeployResponse{Success: false, Error: "Failed to write file: " + err.Error()})
		return
	}

	log.Printf("[Deploy] Wrote pipeline to %s", yamlFile)
	json.NewEncoder(w).Encode(DeployResponse{Success: true, Message: "Successfully deployed to " + yamlFile})
}

type CloneRequest struct {
	RepoUrl string `json:"repoUrl"`
}

type CloneResponse struct {
	Success bool   `json:"success"`
	Path    string `json:"path,omitempty"`
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

func handleClone(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req CloneRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CloneResponse{Success: false, Error: "Invalid request payload"})
		return
	}

	if req.RepoUrl == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CloneResponse{Success: false, Error: "Repo URL is required"})
		return
	}

	tempDir, err := os.MkdirTemp("", "yaml-anchor-*")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(CloneResponse{Success: false, Error: "Failed to create temp directory: " + err.Error()})
		return
	}

	log.Printf("[Git] Cloning %s into %s", req.RepoUrl, tempDir)
	cmd := exec.Command("git", "clone", req.RepoUrl, tempDir)
	if out, err := cmd.CombinedOutput(); err != nil {
		log.Printf("[Git] Clone failed: %s", string(out))
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(CloneResponse{Success: false, Error: "Git clone failed: " + string(out)})
		return
	}

	log.Printf("[Git] Clone successful.")
	recordRepo(req.RepoUrl, "github", tempDir) // record visit
	json.NewEncoder(w).Encode(CloneResponse{Success: true, Path: tempDir, Message: "Repository cloned successfully"})
}

func handleAnalyze(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req AnalyzeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(AnalyzeResponse{Success: false, Message: "Invalid request payload", Error: err.Error()})
		return
	}

	targetPath := req.ProjectPath
	if targetPath == "" {
		var err error
		targetPath, err = filepath.Abs("../")
		if err != nil {
			targetPath = "."
		}
	}
	// Record local folder visit (only real paths, not temp clones)
	source := "local"
	if strings.Contains(strings.ToLower(targetPath), "yaml-anchor-") {
		source = "github" // cloned temp dirs
	}
	recordRepo(targetPath, source, targetPath)

	log.Printf("[Analyzer] Target path set to: %s, Main File: %s", targetPath, req.MainFile)
	
	analysis, err := analyzer.AnalyzeDirectory(targetPath, req.MainFile)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(AnalyzeResponse{Success: false, Message: "Analysis failed", Error: err.Error()})
		return
	}

	yamlStr, err := generator.GenerateYAML(analysis, "github")
	if err != nil {
		log.Printf("[Generator] Warning: failed to generate YAML: %v", err)
	}

	response := AnalyzeResponse{
		Success:       true,
		Message:       "Repository successfully analyzed.",
		Data:          analysis,
		GeneratedYaml: yamlStr,
	}

	json.NewEncoder(w).Encode(response)
}

type TestLocalRequest struct {
	YamlContent string `json:"yamlContent"`
	Iteration   int    `json:"iteration"`
}

type TestLocalResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

func handleTestLocal(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req TestLocalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(TestLocalResponse{Success: false, Error: "Invalid request"})
		return
	}

	// Brief pause to simulate actual local test execution time
	time.Sleep(1200 * time.Millisecond)

	yaml := req.YamlContent
	issues := analyzeYAMLForIssues(yaml)

	if len(issues) > 0 {
		json.NewEncoder(w).Encode(TestLocalResponse{Success: false, Error: issues[0]})
		return
	}

	json.NewEncoder(w).Encode(TestLocalResponse{Success: true})
}

// analyzeYAMLForIssues inspects the YAML content for real structural and
// environment issues that would cause a local pipeline run to fail.
func analyzeYAMLForIssues(yaml string) []string {
	var issues []string
	lower := strings.ToLower(yaml)

	// 1. npm/node used without setup-node action
	if (strings.Contains(lower, "run: npm") || strings.Contains(lower, "run: npx") || strings.Contains(lower, "run: yarn")) &&
		!strings.Contains(lower, "actions/setup-node") {
		issues = append(issues, "Validation failed: 'npm' is used in a run step but 'actions/setup-node' is missing. Node.js environment is not provisioned.")
	}

	// 2. go test/build used without setup-go action
	if (strings.Contains(lower, "run: go test") || strings.Contains(lower, "run: go build")) &&
		!strings.Contains(lower, "actions/setup-go") {
		issues = append(issues, "Validation failed: 'go' command is used but 'actions/setup-go' is missing. Go toolchain is not provisioned.")
	}

	// 3. python used without setup-python action
	if (strings.Contains(lower, "run: python") || strings.Contains(lower, "run: pip") || strings.Contains(lower, "run: poetry")) &&
		!strings.Contains(lower, "actions/setup-python") {
		issues = append(issues, "Validation failed: Python commands detected but 'actions/setup-python' is missing. Python environment is not provisioned.")
	}

	// 4. docker commands without docker login or docker buildx setup
	if strings.Contains(lower, "docker build") && !strings.Contains(lower, "docker/setup-buildx-action") {
		issues = append(issues, "Validation failed: 'docker build' detected but 'docker/setup-buildx-action' is not configured. Build will fail in a clean runner.")
	}

	// 5. deploy job has no needs — will run in parallel with test, not after
	if strings.Contains(lower, "name: deploy") || strings.Contains(lower, "deploy:") {
		if strings.Contains(lower, "deploy:") && !strings.Contains(lower, "needs:") {
			issues = append(issues, "DAG error: 'deploy' job is defined but has no 'needs:' dependency. It will run concurrently with 'test' instead of after it.")
		}
	}

	// 6. No checkout action — almost always required
	if !strings.Contains(lower, "actions/checkout") {
		issues = append(issues, "Critical: No 'actions/checkout' step found. Pipeline will not have access to the repository source code.")
	}

	// 7. Missing on: triggers
	if !strings.Contains(lower, "on:") && !strings.Contains(lower, "\"on\":") {
		issues = append(issues, "Syntax error: Pipeline has no trigger defined. Add 'on: push' or 'on: pull_request' to activate the workflow.")
	}

	return issues
}

// --- YAML Interaction Handlers ---

type YamlRequest struct {
	YamlContent string `json:"yamlContent"`
}

func handleSimulate(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req YamlRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request payload"})
		return
	}
	result := simulator.RunLocalPipeline(req.YamlContent)
	json.NewEncoder(w).Encode(result)
}

func handleScan(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req YamlRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request payload"})
		return
	}
	result := scanner.ScanYAML(req.YamlContent)
	json.NewEncoder(w).Encode(result)
}

func handleValidate(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req YamlRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request payload"})
		return
	}
	result := validator.ValidateYAML(req.YamlContent)
	json.NewEncoder(w).Encode(result)
}

func handleImprove(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		YamlContent   string `json:"yamlContent"`
		MaxIterations int    `json:"maxIterations"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request payload"})
		return
	}
	if req.MaxIterations <= 0 {
		req.MaxIterations = 3
	}
	result := improver.AutoImprove(req.YamlContent, req.MaxIterations)
	json.NewEncoder(w).Encode(result)
}

// --- Real Execution Log Store ---

type ExecutionLog struct {
	ID       int      `json:"id"`
	Name     string   `json:"name"`
	Date     string   `json:"date"`
	Status   string   `json:"status"`
	Duration string   `json:"duration"`
	Cycles   int      `json:"cycles"`
	Logs     []string `json:"logs"`
}

var (
	logStore   []ExecutionLog
	logStoreMu sync.Mutex
	nextLogID  = 1
)

type AddLogRequest struct {
	Name     string   `json:"name"`
	Status   string   `json:"status"`
	Duration string   `json:"duration"`
	Cycles   int      `json:"cycles"`
	Logs     []string `json:"logs"`
}

func handleAddLog(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req AddLogRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}
	logStoreMu.Lock()
	entry := ExecutionLog{
		ID:       nextLogID,
		Name:     req.Name,
		Date:     time.Now().Format("2006-01-02 15:04"),
		Status:   req.Status,
		Duration: req.Duration,
		Cycles:   req.Cycles,
		Logs:     req.Logs,
	}
	nextLogID++
	logStore = append([]ExecutionLog{entry}, logStore...) // newest first
	logStoreMu.Unlock()
	json.NewEncoder(w).Encode(map[string]any{"success": true, "id": entry.ID})
}

func handleGetLogs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	logStoreMu.Lock()
	defer logStoreMu.Unlock()
	// Return metadata only (no full log lines)
	type LogMeta struct {
		ID       int    `json:"id"`
		Name     string `json:"name"`
		Date     string `json:"date"`
		Status   string `json:"status"`
		Duration string `json:"duration"`
		Cycles   int    `json:"cycles"`
	}
	meta := make([]LogMeta, len(logStore))
	for i, e := range logStore {
		meta[i] = LogMeta{ID: e.ID, Name: e.Name, Date: e.Date, Status: e.Status, Duration: e.Duration, Cycles: e.Cycles}
	}
	json.NewEncoder(w).Encode(meta)
}

func handleGetLogDetails(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	idParam := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid log ID"})
		return
	}
	logStoreMu.Lock()
	defer logStoreMu.Unlock()
	for _, e := range logStore {
		if e.ID == id {
			json.NewEncoder(w).Encode(e)
			return
		}
	}
	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Log not found"})
}

// --- Repository Visit Store ---

type RepoEntry struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Path      string `json:"path"`
	Source    string `json:"source"` // "github" | "gitlab" | "local"
	VisitedAt string `json:"visitedAt"`
}

var (
	repoStore   []RepoEntry
	repoStoreMu sync.Mutex
	nextRepoID  = 1
)

// recordRepo upserts a repo entry — if the path already exists, it updates visitedAt.
func recordRepo(name string, source string, path string) {
	repoStoreMu.Lock()
	defer repoStoreMu.Unlock()

	// Derive a display name
	displayName := name
	if idx := strings.LastIndexAny(name, "/\\"); idx >= 0 {
		displayName = name[idx+1:]
	}
	// Strip trailing .git
	displayName = strings.TrimSuffix(displayName, ".git")
	if displayName == "" {
		displayName = path
	}

	now := time.Now().Format("2006-01-02 15:04")

	// Update if same path already tracked
	for i, e := range repoStore {
		if e.Path == path {
			repoStore[i].VisitedAt = now
			repoStore[i].Name = displayName
			return
		}
	}

	// Prepend (newest first)
	entry := RepoEntry{
		ID:        nextRepoID,
		Name:      displayName,
		Path:      path,
		Source:    source,
		VisitedAt: now,
	}
	nextRepoID++
	repoStore = append([]RepoEntry{entry}, repoStore...)
}

func handleGetRepositories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	repoStoreMu.Lock()
	defer repoStoreMu.Unlock()
	json.NewEncoder(w).Encode(repoStore)
}
