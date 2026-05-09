package validator

import (
	"strings"

	"gopkg.in/yaml.v3"
)

type ValidationResult struct {
	Valid  bool     `json:"valid"`
	Errors []string `json:"errors"`
}

type Node struct {
	Name  string
	Needs []string
}

// ValidateYAML checks syntax and job dependencies (DAG)
func ValidateYAML(yamlContent string) ValidationResult {
	result := ValidationResult{Valid: true, Errors: []string{}}

	// 1. Syntax check
	var workflow map[string]interface{}
	err := yaml.Unmarshal([]byte(yamlContent), &workflow)
	if err != nil {
		result.Valid = false
		result.Errors = append(result.Errors, "Syntax Error: "+err.Error())
		return result
	}

	// 2. DAG check (only for GitHub Actions for simplicity in this implementation)
	jobsRaw, ok := workflow["jobs"].(map[string]interface{})
	if ok {
		jobs := make(map[string]Node)
		for jobName, jobDataRaw := range jobsRaw {
			jobData, ok := jobDataRaw.(map[string]interface{})
			if !ok {
				continue
			}
			
			node := Node{Name: jobName, Needs: []string{}}
			needsRaw, hasNeeds := jobData["needs"]
			if hasNeeds {
				switch v := needsRaw.(type) {
				case []interface{}:
					for _, need := range v {
						if nStr, isStr := need.(string); isStr {
							node.Needs = append(node.Needs, nStr)
						}
					}
				case string:
					node.Needs = append(node.Needs, v)
				}
			}
			jobs[jobName] = node
		}

		// Check for missing dependencies
		for jobName, job := range jobs {
			for _, need := range job.Needs {
				if _, exists := jobs[need]; !exists {
					result.Valid = false
					result.Errors = append(result.Errors, "DAG Error: Job '"+jobName+"' needs '"+need+"' which does not exist")
				}
			}
		}

		// Simple Circular dependency check
		for startJob := range jobs {
			if hasCycle(jobs, startJob, make(map[string]bool), make(map[string]bool)) {
				result.Valid = false
				result.Errors = append(result.Errors, "DAG Error: Circular dependency detected involving job '"+startJob+"'")
				break
			}
		}
	} else if strings.Contains(yamlContent, "stages:") {
		// Basic GitLab CI check could go here
	}

	return result
}

func hasCycle(jobs map[string]Node, current string, visited, recStack map[string]bool) bool {
	if recStack[current] {
		return true
	}
	if visited[current] {
		return false
	}

	visited[current] = true
	recStack[current] = true

	for _, need := range jobs[current].Needs {
		if hasCycle(jobs, need, visited, recStack) {
			return true
		}
	}

	recStack[current] = false
	return false
}
