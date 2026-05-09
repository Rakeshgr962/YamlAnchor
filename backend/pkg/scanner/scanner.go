package scanner

import (
	"regexp"
	"strings"
)

type SecretIssue struct {
	Type     string `json:"type"`
	Severity string `json:"severity"` // CRITICAL, HIGH, MEDIUM, LOW
	Message  string `json:"message"`
	Line     int    `json:"line"`
}

type ScanResult struct {
	Clean   bool          `json:"clean"`
	Issues  []SecretIssue `json:"issues"`
}

var secretPatterns = map[string]struct {
	pattern  *regexp.Regexp
	severity string
}{
	"AWS Key": {
		pattern:  regexp.MustCompile(`(?i)(?:aws_access_key_id|aws_secret_access_key).{0,10}['"]?(AKIA[0-9A-Z]{16})['"]?`),
		severity: "CRITICAL",
	},
	"GitHub Token": {
		pattern:  regexp.MustCompile(`(gh[pousr]_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})`),
		severity: "CRITICAL",
	},
	"Generic Password/Secret": {
		pattern:  regexp.MustCompile(`(?i)(password|secret|api_key).{0,10}[:=].{0,5}['"]([^'"]{8,})['"]`),
		severity: "HIGH",
	},
	"Database URL": {
		pattern:  regexp.MustCompile(`(?i)(postgres|mysql|mongodb)(?:\+srv)?:\/\/[^:]+:[^@]+@[^:]+:[^\/]+\/[^?\s]+`),
		severity: "HIGH",
	},
}

func ScanYAML(yamlContent string) ScanResult {
	result := ScanResult{
		Clean:  true,
		Issues: []SecretIssue{},
	}

	lines := strings.Split(yamlContent, "\n")
	for i, line := range lines {
		for name, config := range secretPatterns {
			if matches := config.pattern.FindStringSubmatch(line); len(matches) > 0 {
				// Don't flag empty strings or obvious placeholders
				if len(matches) > 1 && isPlaceholder(matches[1]) {
					continue
				}
				
				result.Issues = append(result.Issues, SecretIssue{
					Type:     name,
					Severity: config.severity,
					Message:  "Found potential " + name + " in configuration",
					Line:     i + 1,
				})
				if config.severity == "CRITICAL" || config.severity == "HIGH" {
					result.Clean = false
				}
			}
		}
	}

	return result
}

func isPlaceholder(value string) bool {
	lower := strings.ToLower(value)
	return strings.Contains(lower, "placeholder") || strings.Contains(lower, "example") || strings.Contains(lower, "your_") || strings.Contains(lower, "changeme") || strings.Contains(lower, "${{")
}
