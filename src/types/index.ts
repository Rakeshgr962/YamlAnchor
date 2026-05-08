// ─── YAML Core Types ───────────────────────────────────────────────────────

export interface YamlNode {
  id: string;
  key: string;
  value: unknown;
  anchor?: string;     // &anchor_name
  alias?: string;      // *alias_name
  line: number;
  column: number;
  type: 'scalar' | 'mapping' | 'sequence' | 'anchor' | 'alias';
  children?: YamlNode[];
}

// ─── Scan Result ───────────────────────────────────────────────────────────

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface SecretFinding {
  ruleId: string;
  description: string;
  severity: SeverityLevel;
  file: string;
  line: number;
  match: string;        // redacted preview
}

export interface ScanResult {
  id: string;
  repoPath: string;
  scannedAt: string;    // ISO 8601
  filesScanned: number;
  anchorsFound: number;
  aliasesFound: number;
  secretsFound: SecretFinding[];
  nodes: YamlNode[];
  durationMs: number;
  status: 'idle' | 'scanning' | 'done' | 'error';
  error?: string;
}

// ─── WebSocket / Scanner Hook ───────────────────────────────────────────────

export type ScanPhase =
  | 'connecting'
  | 'indexing'
  | 'parsing'
  | 'resolving'
  | 'auditing'
  | 'done'
  | 'error';

export interface ScanProgress {
  phase: ScanPhase;
  percent: number;     // 0–100
  message: string;
  currentFile?: string;
}

export interface ScannerState {
  connected: boolean;
  progress: ScanProgress | null;
  result: ScanResult | null;
  error: string | null;
}

// ─── Connection / Repository ────────────────────────────────────────────────

export type ConnectionMethod = 'local' | 'github' | 'gitlab' | 'upload';

export interface RepoConnection {
  method: ConnectionMethod;
  path?: string;        // local filesystem path
  url?: string;         // remote git URL
  branch?: string;
  token?: string;       // PAT (never persisted in plaintext)
}

// ─── UI Shared ─────────────────────────────────────────────────────────────

export interface TechBadgeProps {
  label: string;
  icon?: string;
  variant?: 'default' | 'highlight' | 'muted';
}

export interface ConnectionCardProps {
  method: ConnectionMethod;
  title: string;
  description: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}
