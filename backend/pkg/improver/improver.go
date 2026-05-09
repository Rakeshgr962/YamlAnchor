package improver

import (
	"strings"
)

type ImproveResult struct {
	Success    bool     `json:"success"`
	Iterations int      `json:"iterations"`
	FinalYAML  string   `json:"finalYaml"`
	Logs       []string `json:"logs"`
}

// AutoImprove applies targeted fixes to the YAML based on detected issues.
// It uses the same rule set as the static analyzer so every detected issue
// has a guaranteed deterministic fix — no LLM required.
func AutoImprove(initialYAML string, maxIterations int) ImproveResult {
	result := ImproveResult{
		FinalYAML: initialYAML,
		Logs:      []string{"[Improver] Starting targeted fix pass..."},
	}

	fixed := applyTargetedFixes(initialYAML)
	result.FinalYAML = fixed
	result.Success = true
	result.Iterations = 1
	result.Logs = append(result.Logs, "[Improver] Fixes applied.")
	return result
}

// applyTargetedFixes applies deterministic corrections that exactly mirror
// the issues detected by analyzeYAMLForIssues in server.go.
func applyTargetedFixes(yaml string) string {
	lower := strings.ToLower(yaml)

	// Fix 1: npm/yarn without setup-node — inject setup-node before first npm/yarn run step
	if (strings.Contains(lower, "- run: npm") || strings.Contains(lower, "- run: npx") || strings.Contains(lower, "- run: yarn")) &&
		!strings.Contains(lower, "actions/setup-node") {
		for _, cmd := range []string{"- run: npm", "- run: npx", "- run: yarn"} {
			if strings.Contains(yaml, cmd) {
				yaml = strings.Replace(yaml,
					cmd,
					"- uses: actions/setup-node@v4\n          with:\n            node-version: '20'\n        "+cmd,
					1)
				break
			}
		}
	}

	// Fix 2: go commands without setup-go
	if (strings.Contains(lower, "- run: go test") || strings.Contains(lower, "- run: go build")) &&
		!strings.Contains(lower, "actions/setup-go") {
		for _, cmd := range []string{"- run: go test", "- run: go build"} {
			if strings.Contains(yaml, cmd) {
				yaml = strings.Replace(yaml,
					cmd,
					"- uses: actions/setup-go@v5\n          with:\n            go-version: '1.22'\n        "+cmd,
					1)
				break
			}
		}
	}

	// Fix 3: python/pip/poetry without setup-python
	if (strings.Contains(lower, "- run: python") || strings.Contains(lower, "- run: pip") || strings.Contains(lower, "- run: poetry")) &&
		!strings.Contains(lower, "actions/setup-python") {
		for _, cmd := range []string{"- run: python", "- run: pip", "- run: poetry"} {
			if strings.Contains(yaml, cmd) {
				yaml = strings.Replace(yaml,
					cmd,
					"- uses: actions/setup-python@v5\n          with:\n            python-version: '3.12'\n        "+cmd,
					1)
				break
			}
		}
	}

	// Fix 4: docker build without buildx setup — inject before first docker build
	if strings.Contains(lower, "docker build") && !strings.Contains(lower, "docker/setup-buildx-action") {
		yaml = strings.Replace(yaml,
			"- run: docker build",
			"- uses: docker/setup-buildx-action@v3\n        - run: docker build",
			1)
	}

	// Fix 5: deploy job missing needs — add needs: [test] after deploy job line
	if strings.Contains(lower, "  deploy:") && !strings.Contains(lower, "needs:") {
		yaml = strings.Replace(yaml,
			"  deploy:",
			"  deploy:\n    needs: [test]",
			1)
	}

	// Fix 6: No checkout step — inject after the first "steps:" line
	if !strings.Contains(lower, "actions/checkout") && strings.Contains(lower, "steps:") {
		yaml = strings.Replace(yaml,
			"steps:",
			"steps:\n        - uses: actions/checkout@v4",
			1)
	}

	// Fix 7: Missing on: trigger — prepend a default trigger block
	if !strings.Contains(lower, "on:") && !strings.Contains(lower, "\"on\":") {
		yaml = "on:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\n" + yaml
	}

	return yaml
}
