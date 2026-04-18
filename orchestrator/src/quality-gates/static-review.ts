import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, resolve, dirname, extname } from "node:path";
import type { OrchestratorConfig } from "../config.js";

export type Severity = "blocker" | "warning" | "nitpick";

export interface StaticIssue {
  id: string;
  severity: Severity;
  category:
    | "placeholder_text"
    | "template_syntax"
    | "literal_icon"
    | "broken_link"
    | "deploy_path"
    | "accessibility"
    | "test_coverage"
    | "runtime_error"
    | "network_404";
  file: string;
  excerpt?: string;
  message: string;
}

export interface StaticReviewResult {
  pages: string[];
  blockers: StaticIssue[];
  warnings: StaticIssue[];
  nitpicks: StaticIssue[];
  llmInputs: { screenshots: string[] };
}

// Fallback list when the orchestrator can't tell us which dir the build wrote to.
// Covers Astro/Vite (dist), Next-export/Eleventy/Jekyll (out, _site), CRA/SvelteKit (build).
// Notably excludes `public/` (source dir in Astro/Vite/Vue) and `.next/` (build cache,
// not user-facing HTML) — both produce false positives.
const FALLBACK_BUILD_DIRS = ["dist", "build", "out", "_site", ".output/public"] as const;

const PLACEHOLDER_PATTERNS: Array<{ re: RegExp; message: string }> = [
  { re: /\{\{[^}]+\}\}/, message: "Unrendered template syntax {{...}}" },
  { re: /\$ARGUMENTS\b/, message: "Literal $ARGUMENTS placeholder" },
  { re: /\blorem ipsum\b/i, message: "Lorem ipsum filler text" },
  // Dev markers like `TODO: ...` or `FIXME(name):` — the trailing punctuation
  // distinguishes them from user content that mentions the word TODO in prose.
  { re: /(?<![\w'"])(?:TODO|FIXME)\s*[:(]/, message: "TODO/FIXME marker visible in output" },
  { re: /\[(?:short duration|brief delay|base_points|placeholder)[^\]]*\]/i, message: "Unresolved spec placeholder" },
];

const BROKEN_URL_PATTERNS: Array<{ re: RegExp; message: string }> = [
  { re: /^https?:\/\/example\.com/i, message: "example.com placeholder URL" },
  { re: /^#todo$/i, message: "#todo placeholder anchor" },
  { re: /^javascript:\s*void/i, message: "javascript:void(...) stub" },
];

// Words that, when appearing as the sole text content, suggest a literal
// description of a missing icon/graphic (e.g. <span>Star Icon</span>).
const ICON_NOUN_RE = /^(?:[A-Z][a-z]+\s){0,3}(Icon|Arrow|Chevron|Logo|Star|Checkmark)$/;

export async function runStaticReview(
  config: Pick<OrchestratorConfig, "projectDir">,
  buildOutputDir?: string | null
): Promise<StaticReviewResult> {
  const dir = config.projectDir;

  // Prefer the output dir the orchestrator just discovered from the build.
  // Fall back to a small allowlist for standalone use (e.g. running review
  // against a project whose build output already exists).
  const buildRoot = buildOutputDir && existsSync(buildOutputDir)
    ? buildOutputDir
    : FALLBACK_BUILD_DIRS.map((d) => join(dir, d)).find((p) => existsSync(p));
  const pages = buildRoot ? collectHtml(buildRoot) : [];

  const issues: StaticIssue[] = [];
  let nextId = 1;
  const push = (issue: Omit<StaticIssue, "id">) => {
    issues.push({ ...issue, id: `REV-${String(nextId++).padStart(3, "0")}` });
  };

  // Detect deploy base from SEED.md (e.g. "/demos/greenfield/")
  const deployBase = detectDeployBase(dir);

  // Per-page checks
  const existingFiles = buildRoot ? collectAllFiles(buildRoot) : new Set<string>();
  for (const page of pages) {
    const html = readFileSync(page, "utf-8");
    const rel = relative(dir, page);
    scanPlaceholders(html, rel, push);
    scanLiteralIcons(html, rel, push);
    scanLinks(html, page, rel, buildRoot, existingFiles, deployBase, push);
    scanAccessibility(html, rel, push);
  }

  // Deploy-path cross-check: if SEED.md declares a deploy subpath,
  // verify built HTML references assets with the correct prefix.
  if (buildRoot && pages.length > 0 && deployBase) {
    scanDeployPath(pages, dir, deployBase, push);
  }

  // Test coverage cross-check
  scanTestCoverage(dir, push);

  // Runtime issues from Cypress (console errors, 404s)
  scanRuntimeIssues(dir, push);

  const blockers = issues.filter((i) => i.severity === "blocker");
  const warnings = issues.filter((i) => i.severity === "warning");
  const nitpicks = issues.filter((i) => i.severity === "nitpick");

  return {
    pages: pages.map((p) => relative(dir, p)),
    blockers,
    warnings,
    nitpicks,
    llmInputs: { screenshots: pickLlmScreenshots(dir) },
  };
}

/**
 * Run static review and write the authoritative review-status.json.
 * The LLM agent will later append advisory findings under `llmFindings`,
 * but `summary.staticBlockers` and `issues` are owned by static review.
 */
export async function writeStaticReviewStatus(
  config: Pick<OrchestratorConfig, "projectDir">,
  buildOutputDir?: string | null
): Promise<StaticReviewResult> {
  const result = await runStaticReview(config, buildOutputDir);
  const path = join(config.projectDir, "rootspec", "review-status.json");

  // Preserve llmFindings from a prior run if present (unlikely but safe)
  let prior: Record<string, unknown> = {};
  if (existsSync(path)) {
    try {
      prior = JSON.parse(readFileSync(path, "utf-8"));
    } catch {
      prior = {};
    }
  }

  const out = {
    lastReview: new Date().toISOString(),
    status: result.blockers.length === 0 ? "pass" : "fail",
    summary: {
      staticBlockers: result.blockers.length,
      staticWarnings: result.warnings.length,
      staticNitpicks: result.nitpicks.length,
      pagesScanned: result.pages.length,
    },
    issues: [...result.blockers, ...result.warnings, ...result.nitpicks],
    llmInputs: result.llmInputs,
    // Preserve prior LLM findings if the orchestrator is re-running static only
    ...(prior.llmFindings ? { llmFindings: prior.llmFindings } : {}),
  };

  writeFileSync(path, JSON.stringify(out, null, 2));
  return result;
}

// ---- helpers ----

function collectHtml(root: string): string[] {
  const out: string[] = [];
  const walk = (p: string) => {
    let entries: string[];
    try {
      entries = readdirSync(p);
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.startsWith(".") || e === "node_modules") continue;
      const full = join(p, e);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(full);
      else if (extname(full).toLowerCase() === ".html") out.push(full);
    }
  };
  walk(root);
  return out;
}

function collectAllFiles(root: string): Set<string> {
  const out = new Set<string>();
  const walk = (p: string) => {
    let entries: string[];
    try {
      entries = readdirSync(p);
    } catch {
      return;
    }
    for (const e of entries) {
      if (e === "node_modules") continue;
      const full = join(p, e);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(full);
      else out.add(resolve(full));
    }
  };
  walk(root);
  return out;
}

function scanPlaceholders(
  html: string,
  file: string,
  push: (i: Omit<StaticIssue, "id">) => void
): void {
  // Strip <script>/<style> blocks so we don't flag template literals in JS.
  const visible = stripScriptsAndStyles(html);
  for (const { re, message } of PLACEHOLDER_PATTERNS) {
    const match = visible.match(re);
    if (match) {
      push({
        severity: "blocker",
        category: re.source.includes("\\{\\{") ? "template_syntax" : "placeholder_text",
        file,
        excerpt: snippet(visible, match.index ?? 0, match[0].length),
        message,
      });
    }
  }
}

function scanLiteralIcons(
  html: string,
  file: string,
  push: (i: Omit<StaticIssue, "id">) => void
): void {
  // Match any element with only text content, where the text looks like
  // an icon description ("Star Icon", "Next Arrow"). Narrow to common
  // inline elements to avoid flagging legitimate headings.
  const re = /<(span|i|em|b|div)\b[^>]*>([^<>]{1,40})<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[2].trim();
    if (ICON_NOUN_RE.test(text)) {
      push({
        severity: "blocker",
        category: "literal_icon",
        file,
        excerpt: m[0],
        message: `Literal icon description "${text}" rendered as text`,
      });
    }
  }
}

function scanLinks(
  html: string,
  pageAbs: string,
  file: string,
  buildRoot: string | undefined,
  existingFiles: Set<string>,
  deployBase: string | null,
  push: (i: Omit<StaticIssue, "id">) => void
): void {
  const attrRe = /\b(href|src)\s*=\s*"([^"]*)"/gi;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(html)) !== null) {
    const attr = m[1].toLowerCase();
    const url = m[2];
    if (!url) continue;
    if (url.startsWith("data:") || url.startsWith("mailto:") || url.startsWith("tel:")) continue;

    for (const { re, message } of BROKEN_URL_PATTERNS) {
      if (re.test(url)) {
        push({
          severity: "blocker",
          category: "broken_link",
          file,
          excerpt: `${attr}="${url}"`,
          message,
        });
      }
    }

    // External URL — warn only (can't verify without network)
    if (/^https?:\/\//i.test(url)) {
      continue;
    }

    // Anchor / fragment only — accept
    if (url.startsWith("#")) continue;

    // Rooted absolute path — resolve against build root.
    // Try two strategies: (1) strip leading /, (2) strip the deploy base prefix.
    // A build with `base: '/demos/greenfield'` produces files at dist/_astro/foo.css
    // but references them as /demos/greenfield/_astro/foo.css.
    if (url.startsWith("/") && buildRoot) {
      const raw = url.split(/[?#]/)[0];
      const stripped = raw.replace(/^\/+/, "");
      if (!stripped) continue;

      // Try direct resolution (works for root-deploy builds)
      const abs1 = resolve(buildRoot, stripped);
      if (resolveFile(abs1, existingFiles)) continue;

      // Try stripping deploy base (works for subpath-deploy builds)
      if (deployBase && raw.startsWith(deployBase)) {
        const withoutBase = raw.slice(deployBase.length);
        const abs2 = resolve(buildRoot, withoutBase);
        if (resolveFile(abs2, existingFiles)) continue;
      }

      push({
        severity: "warning",
        category: "broken_link",
        file,
        excerpt: `${attr}="${url}"`,
        message: `Rooted ${attr} does not resolve within build output`,
      });
      continue;
    }
    if (url.startsWith("/")) continue;

    // Genuinely relative URL — try to resolve against the build root
    if (buildRoot) {
      const stripped = url.split(/[?#]/)[0];
      if (!stripped) continue;
      const abs = resolve(dirname(pageAbs), stripped);
      if (!existingFiles.has(abs) && !existingFiles.has(abs + ".html") && !existingFiles.has(join(abs, "index.html"))) {
        push({
          severity: "warning",
          category: "broken_link",
          file,
          excerpt: `${attr}="${url}"`,
          message: `Relative ${attr} does not resolve to a file in the build output`,
        });
      }
    }
  }
}

function scanAccessibility(
  html: string,
  file: string,
  push: (i: Omit<StaticIssue, "id">) => void
): void {
  // <img> without non-empty alt
  const imgRe = /<img\b([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(html)) !== null) {
    const attrs = m[1];
    if (!/\balt\s*=\s*"[^"]+"/i.test(attrs)) {
      push({
        severity: "warning",
        category: "accessibility",
        file,
        excerpt: m[0].slice(0, 120),
        message: "Image missing meaningful alt text",
      });
    }
  }

  // <div onclick=...> (non-semantic interactive)
  if (/<div\b[^>]*\bonclick\s*=/i.test(html)) {
    push({
      severity: "warning",
      category: "accessibility",
      file,
      message: "Non-semantic <div onclick> interactive element",
    });
  }
}

function scanTestCoverage(
  projectDir: string,
  push: (i: Omit<StaticIssue, "id">) => void
): void {
  const testsPath = join(projectDir, "rootspec", "tests-status.json");
  if (!existsSync(testsPath)) return;

  let tests: { stories?: Record<string, { status?: string }> };
  try {
    tests = JSON.parse(readFileSync(testsPath, "utf-8"));
  } catch {
    return;
  }
  const stories = tests.stories ?? {};

  const screenshotRoot = join(projectDir, "cypress", "screenshots");
  // If no screenshots dir exists at all, the run either never captured any
  // (test suite doesn't use the hook) or they were excluded from the working
  // tree. Either way, test_coverage warnings would be noise.
  if (!existsSync(screenshotRoot)) return;

  const existingNames = new Set(
    Array.from(collectAllFiles(screenshotRoot)).map((p) => relative(screenshotRoot, p))
  );
  if (existingNames.size === 0) return;

  for (const [id, meta] of Object.entries(stories)) {
    if (meta?.status !== "pass") continue;
    const hasShot = Array.from(existingNames).some((n) => n.includes(id));
    if (!hasShot) {
      push({
        severity: "warning",
        category: "test_coverage",
        file: `rootspec/tests-status.json`,
        message: `${id} passed but produced no screenshot — test may not exercise rendered UI`,
      });
    }
  }
}

/**
 * Cross-check SEED.md's deploy path against asset references in built HTML.
 * If SEED declares a subpath (e.g. `/demos/greenfield/`) but the HTML references
 * assets at root (`/_astro/foo.css`), the framework's base config is likely missing.
 */
function resolveFile(abs: string, existingFiles: Set<string>): boolean {
  return existingFiles.has(abs) || existingFiles.has(abs + ".html") || existingFiles.has(join(abs, "index.html"));
}

export function detectDeployBase(projectDir: string): string | null {
  const seedPath = join(projectDir, "SEED.md");
  if (!existsSync(seedPath)) return null;
  const seed = readFileSync(seedPath, "utf-8");
  const m = seed.match(
    /(?:deployed?\s+(?:to|at)|subpath|base\s*path)\s+[^\n]*?(\/[\w-]+(?:\/[\w-]+)+\/)/i
  );
  return m ? m[1] : null;
}

function scanDeployPath(
  pages: string[],
  projectDir: string,
  deployBase: string,
  push: (i: Omit<StaticIssue, "id">) => void
): void {
  const ASSET_PREFIXES = ["/_astro/", "/_next/", "/_app/", "/_nuxt/"];
  for (const page of pages) {
    const html = readFileSync(page, "utf-8");
    const rel = relative(projectDir, page);
    for (const prefix of ASSET_PREFIXES) {
      if (html.includes(prefix) && !html.includes(deployBase.replace(/\/$/, "") + prefix)) {
        push({
          severity: "blocker",
          category: "deploy_path",
          file: rel,
          excerpt: `Found "${prefix}" without "${deployBase}" prefix`,
          message: `Asset references use root paths but SEED.md declares deploy path "${deployBase}" — framework base path config likely missing`,
        });
        return;
      }
    }
  }
}

function scanRuntimeIssues(
  projectDir: string,
  push: (i: Omit<StaticIssue, "id">) => void
): void {
  const path = join(projectDir, "rootspec", "runtime-issues.json");
  if (!existsSync(path)) return;

  let issues: Array<{ type: string; test: string; message: string }>;
  try {
    issues = JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return;
  }
  if (!Array.isArray(issues) || issues.length === 0) return;

  // Dedup by message
  const seen = new Set<string>();
  for (const issue of issues) {
    const key = `${issue.type}:${issue.message}`;
    if (seen.has(key)) continue;
    seen.add(key);

    push({
      severity: "warning",
      category: issue.type === "network_404" ? "network_404" : "runtime_error",
      file: `test: ${issue.test}`,
      excerpt: issue.message.slice(0, 120),
      message: issue.type === "network_404"
        ? `Network request failed: ${issue.message}`
        : `Console error during test: ${issue.message}`,
    });
  }
}

function pickLlmScreenshots(projectDir: string): string[] {
  const root = join(projectDir, "cypress", "screenshots");
  if (!existsSync(root)) return [];
  const all = Array.from(collectAllFiles(root)).filter((p) => p.endsWith(".png"));
  if (all.length === 0) return [];

  // Group by story ID (US-{n}); within each group prefer the lowest AC number.
  // Cypress fullPage screenshots of the same route+state are byte-identical,
  // so hash-dedup catches single-page apps where every story renders the same view.
  const STORY_RE = /US-(\d+)/;
  const AC_RE = /AC-\d+-(\d+)/;

  type Pick = { abs: string; story: number; ac: number };
  const byStory = new Map<number, Pick>();
  for (const abs of all) {
    const sm = abs.match(STORY_RE);
    if (!sm) continue;
    const story = parseInt(sm[1], 10);
    const am = abs.match(AC_RE);
    const ac = am ? parseInt(am[1], 10) : Number.MAX_SAFE_INTEGER;
    const existing = byStory.get(story);
    if (!existing || ac < existing.ac) {
      byStory.set(story, { abs, story, ac });
    }
  }

  const orderedPicks = Array.from(byStory.values()).sort((a, b) => a.story - b.story);

  const seenHashes = new Set<string>();
  const picks: string[] = [];
  for (const { abs } of orderedPicks) {
    const hash = hashFile(abs);
    if (seenHashes.has(hash)) continue;
    seenHashes.add(hash);
    picks.push(relative(projectDir, abs));
    if (picks.length >= 3) break;
  }
  return picks;
}

function hashFile(path: string): string {
  return createHash("sha1").update(readFileSync(path)).digest("hex");
}

function stripScriptsAndStyles(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
}

function snippet(src: string, index: number, len: number): string {
  const start = Math.max(0, index - 20);
  const end = Math.min(src.length, index + len + 20);
  return src.slice(start, end).replace(/\s+/g, " ").trim();
}
