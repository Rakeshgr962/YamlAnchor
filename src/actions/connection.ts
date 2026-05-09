'use server';

// This Server Action now acts as a secure bridge to our actual Go Backend engine.

export async function connectToGithub(repoUrl: string, projectPath?: string, mainFile?: string) {
  console.log(`[FRONTEND] Bridging connection to Go Backend for repository: ${repoUrl}, path: ${projectPath || 'default'}, mainFile: ${mainFile || 'none'}`);
  
  try {
    // Call the real Go backend API running on port 8080
    const response = await fetch('http://localhost:8080/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ repoUrl, projectPath: projectPath || "", mainFile: mainFile || "" }),
      // cache: 'no-store' is important so Next.js doesn't cache the results
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Go Backend returned status ${response.status}`);
    }

    const data = await response.json();
    console.log(`[FRONTEND] Go Backend responded successfully:`, data);

    return data;
  } catch (error) {
    console.error(`[FRONTEND] Error connecting to Go Backend:`, error);
    return {
      success: false,
      message: "Failed to connect to the Go Backend. Is it running on port 8080?",
      error: String(error)
    };
  }
}

export async function listDirectory(projectPath: string) {
  try {
    const response = await fetch('http://localhost:8080/api/list-dir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath }),
      cache: 'no-store'
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function browseFolder() {
  try {
    const response = await fetch('http://localhost:8080/api/browse-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function deployYaml(projectPath: string, yamlContent: string) {
  try {
    const response = await fetch('http://localhost:8080/api/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath, yamlContent }),
      cache: 'no-store'
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function simulateYaml(yamlContent: string) {
  try {
    const response = await fetch('http://localhost:8080/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ yamlContent }),
      cache: 'no-store'
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function scanYaml(yamlContent: string) {
  try {
    const response = await fetch('http://localhost:8080/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ yamlContent }),
      cache: 'no-store'
    });
    return await response.json();
  } catch (error) {
    return { clean: false, issues: [{ message: String(error), severity: 'CRITICAL' }] };
  }
}

export async function validateYaml(yamlContent: string) {
  try {
    const response = await fetch('http://localhost:8080/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ yamlContent }),
      cache: 'no-store'
    });
    return await response.json();
  } catch (error) {
    return { valid: false, errors: [String(error)] };
  }
}

export async function improveYaml(yamlContent: string, maxIterations: number = 3) {
  try {
    const response = await fetch('http://localhost:8080/api/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ yamlContent, maxIterations }),
      cache: 'no-store'
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function saveAsYaml(yamlContent: string) {
  try {
    const response = await fetch('http://localhost:8080/api/save-as', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ yamlContent }),
      cache: 'no-store'
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function cloneRepository(repoUrl: string) {
  try {
    const response = await fetch('http://localhost:8080/api/clone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl }),
      cache: 'no-store'
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function testLocal(yamlContent: string, iteration: number) {
  try {
    const response = await fetch('http://localhost:8080/api/test-local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ yamlContent, iteration }),
      cache: 'no-store'
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function addRunLog(payload: {
  name: string;
  status: string;
  duration: string;
  cycles: number;
  logs: string[];
}) {
  try {
    const response = await fetch('http://localhost:8080/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function fetchLogs() {
  try {
    const response = await fetch('http://localhost:8080/api/logs', { cache: 'no-store' });
    return await response.json();
  } catch {
    return [];
  }
}

export async function fetchLogDetails(id: number) {
  try {
    const response = await fetch(`http://localhost:8080/api/logs/${id}`, { cache: 'no-store' });
    return await response.json();
  } catch {
    return null;
  }
}
