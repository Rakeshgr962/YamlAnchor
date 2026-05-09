package analyzer

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

// CodeAnalysis represents the output of the project parsing phase.
type CodeAnalysis struct {
	Language        string            `json:"language"`
	Version         string            `json:"version"`
	Dependencies    []string          `json:"dependencies"`
	DevDependencies []string          `json:"devDependencies"`
	Scripts         map[string]string `json:"scripts"`
	Tests           []string          `json:"tests"`
	Dockerfile      bool              `json:"dockerfile"`
	ExistingCI      map[string]string `json:"existingCI,omitempty"`
	ProjectTree     []string          `json:"projectTree"`
}

// AnalyzeDirectory scans a target directory and determines the tech stack.
func AnalyzeDirectory(targetPath string, mainFile string) (*CodeAnalysis, error) {
	analysis := &CodeAnalysis{
		Language:        "Unknown",
		Dependencies:    []string{},
		DevDependencies: []string{},
		Scripts:         make(map[string]string),
		Tests:           []string{},
		ExistingCI:      make(map[string]string),
		ProjectTree:     []string{},
	}

	// 1. Check for Node.js (package.json)
	packageJsonPath := filepath.Join(targetPath, "package.json")
	if _, err := os.Stat(packageJsonPath); err == nil {
		analysis.Language = "Node.js"
		if data, err := ioutil.ReadFile(packageJsonPath); err == nil {
			var pkg struct {
				Dependencies    map[string]string `json:"dependencies"`
				DevDependencies map[string]string `json:"devDependencies"`
				Scripts         map[string]string `json:"scripts"`
			}
			if err := json.Unmarshal(data, &pkg); err == nil {
				for dep := range pkg.Dependencies {
					analysis.Dependencies = append(analysis.Dependencies, dep)
				}
				for dep := range pkg.DevDependencies {
					analysis.DevDependencies = append(analysis.DevDependencies, dep)
				}
				analysis.Scripts = pkg.Scripts
				if _, ok := pkg.Scripts["test"]; ok {
					analysis.Tests = append(analysis.Tests, "npm test")
				}
			}
		}
	}

	// 2. Check for Go (go.mod)
	goModPath := filepath.Join(targetPath, "go.mod")
	if _, err := os.Stat(goModPath); err == nil {
		if analysis.Language == "Unknown" {
			analysis.Language = "Go"
		} else {
			analysis.Language += " + Go"
		}
		analysis.Tests = append(analysis.Tests, "go test ./...")
	}

	// 3. Check for Dockerfile
	dockerfilePath := filepath.Join(targetPath, "Dockerfile")
	if _, err := os.Stat(dockerfilePath); err == nil {
		analysis.Dockerfile = true
	}

	// 4. Check for Python (requirements.txt, pyproject.toml)
	reqPath := filepath.Join(targetPath, "requirements.txt")
	pyprojectPath := filepath.Join(targetPath, "pyproject.toml")
	_, errReq := os.Stat(reqPath)
	_, errPy := os.Stat(pyprojectPath)
	if errReq == nil || errPy == nil {
		if analysis.Language == "Unknown" {
			analysis.Language = "Python"
		} else {
			analysis.Language += " + Python"
		}
		analysis.Tests = append(analysis.Tests, "pytest")
	}

	// 5. Fallback: Infer language from MainFile extension if still Unknown
	if analysis.Language == "Unknown" && mainFile != "" {
		if strings.HasSuffix(mainFile, ".go") {
			analysis.Language = "Go"
			analysis.Tests = append(analysis.Tests, "go test ./...")
		} else if strings.HasSuffix(mainFile, ".js") || strings.HasSuffix(mainFile, ".ts") {
			analysis.Language = "Node.js"
			analysis.Tests = append(analysis.Tests, "npm test")
		} else if strings.HasSuffix(mainFile, ".py") {
			analysis.Language = "Python"
			analysis.Tests = append(analysis.Tests, "pytest")
		}
	}

	// 5. Gather existing CI configuration
	githubCIPath := filepath.Join(targetPath, ".github", "workflows")
	if files, err := ioutil.ReadDir(githubCIPath); err == nil {
		for _, f := range files {
			if !f.IsDir() && (strings.HasSuffix(f.Name(), ".yml") || strings.HasSuffix(f.Name(), ".yaml")) {
				content, _ := ioutil.ReadFile(filepath.Join(githubCIPath, f.Name()))
				analysis.ExistingCI[".github/workflows/"+f.Name()] = string(content)
			}
		}
	}
	gitlabCIPath := filepath.Join(targetPath, ".gitlab-ci.yml")
	if content, err := ioutil.ReadFile(gitlabCIPath); err == nil {
		analysis.ExistingCI[".gitlab-ci.yml"] = string(content)
	}

	// 6. Gather simple project tree (max depth 2 for simplicity)
	filepath.Walk(targetPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() && (info.Name() == ".git" || info.Name() == "node_modules") {
			return filepath.SkipDir
		}
		rel, _ := filepath.Rel(targetPath, path)
		if rel != "." && !strings.Contains(rel, string(os.PathSeparator)) {
			analysis.ProjectTree = append(analysis.ProjectTree, rel)
		}
		return nil
	})

	return analysis, nil
}
